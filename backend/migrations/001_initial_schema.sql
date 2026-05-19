-- Migration: 001_initial_schema
-- Run this manually against your Neon database once.
-- Future migrations: 002_..., 003_... (always append, never modify old files)

-- Enable UUID generation (Neon supports this by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Customers table (scaffold — expand in the next milestone)
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  phone       VARCHAR(50),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Basic index on email for fast lookup
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
