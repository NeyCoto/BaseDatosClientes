import { UserRole } from "./auth.types";

// ─── Updated SafeUser ─────────────────────────────────────────────────────────
// The schema now includes is_active and updated_at on the users table.
// This extended interface replaces the one in auth.types.ts for admin views.

export interface SafeUserFull {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─── Query params for GET /api/admin/users ────────────────────────────────────

export interface UserListQuery {
  page: number;
  limit: number;
  search: string | undefined;   // partial username match
  role: UserRole | undefined;   // filter by role
}

// ─── Paginated wrapper ────────────────────────────────────────────────────────

export interface PaginatedUsers {
  items: SafeUserFull[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Admin create user body ───────────────────────────────────────────────────

export interface AdminCreateUserBody {
  username: string;
  password: string;
  role: UserRole;
}

// ─── Delete result ────────────────────────────────────────────────────────────

export interface DeleteUserResult {
  id: string;
  username: string;
}
