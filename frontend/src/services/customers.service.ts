import { api } from "./api";
import {
  ApiResponse,
  Customer,
  PaginatedCustomers,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  DeleteCustomerResponse,
  CustomerListParams,
  CustomerImportResult,
} from "../types";

export async function getCustomers(
  params: CustomerListParams
): Promise<PaginatedCustomers> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.search)      query["search"]      = params.search;
  if (params.campaign_id) query["campaign_id"] = params.campaign_id;

  const { data } = await api.get<ApiResponse<PaginatedCustomers>>(
    "/api/customers",
    { params: query }
  );
  return data.data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<ApiResponse<Customer>>(
    `/api/customers/${id}`
  );
  return data.data;
}

export async function createCustomer(
  body: CreateCustomerRequest
): Promise<Customer> {
  const { data } = await api.post<ApiResponse<Customer>>(
    "/api/customers",
    body
  );
  return data.data;
}

export async function updateCustomer(
  id: string,
  body: UpdateCustomerRequest
): Promise<Customer> {
  const { data } = await api.put<ApiResponse<Customer>>(
    `/api/customers/${id}`,
    body
  );
  return data.data;
}

export async function deleteCustomer(
  id: string
): Promise<DeleteCustomerResponse> {
  const { data } = await api.delete<ApiResponse<DeleteCustomerResponse>>(
    `/api/customers/${id}`
  );
  return data.data;
}

export async function importCustomers(
  file: File
): Promise<CustomerImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiResponse<CustomerImportResult>>(
    "/api/customers/import",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000,
    }
  );
  return data.data;
}
