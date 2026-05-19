import { Pool, PoolConfig } from "pg";
import { env } from "./env";

/**
 * Neon PostgreSQL requires SSL.
 * In development you may point to a local Postgres by omitting sslmode,
 * but the pool config below is safe for both environments.
 */
const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,

  ssl:
    env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }   // strict cert validation in prod
      : { rejectUnauthorized: false },  // relaxed in dev (self-signed certs)

  /* Tuned for a free-tier Neon project — adjust for larger plans */
  max: 10,              // maximum pool size
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
};

export const pool = new Pool(poolConfig);

/**
 * Call this once at startup to verify the DB is reachable before
 * accepting any HTTP traffic.
 */
export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("✅  PostgreSQL connected via Neon");
  } finally {
    client.release();
  }
}

/**
 * Gracefully close the pool.
 * Called during SIGTERM / SIGINT shutdown.
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log("🔌  PostgreSQL pool closed");
}
