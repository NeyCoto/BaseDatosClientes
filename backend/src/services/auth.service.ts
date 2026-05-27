import bcrypt from "bcrypt";
import { SafeUser, LoginResult } from "../types/auth.types";
import { RegisterInput, LoginInput } from "../config/auth.schemas";
import { signToken } from "../config/jwt";
import {
  findUserByUsername,
  findUserById,
  usernameExists,
  createUser,
} from "../repositories/user.repository";
import { AppError } from "../types";

const BCRYPT_ROUNDS = 10; // 10 is solid for a university project (~100ms)

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput): Promise<LoginResult> {
  const { username, password, role } = input;

  if (await usernameExists(username)) {
    throw new AppError("Username is already taken", 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser({ username, passwordHash, role });
  const token = signToken(user.id, user.username, user.role);

  return { user, token };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const { username, password } = input;

  // Always run bcrypt.compare even if user not found — prevents timing attacks
  const userRow = await findUserByUsername(username);
  const dummyHash = "$2b$10$invalidhashfortimingsafetyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  const hashToCompare = userRow?.password_hash ?? dummyHash;

  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!userRow || !passwordMatches) {
    throw new AppError("Invalid username or password", 401);
  }

  const user: SafeUser = {
    id: userRow.id,
    username: userRow.username,
    role: userRow.role,
    created_at: userRow.created_at,
  };

  const token = signToken(user.id, user.username, user.role);
  return { user, token };
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await findUserById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
}
