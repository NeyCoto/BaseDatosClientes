import { pool } from "../config/db";
import { UserRole } from "../types/auth.types";
import {
  SafeUserFull,
  PaginatedUsers,
  UserListQuery,
  DeleteUserResult,
} from "../types/user.types";

// ─── Column selector ──────────────────────────────────────────────────────────
// Matches the users table from 001_complete_schema.sql exactly.
// Never select password_hash outside of login.

const SAFE_FULL_COLUMNS = `
  id,
  username,
  role,
  is_active,
  created_at,
  updated_at
`;

// ─── List users with search, filter, and pagination ───────────────────────────

export async function findUsers(query: UserListQuery): Promise<PaginatedUsers> {
  const { page, limit, search, role } = query;
  const offset = (page - 1) * limit;

  // Build WHERE clauses dynamically — only add conditions that were requested
  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];
  let paramIndex = 1;

  if (search !== undefined && search.length > 0) {
    // ILIKE gives case-insensitive prefix/substring search
    conditions.push(`username ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role !== undefined) {
    conditions.push(`role = $${paramIndex}`);
    params.push(role);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Run count and data queries in parallel for performance
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM users
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ${SAFE_FULL_COLUMNS}
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query<{ total: number }>(countQuery, params),
    pool.query<SafeUserFull>(dataQuery, [...params, limit, offset]),
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

// ─── Find one user by ID (full shape with is_active + updated_at) ─────────────

export async function findUserFullById(
  id: string
): Promise<SafeUserFull | null> {
  const { rows } = await pool.query<SafeUserFull>(
    `SELECT ${SAFE_FULL_COLUMNS}
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ─── Create user (admin path — role is required, not optional) ────────────────

export interface AdminCreateUserParams {
  username: string;
  passwordHash: string;
  role: UserRole;
}

export async function adminCreateUser(
  params: AdminCreateUserParams
): Promise<SafeUserFull> {
  const { username, passwordHash, role } = params;

  const { rows } = await pool.query<SafeUserFull>(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING ${SAFE_FULL_COLUMNS}`,
    [username, passwordHash, role]
  );

  const user = rows[0];
  if (!user) throw new Error("INSERT returned no rows — this should never happen");
  return user;
}

// ─── Delete user ──────────────────────────────────────────────────────────────
// Returns the deleted user's id + username so the controller can confirm it.
// Returns null if no row matched (user didn't exist).

export async function deleteUserById(
  id: string
): Promise<DeleteUserResult | null> {
  const { rows } = await pool.query<DeleteUserResult>(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id, username`,
    [id]
  );
  return rows[0] ?? null;
}

// ─── Username uniqueness check ────────────────────────────────────────────────
// Reused by the service before INSERT to give a clean 409 error.

export async function usernameExists(username: string): Promise<boolean> {
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM users WHERE username = $1
     ) AS exists`,
    [username]
  );
  return rows[0]?.exists ?? false;
}
