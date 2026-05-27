import axios, { AxiosError } from "axios";
import { storage } from "../utils/storage";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ─── Request interceptor — attach token automatically ─────────────────────────

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 globally ───────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Extract error message from backend ApiErrorResponse ─────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; details?: string[] }
      | undefined;
    if (data?.details && data.details.length > 0) {
      return data.details.join(". ");
    }
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  return "An unexpected error occurred";
}
