import { pool } from "../config/db";
import {
  CampaignRow,
  CampaignListQuery,
  PaginatedCampaigns,
  CreateCampaignParams,
  UpdateCampaignParams,
  DeleteCampaignResult,
} from "../types/campaign.types";

// ─── Column selector ──────────────────────────────────────────────────────────
// Lists every column in the campaigns table explicitly.
// Keeps SELECT output predictable regardless of future schema additions.

const CAMPAIGN_COLUMNS = `
  id,
  name,
  description,
  is_active,
  created_by,
  created_at,
  updated_at
`;

// ─── List with search, filter, and pagination ─────────────────────────────────

export async function findCampaigns(
  query: CampaignListQuery
): Promise<PaginatedCampaigns> {
  const { page, limit, search, is_active } = query;
  const offset = (page - 1) * limit;

  // Build WHERE clauses dynamically — same pattern as user-admin.repository.ts
  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];
  let paramIndex = 1;

  if (search !== undefined && search.length > 0) {
    conditions.push(`name ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (is_active !== undefined) {
    conditions.push(`is_active = $${paramIndex}`);
    params.push(is_active);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM campaigns
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ${CAMPAIGN_COLUMNS}
    FROM campaigns
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Run both queries in parallel — same pattern as user-admin.repository.ts
  const [countResult, dataResult] = await Promise.all([
    pool.query<{ total: number }>(countQuery, params),
    pool.query<CampaignRow>(dataQuery, [...params, limit, offset]),
  ]);

  const total = countResult.rows[0]?.total ?? 0;

  return {
    items: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── Find one by ID ───────────────────────────────────────────────────────────

export async function findCampaignById(
  id: string
): Promise<CampaignRow | null> {
  const { rows } = await pool.query<CampaignRow>(
    `SELECT ${CAMPAIGN_COLUMNS}
     FROM campaigns
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function insertCampaign(
  params: CreateCampaignParams
): Promise<CampaignRow> {
  const { name, description, is_active, created_by } =
    params;

  const { rows } = await pool.query<CampaignRow>(
    `INSERT INTO campaigns
       (name, description, start_date, end_date, is_active, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${CAMPAIGN_COLUMNS}`,
    [
      name,
      description ?? null,
      is_active,
      created_by,
    ]
  );

  const campaign = rows[0];
  if (!campaign) throw new Error("INSERT returned no rows — this should never happen");
  return campaign;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCampaignById(
  id: string,
  params: UpdateCampaignParams
): Promise<CampaignRow | null> {
  const { name, description, is_active } = params;

  const { rows } = await pool.query<CampaignRow>(
    `UPDATE campaigns
     SET
       name        = $1,
       description = $2,
       start_date  = $3,
       end_date    = $4,
       is_active   = $5,
       updated_at  = NOW()
     WHERE id = $6
     RETURNING ${CAMPAIGN_COLUMNS}`,
    [
      name,
      description ?? null,
      is_active,
      id,
    ]
  );

  return rows[0] ?? null;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCampaignById(
  id: string
): Promise<DeleteCampaignResult | null> {
  const { rows } = await pool.query<DeleteCampaignResult>(
    `DELETE FROM campaigns
     WHERE id = $1
     RETURNING id, name`,
    [id]
  );
  return rows[0] ?? null;
}
