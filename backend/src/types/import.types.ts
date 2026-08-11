import { CreateCustomerParams } from "./customer.types";

// ─── Raw row as parsed from Excel ─────────────────────────────────────────────

export interface ExcelRow {
  first_name: string | undefined;
  last_name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  company: string | undefined;
  country: string | undefined;
  city: string | undefined;
  campaign: string | undefined;
}

export const EXPECTED_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "company",
  "country",
  "city",
  "campaign",
] as const;

export type ExpectedColumn = (typeof EXPECTED_COLUMNS)[number];

// ─── A row that has passed field-level Zod validation ────────────────────────

export interface ValidatedImportRow {
  rowNumber: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | undefined;
  company: string | undefined;
  country: string | undefined;
  city: string | undefined;
  campaignName: string | undefined;
}

// ─── A row fully ready for DB insert ─────────────────────────────────────────

export interface ReadyToInsertRow extends CreateCustomerParams {
  rowNumber: number;
}

// ─── Single row error ─────────────────────────────────────────────────────────

export interface ImportRowError {
  row: number;
  field: string | null;
  value: string | null;
  message: string;
}

// ─── Final import result ──────────────────────────────────────────────────────

export interface ImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: ImportRowError[];
}
