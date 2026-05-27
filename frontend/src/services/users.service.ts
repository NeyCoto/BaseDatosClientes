import { api } from "./api";
import {
  ApiResponse,
  PaginatedUsers,
  CreateUserRequest,
  User,
  DeleteUserResponse,
  UserListParams,
} from "../types";

export async function getUsers(params: UserListParams): Promise<PaginatedUsers> {
  // Build query string — omit undefined/empty values
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.search) query["search"] = params.search;
  if (params.role)   query["role"]   = params.role;

  const { data } = await api.get<ApiResponse<PaginatedUsers>>(
    "/api/admin/users",
    { params: query }
  );
  return data.data;
}

export async function createUser(body: CreateUserRequest): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>("/api/admin/users", body);
  return data.data;
}

export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const { data } = await api.delete<ApiResponse<DeleteUserResponse>>(
    `/api/admin/users/${id}`
  );
  return data.data;
}
