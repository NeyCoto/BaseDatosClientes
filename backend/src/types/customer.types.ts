// ─── Database row (matches customers table after migration 003) ───────────────

export interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  alternative_email: string | null;
  country: string | null;
  city: string | null;
  campaign_id: string | null;   // FK → campaigns.id (nullable, SET NULL on delete)
  created_by: string | null;    // FK → users.id (nullable — added in migration 002)
  created_at: Date;
  updated_at: Date;
}

// ─── Extended row with joined campaign name for list views ────────────────────

export interface CustomerWithCampaign extends CustomerRow {
  campaign_name: string | null;
}

// ─── Query params for GET /api/customers ─────────────────────────────────────

export interface CustomerListQuery {
  page: number;
  limit: number;
  search: string | undefined;       // partial first_name / last_name / email / phone match
  campaign_id: string | undefined;  // filter by campaign
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedCustomers {
  items: CustomerWithCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Repository params ────────────────────────────────────────────────────────

export interface CreateCustomerParams {
  first_name: string;
  last_name: string;
  phone: string | undefined;
  email: string;
  alternative_email: string | undefined;
  country: string | undefined;
  city: string | undefined;
  campaign_id: string | undefined;
  created_by: string;
}

export interface UpdateCustomerParams {
  first_name: string;
  last_name: string;
  phone: string | undefined;
  email: string;
  alternative_email: string | undefined;
  country: string | undefined;
  city: string | undefined;
  campaign_id: string | undefined;
}

// ─── Delete result ────────────────────────────────────────────────────────────

export interface DeleteCustomerResult {
  id: string;
  first_name: string;
  last_name: string;
}
