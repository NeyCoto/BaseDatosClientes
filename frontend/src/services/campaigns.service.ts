import { api } from "./api";
import {
  ApiResponse,
  Campaign,
  PaginatedCampaigns,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  DeleteCampaignResponse,
  CampaignListParams,
} from "../types";

export async function getCampaigns(
  params: CampaignListParams
): Promise<PaginatedCampaigns> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.search)    query["search"]    = params.search;
  if (params.is_active) query["is_active"] = params.is_active;

  const { data } = await api.get<ApiResponse<PaginatedCampaigns>>(
    "/api/campaigns",
    { params: query }
  );
  return data.data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data } = await api.get<ApiResponse<Campaign>>(
    `/api/campaigns/${id}`
  );
  return data.data;
}

export async function createCampaign(
  body: CreateCampaignRequest
): Promise<Campaign> {
  const { data } = await api.post<ApiResponse<Campaign>>(
    "/api/campaigns",
    body
  );
  return data.data;
}

export async function updateCampaign(
  id: string,
  body: UpdateCampaignRequest
): Promise<Campaign> {
  const { data } = await api.put<ApiResponse<Campaign>>(
    `/api/campaigns/${id}`,
    body
  );
  return data.data;
}

export async function deleteCampaign(
  id: string
): Promise<DeleteCampaignResponse> {
  const { data } = await api.delete<ApiResponse<DeleteCampaignResponse>>(
    `/api/campaigns/${id}`
  );
  return data.data;
}

/**
 * Lightweight fetch for dropdowns — loads all active campaigns in one call.
 * Replaces the previous getCampaignsForSelect in campaigns.service.ts.
 */
export async function getCampaignsForSelect(): Promise<Campaign[]> {
  const { data } = await api.get<ApiResponse<PaginatedCampaigns>>(
    "/api/campaigns",
    { params: { page: 1, limit: 100, is_active: "true" } }
  );
  return data.data.items;
}
