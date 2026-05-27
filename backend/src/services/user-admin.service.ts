import bcrypt from "bcrypt";
import { AppError } from "../types";
import { AdminCreateUserInput, UserListQueryInput } from "../config/user.schemas";
import {
  SafeUserFull,
  PaginatedUsers,
  DeleteUserResult,
} from "../types/user.types";
import {
  findUsers,
  findUserFullById,
  adminCreateUser,
  deleteUserById,
  usernameExists,
} from "../repositories/user-admin.repository";

const BCRYPT_ROUNDS = 10;

// ─── List users ───────────────────────────────────────────────────────────────

export async function listUsers(
  query: UserListQueryInput
): Promise<PaginatedUsers> {
  return findUsers({
    page: query.page,
    limit: query.limit,
    search: query.search,
    role: query.role,
  });
}

// ─── Create user (admin) ──────────────────────────────────────────────────────

export async function createUserAsAdmin(
  input: AdminCreateUserInput
): Promise<SafeUserFull> {
  const { username, password, role } = input;

  // Guard — username must be unique
  if (await usernameExists(username)) {
    throw new AppError(`Username "${username}" is already taken`, 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return adminCreateUser({ username, passwordHash, role });
}

// ─── Delete user ──────────────────────────────────────────────────────────────

export async function removeUser(
  targetId: string,
  requestingUserId: string
): Promise<DeleteUserResult> {
  // Prevent an admin from deleting their own account through this endpoint.
  // They would immediately lose access, which is almost always a mistake.
  if (targetId === requestingUserId) {
    throw new AppError(
      "You cannot delete your own account. Ask another admin.",
      400
    );
  }

  // Confirm the user actually exists before attempting delete
  const existing = await findUserFullById(targetId);
  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const deleted = await deleteUserById(targetId);
  if (!deleted) {
    // Shouldn't happen after the existence check, but guards the null
    throw new AppError("Failed to delete user", 500);
  }

  return deleted;
}
