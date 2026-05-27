import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { AppError } from "../types";
import {
  adminCreateUserSchema,
  userListQuerySchema,
  userIdParamSchema,
} from "../config/user.schemas";
import {
  listUsers,
  createUserAsAdmin,
  removeUser,
} from "../services/user-admin.service";
import {
  SafeUserFull,
  PaginatedUsers,
  DeleteUserResult,
} from "../types/user.types";

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
// Query params: page, limit, search, role
// All params are optional — defaults handled by the Zod schema

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = userListQuerySchema.parse(req.query);
    const result: PaginatedUsers = await listUsers(query);

    const body: ApiResponse<PaginatedUsers> = {
      success: true,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/admin/users ────────────────────────────────────────────────────
// Body: { username, password, role }

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = adminCreateUserSchema.parse(req.body);
    const user: SafeUserFull = await createUserAsAdmin(input);

    const body: ApiResponse<SafeUserFull> = {
      success: true,
      data: user,
      message: `User "${user.username}" created successfully`,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────

export async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = userIdParamSchema.parse(req.params);

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const deleted: DeleteUserResult = await removeUser(id, req.user.id);

    const body: ApiResponse<DeleteUserResult> = {
      success: true,
      data: deleted,
      message: `User "${deleted.username}" deleted successfully`,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
