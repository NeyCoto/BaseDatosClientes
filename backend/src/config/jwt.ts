import jwt from "jsonwebtoken";
import { env } from "./env";
import { JwtPayload, AuthTokens, UserRole } from "../types/auth.types";
import { AppError } from "../types";

// ─── Token configuration ──────────────────────────────────────────────────────

const ACCESS_TOKEN_EXPIRY = "15m";   // short-lived — exposed in memory/headers
const REFRESH_TOKEN_EXPIRY = "7d";   // long-lived — stored securely by the client

// ─── Sign ─────────────────────────────────────────────────────────────────────

export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateTokenPair(
  userId: string,
  email: string,
  role: UserRole
): AuthTokens {
  const payload: Omit<JwtPayload, "iat" | "exp"> = {
    sub: userId,
    email,
    role,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return decoded as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token has expired", 401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", 401);
    }
    throw new AppError("Token verification failed", 401);
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return decoded as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Refresh token has expired — please log in again", 401);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token", 401);
    }
    throw new AppError("Token verification failed", 401);
  }
}

// ─── Extract bearer token from Authorization header ───────────────────────────

export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      "Authorization header missing or malformed. Expected: Bearer <token>",
      401
    );
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AppError("Bearer token is empty", 401);
  }
  return token;
}
