// ─── User roles ───────────────────────────────────────────────────────────────

export const USER_ROLES = ["admin", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── Database row shape (matches your existing `users` table) ─────────────────

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─── Safe user — never expose password_hash to the client ────────────────────

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

// ─── JWT payload — what gets encoded inside the token ────────────────────────

export interface JwtPayload {
  sub: string;      // user id (subject — standard JWT claim)
  email: string;
  role: UserRole;
  iat?: number;     // issued at  — added automatically by jsonwebtoken
  exp?: number;     // expiry     — added automatically by jsonwebtoken
}

// ─── Request bodies (validated by Zod; typed here for controller params) ──────

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;  // optional — defaults to "user" inside the service
}

export interface LoginBody {
  email: string;
  password: string;
}

// ─── Auth service return shapes ───────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: SafeUser;
  tokens: AuthTokens;
}

export interface RegisterResult {
  user: SafeUser;
  tokens: AuthTokens;
}

// ─── Augment Express Request so req.user is fully typed everywhere ────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
