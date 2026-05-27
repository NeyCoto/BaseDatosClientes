import jwt from "jsonwebtoken";
import { env } from "./env";
import { JwtPayload, UserRole } from "../types/auth.types";
import { AppError } from "../types";

// ─── Sign ─────────────────────────────────────────────────────────────────────

export function signToken(
  userId: string,
  username: string,
  role: UserRole
): string {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub: userId,
    username,
    role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired — please log in again", 401);
    }
    throw new AppError("Invalid token", 401);
  }
}

// ─── Extract Bearer token from Authorization header ───────────────────────────

export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authorization header missing. Expected: Bearer <token>", 401);
  }
  const token = authHeader.slice(7).trim();
  if (!token) throw new AppError("Token is empty", 401);
  return token;
}
