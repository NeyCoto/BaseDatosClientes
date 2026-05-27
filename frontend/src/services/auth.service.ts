import { api } from "./api";
import { ApiResponse, LoginRequest, LoginResponse } from "../types";

export async function loginRequest(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/api/auth/login",
    credentials
  );
  return data.data;
}
