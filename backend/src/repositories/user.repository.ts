import { pool } from "../config/db";
import { UserRow, SafeUser, UserRole } from "../types/auth.types";

// Reusable column list — never select password_hash except for login
const SAFE_COLUMNS = `id, username, role, created_at`;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findUserByUsername(username: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, username, password_hash, role, created_at
     FROM users
     WHERE username = $1
     LIMIT 1`,
    [username]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  const { rows } = await pool.query<SafeUser>(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function usernameExists(username: string): Promise<boolean> {
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) AS exists`,
    [username]
  );
  return rows[0]?.exists ?? false;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface CreateUserParams {
  username: string;
  passwordHash: string;
  role: UserRole;
}

export async function createUser(params: CreateUserParams): Promise<SafeUser> {
  const { username, passwordHash, role } = params;

  const { rows } = await pool.query<SafeUser>(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING ${SAFE_COLUMNS}`,
    [username, passwordHash, role]
  );

  const user = rows[0];
  if (!user) throw new Error("INSERT returned no rows");
  return user;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function findAllUsers(): Promise<SafeUser[]> {
  const { rows } = await pool.query<SafeUser>(
    `SELECT ${SAFE_COLUMNS} FROM users ORDER BY created_at DESC`
  );
  return rows;
}
