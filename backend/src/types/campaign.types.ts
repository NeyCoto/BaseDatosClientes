// ─── Database row (matches campaigns table in 001_complete_schema.sql) ─────────

export interface CampaignRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;          // FK → users.id
  created_at: Date;
  updated_at: Date;
}

// ─── Query params for GET /api/campaigns ─────────────────────────────────────

export interface CampaignListQuery {
  page: number;
  limit: number;
  search: string | undefined;      // partial name match
  is_active: boolean | undefined;  // filter by active status
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedCampaigns {
  items: CampaignRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Repository params ────────────────────────────────────────────────────────

export interface CreateCampaignParams {
  name: string;
  description: string | undefined;
  is_active: boolean;
  created_by: string;
}

export interface UpdateCampaignParams {
  name: string;
  description: string | undefined;
  is_active: boolean;
}

// ─── Delete result ────────────────────────────────────────────────────────────

export interface DeleteCampaignResult {
  id: string;
  name: string;
}
