import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema, refreshSchema } from "../config/auth.schemas";
import {
  registerUser,
  loginUser,
  refreshTokens,
  getCurrentUser,
} from "../services/auth.service";
import { ApiResponse } from "../types";
import {
  SafeUser,
  AuthTokens,
  LoginResult,
  RegisterResult,
} from "../types/auth.types";
import { AppError } from "../types";

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Zod parses AND validates — throws ZodError (caught by errorHandler) on failure
    const input = registerSchema.parse(req.body);
    const result: RegisterResult = await registerUser(input);

    const body: ApiResponse<RegisterResult> = {
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

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens: AuthTokens = await refreshTokens(refreshToken);

    const body: ApiResponse<AuthTokens> = {
      success: true,
      data: tokens,
      message: "Tokens refreshed successfully",
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Protected — requires authenticate middleware on the route

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      // Should never reach here if authenticate middleware is applied
      throw new AppError("Authentication required", 401);
    }

    const user: SafeUser = await getCurrentUser(req.user.id);

    const body: ApiResponse<SafeUser> = {
      success: true,
      data: user,
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
//
// Stateless JWT logout — instructs the client to discard its tokens.
// For true server-side invalidation you would add a token blocklist
// (Redis is ideal for this). That's noted here as a future upgrade path.

export function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const body: ApiResponse<null> = {
      success: true,
      data: null,
      message:
        "Logged out successfully. Please discard your tokens on the client.",
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
