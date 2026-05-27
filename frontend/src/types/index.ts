// ─── Roles ────────────────────────────────────────────────────────────────────

export const USER_ROLES = ["admin", "general"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── API envelope — matches backend ApiResponse<T> ───────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[];
}

// ─── Auth — matches backend LoginResult ───────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// ─── Users — matches backend SafeUserFull + PaginatedUsers ───────────────────

export interface User {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface DeleteUserResponse {
  id: string;
  username: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "";
}

// ─── Auth context ─────────────────────────────────────────────────────────────

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
