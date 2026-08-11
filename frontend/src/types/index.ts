// ─── Roles ────────────────────────────────────────────────────────────────────

export const USER_ROLES = ["admin", "general"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─── API envelope ─────────────────────────────────────────────────────────────

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── Users ────────────────────────────────────────────────────────────────────

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

// ─── Campaigns ────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCampaigns {
  items: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface UpdateCampaignRequest {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

export interface DeleteCampaignResponse {
  id: string;
  name: string;
}

export interface CampaignListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: "true" | "false" | "";
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  alternative_email: string | null;
  country: string | null;
  city: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCustomers {
  items: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  alternative_email?: string;
  country?: string;
  city?: string;
  campaign_id?: string;
}

export interface UpdateCustomerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  alternative_email?: string;
  country?: string;
  city?: string;
  campaign_id?: string | null;
}

export interface DeleteCustomerResponse {
  id: string;
  first_name: string;
  last_name: string;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  campaign_id?: string | "";
}

// ─── Customer import ──────────────────────────────────────────────────────────

export interface CustomerImportError {
  row: number;
  field: string | null;
  value: string | null;
  message: string;
}

export interface CustomerImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: CustomerImportError[];
}
