import { pool } from "../config/db";
import { ReadyToInsertRow } from "../types/import.types";

// ─── Batch campaign name → UUID resolution ────────────────────────────────────

export async function findCampaignsByNames(
  names: string[]
): Promise<Map<string, string>> {
  if (names.length === 0) return new Map();

  const { rows } = await pool.query<{ id: string; name: string }>(
    `SELECT id, name
     FROM campaigns
     WHERE name = ANY($1)
       AND is_active = TRUE`,
    [names]
  );

  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(row.name, row.id);
  }
  return map;
}

// ─── Batch duplicate detection ────────────────────────────────────────────────

export interface DbDuplicates {
  emails: Set<string>;
  phones: Set<string>;
}

export async function findDuplicatesInDb(
  emails: string[],
  phones: string[]
): Promise<DbDuplicates> {
  const result: DbDuplicates = { emails: new Set(), phones: new Set() };

  if (emails.length === 0 && phones.length === 0) return result;

  const conditions: string[] = [];
  const params: string[][] = [];
  let idx = 1;

  if (emails.length > 0) {
    conditions.push(`LOWER(email) = ANY($${idx})`);
    params.push(emails.map((e) => e.toLowerCase()));
    idx++;
  }

  if (phones.length > 0) {
    conditions.push(`phone = ANY($${idx})`);
    params.push(phones);
  }

  const { rows } = await pool.query<{ email: string | null; phone: string | null }>(
    `SELECT email, phone
     FROM customers
     WHERE ${conditions.join(" OR ")}`,
    params
  );

  for (const row of rows) {
    if (row.email) result.emails.add(row.email.toLowerCase());
    if (row.phone) result.phones.add(row.phone);
  }

  return result;
}

// ─── Bulk insert inside a PostgreSQL transaction ──────────────────────────────

export async function bulkInsertCustomers(
  rows: ReadyToInsertRow[]
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const row of rows) {
      await client.query(
        `INSERT INTO customers
           (first_name, last_name, phone, email, alternative_email,
            country, city, campaign_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          row.first_name,
          row.last_name,
          row.phone ?? null,
          row.email,
          row.alternative_email ?? null,
          row.country ?? null,
          row.city ?? null,
          row.campaign_id ?? null,
          row.created_by,
        ]
      );
    }

    await client.query("COMMIT");
    return rows.length;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
