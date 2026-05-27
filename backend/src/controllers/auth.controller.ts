import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../config/auth.schemas";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service";
import { ApiResponse } from "../types";
import { AppError } from "../types";
import { SafeUser, LoginResult } from "../types/auth.types";

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result: LoginResult = await registerUser(input);

    const body: ApiResponse<LoginResult> = {
      success: true,
      data: result,
      message: "Account created successfully",
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result: LoginResult = await loginUser(input);

    const body: ApiResponse<LoginResult> = {
      success: true,
      data: result,
      message: "Login successful",
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user: SafeUser = await getCurrentUser(req.user.id);
    const body: ApiResponse<SafeUser> = { success: true, data: user };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
