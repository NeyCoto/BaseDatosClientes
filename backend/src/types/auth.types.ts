// ─── Roles ────────────────────────────────────────────────────────────────────

export const USER_ROLES = ["admin", "general"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── Database row (matches your users table) ──────────────────────────────────

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

// ─── Safe user — password_hash never leaves the repository layer ──────────────

export interface SafeUser {
  id: string;
  username: string;
  role: UserRole;
  created_at: Date;
}

// ─── JWT payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;     // user id
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Request body shapes ──────────────────────────────────────────────────────

export interface RegisterBody {
  username: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  username: string;
  password: string;
}

// ─── Auth result ──────────────────────────────────────────────────────────────

export interface LoginResult {
  user: SafeUser;
  token: string;
}

// ─── Augment Express Request ──────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
