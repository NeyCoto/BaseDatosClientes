import { pool } from "../config/db";
import {
  CustomerRow,
  CustomerWithCampaign,
  CustomerListQuery,
  PaginatedCustomers,
  CreateCustomerParams,
  UpdateCustomerParams,
  DeleteCustomerResult,
} from "../types/customer.types";

// ─── Column selector ──────────────────────────────────────────────────────────

const CUSTOMER_COLUMNS = `
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  c.alternative_email,
  c.country,
  c.city,
  c.campaign_id,
  c.created_by,
  c.created_at,
  c.updated_at,
  camp.name AS campaign_name
`;

// ─── List with search, campaign filter, and pagination ────────────────────────

export async function findCustomers(
  query: CustomerListQuery
): Promise<PaginatedCustomers> {
  const { page, limit, search, campaign_id } = query;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];
  let paramIndex = 1;

  if (search !== undefined && search.length > 0) {
    conditions.push(
      `(c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (campaign_id !== undefined) {
    conditions.push(`c.campaign_id = $${paramIndex}`);
    params.push(campaign_id);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM customers c
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ${CUSTOMER_COLUMNS}
    FROM customers c
    LEFT JOIN campaigns camp ON c.campaign_id = camp.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query<{ total: number }>(countQuery, params),
    pool.query<CustomerWithCampaign>(dataQuery, [...params, limit, offset]),
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

export async function findCustomerById(
  id: string
): Promise<CustomerWithCampaign | null> {
  const { rows } = await pool.query<CustomerWithCampaign>(
    `SELECT ${CUSTOMER_COLUMNS}
     FROM customers c
     LEFT JOIN campaigns camp ON c.campaign_id = camp.id
     WHERE c.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function insertCustomer(
  params: CreateCustomerParams
): Promise<CustomerWithCampaign> {
  const {
    first_name,
    last_name,
    phone,
    email,
    alternative_email,
    country,
    city,
    campaign_id,
    created_by,
  } = params;

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO customers
       (first_name, last_name, phone, email, alternative_email,
        country, city, campaign_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      first_name,
      last_name,
      phone ?? null,
      email,
      alternative_email ?? null,
      country ?? null,
      city ?? null,
      campaign_id ?? null,
      created_by,
    ]
  );

  const row = rows[0];
  if (!row) throw new Error("INSERT returned no rows — this should never happen");

  const customer = await findCustomerById(row.id);
  if (!customer) throw new Error("Customer not found after INSERT");
  return customer;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCustomerById(
  id: string,
  params: UpdateCustomerParams
): Promise<CustomerWithCampaign | null> {
  const {
    first_name,
    last_name,
    phone,
    email,
    alternative_email,
    country,
    city,
    campaign_id,
  } = params;

  const { rows } = await pool.query<{ id: string }>(
    `UPDATE customers
     SET
       first_name        = $1,
       last_name         = $2,
       phone             = $3,
       email             = $4,
       alternative_email = $5,
       country           = $6,
       city              = $7,
       campaign_id       = $8,
       updated_at        = NOW()
     WHERE id = $9
     RETURNING id`,
    [
      first_name,
      last_name,
      phone ?? null,
      email,
      alternative_email ?? null,
      country ?? null,
      city ?? null,
      campaign_id ?? null,
      id,
    ]
  );

  if (!rows[0]) return null;
  return findCustomerById(id);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCustomerById(
  id: string
): Promise<DeleteCustomerResult | null> {
  const { rows } = await pool.query<DeleteCustomerResult>(
    `DELETE FROM customers
     WHERE id = $1
     RETURNING id, first_name, last_name`,
    [id]
  );
  return rows[0] ?? null;
}
