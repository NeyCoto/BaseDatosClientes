import { pool } from "../config/db";
import { UserRow, SafeUser, UserRole } from "../types/auth.types";

// ─── Column selector ──────────────────────────────────────────────────────────
// Used in every SELECT that returns a SafeUser — never select password_hash
// unless explicitly needed (e.g. login verification).

const SAFE_USER_COLUMNS = `
  id,
  email,
  name,
  role,
  is_active,
  created_at
`;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash, name, role, is_active, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  const { rows } = await pool.query<SafeUser>(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function userExistsByEmail(email: string): Promise<boolean> {
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists`,
    [email]
  );
  // noUncheckedIndexedAccess: rows[0] could be undefined — guard it
  return rows[0]?.exists ?? false;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface CreateUserParams {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export async function createUser(params: CreateUserParams): Promise<SafeUser> {
  const { name, email, passwordHash, role } = params;

  const { rows } = await pool.query<SafeUser>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SAFE_USER_COLUMNS}`,
    [name, email, passwordHash, role]
  );

  // INSERT … RETURNING always returns exactly one row
  const user = rows[0];
  if (!user) {
    throw new Error("INSERT returned no rows — this should never happen");
  }
  return user;
}

export async function updateUserActiveStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  await pool.query(
    `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2`,
    [isActive, id]
  );
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function findAllUsers(): Promise<SafeUser[]> {
  const { rows } = await pool.query<SafeUser>(
    `SELECT ${SAFE_USER_COLUMNS}
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
}

export async function updateUserRole(
  id: string,
  role: UserRole
): Promise<SafeUser | null> {
  const { rows } = await pool.query<SafeUser>(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING ${SAFE_USER_COLUMNS}`,
    [role, id]
  );
  return rows[0] ?? null;
}
