import * as xlsx from "xlsx";
import { ZodError } from "zod";
import { AppError } from "../types";
import { importRowSchema } from "../config/import.schemas";
import {
  ExcelRow,
  EXPECTED_COLUMNS,
  ValidatedImportRow,
  ReadyToInsertRow,
  ImportRowError,
  ImportResult,
} from "../types/import.types";
import {
  findCampaignsByNames,
  findDuplicatesInDb,
  bulkInsertCustomers,
} from "../repositories/import.repository";

// ─── Limits ───────────────────────────────────────────────────────────────────

const MAX_ROWS = 1000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const IMPORT_LIMITS = { MAX_ROWS, MAX_FILE_SIZE_BYTES };

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function processExcelImport(
  fileBuffer: Buffer,
  fileSizeBytes: number,
  createdBy: string
): Promise<ImportResult> {

  // ── 1. File-level guards ───────────────────────────────────────────────────
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new AppError(
      `File exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`,
      400
    );
  }

  // ── 2. Parse Excel ────────────────────────────────────────────────────────
  let workbook: xlsx.WorkBook;
  try {
    workbook = xlsx.read(fileBuffer, { type: "buffer" });
  } catch {
    throw new AppError("File could not be parsed. Make sure it is a valid .xlsx file.", 400);
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new AppError("The Excel file contains no sheets.", 400);
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new AppError("Could not read the first sheet.", 400);
  }

  const rawRows = xlsx.utils.sheet_to_json<Record<string, string>>(worksheet, {
    raw: false,
    defval: "",
  });

  if (rawRows.length === 0) {
    throw new AppError("The Excel file has no data rows.", 400);
  }

  if (rawRows.length > MAX_ROWS) {
    throw new AppError(
      `The file contains ${rawRows.length} rows. Maximum allowed is ${MAX_ROWS}.`,
      400
    );
  }

  // ── 3. Validate column headers ────────────────────────────────────────────
  const fileColumns = Object.keys(rawRows[0] ?? {}).map((k) =>
    k.trim().toLowerCase()
  );

  const requiredColumns: (typeof EXPECTED_COLUMNS[number])[] = [
    "first_name",
    "last_name",
  ];

  const missingRequired = requiredColumns.filter(
    (col) => !fileColumns.includes(col)
  );

  if (missingRequired.length > 0) {
    throw new AppError(
      `Missing required column(s): ${missingRequired.join(", ")}. ` +
        `Expected columns: ${EXPECTED_COLUMNS.join(", ")}`,
      400
    );
  }

  const unknownColumns = fileColumns.filter(
    (col) => !(EXPECTED_COLUMNS as readonly string[]).includes(col)
  );

  if (unknownColumns.length > 0) {
    throw new AppError(
      `Unknown column(s) found: ${unknownColumns.join(", ")}. ` +
        `Expected columns: ${EXPECTED_COLUMNS.join(", ")}`,
      400
    );
  }

  // ── 4. Validate every row with Zod ────────────────────────────────────────
  const errors: ImportRowError[] = [];
  const validatedRows: ValidatedImportRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i] as Record<string, string>;
    const excelRowNumber = i + 2;

    const normalised: ExcelRow = {
      first_name: rawRow["first_name"]?.trim() || undefined,
      last_name:  rawRow["last_name"]?.trim()  || undefined,
      email:      rawRow["email"]?.trim()       || undefined,
      phone:      rawRow["phone"]?.trim()       || undefined,
      company:    rawRow["company"]?.trim()     || undefined,
      country:    rawRow["country"]?.trim()     || undefined,
      city:       rawRow["city"]?.trim()        || undefined,
      campaign:   rawRow["campaign"]?.trim()    || undefined,
    };

    const result = importRowSchema.safeParse(normalised);

    if (!result.success) {
      const zodError = result.error as ZodError;
      for (const issue of zodError.issues) {
        errors.push({
          row: excelRowNumber,
          field: issue.path[0]?.toString() ?? null,
          value: String(normalised[issue.path[0] as keyof ExcelRow] ?? ""),
          message: issue.message,
        });
      }
      continue;
    }

    validatedRows.push({
      rowNumber:    excelRowNumber,
      first_name:   result.data.first_name,
      last_name:    result.data.last_name,
      email:        result.data.email,
      phone:        result.data.phone,
      company:      result.data.company,
      country:      result.data.country,
      city:         result.data.city,
      campaignName: result.data.campaign,
    });
  }

  // ── 5. In-file duplicate detection ────────────────────────────────────────
  const seenEmails = new Map<string, number>();
  const seenPhones = new Map<string, number>();

  for (const row of validatedRows) {
    if (row.email) {
      const key = row.email.toLowerCase();
      const firstSeen = seenEmails.get(key);
      if (firstSeen !== undefined) {
        errors.push({
          row: row.rowNumber,
          field: "email",
          value: row.email,
          message: `Duplicate email in file (first seen at row ${firstSeen})`,
        });
      } else {
        seenEmails.set(key, row.rowNumber);
      }
    }

    if (row.phone) {
      const firstSeen = seenPhones.get(row.phone);
      if (firstSeen !== undefined) {
        errors.push({
          row: row.rowNumber,
          field: "phone",
          value: row.phone,
          message: `Duplicate phone in file (first seen at row ${firstSeen})`,
        });
      } else {
        seenPhones.set(row.phone, row.rowNumber);
      }
    }
  }

  // ── 6. DB duplicate detection ─────────────────────────────────────────────
  const emailsToCheck = validatedRows
    .filter((r) => r.email !== undefined)
    .map((r) => r.email as string);

  const phonesToCheck = validatedRows
    .filter((r) => r.phone !== undefined)
    .map((r) => r.phone as string);

  const dbDuplicates = await findDuplicatesInDb(emailsToCheck, phonesToCheck);

  for (const row of validatedRows) {
    if (row.email && dbDuplicates.emails.has(row.email.toLowerCase())) {
      errors.push({
        row: row.rowNumber,
        field: "email",
        value: row.email,
        message: "A customer with this email already exists in the database",
      });
    }

    if (row.phone && dbDuplicates.phones.has(row.phone)) {
      errors.push({
        row: row.rowNumber,
        field: "phone",
        value: row.phone,
        message: "A customer with this phone already exists in the database",
      });
    }
  }

  // ── 7. Campaign name → UUID resolution ───────────────────────────────────
  const uniqueCampaignNames = [
    ...new Set(
      validatedRows
        .filter((r) => r.campaignName !== undefined && r.campaignName.length > 0)
        .map((r) => r.campaignName as string)
    ),
  ];

  const campaignMap = await findCampaignsByNames(uniqueCampaignNames);

  for (const row of validatedRows) {
    if (row.campaignName && !campaignMap.has(row.campaignName)) {
      errors.push({
        row: row.rowNumber,
        field: "campaign",
        value: row.campaignName,
        message: `Campaign "${row.campaignName}" does not exist or is inactive`,
      });
    }
  }

  // ── 8. Stop if any errors ─────────────────────────────────────────────────
  if (errors.length > 0) {
    errors.sort((a, b) => a.row - b.row);
    return {
      totalRows: rawRows.length,
      imported: 0,
      failed: errors.length,
      errors,
    };
  }

  // ── 9. Build insert-ready rows ────────────────────────────────────────────
  const readyRows: ReadyToInsertRow[] = validatedRows.map((row) => ({
    rowNumber:         row.rowNumber,
    first_name:        row.first_name,
    last_name:         row.last_name,
    email:             row.email ?? "",
    phone:             row.phone,
    alternative_email: undefined,
    country:           row.country,
    city:              row.city,
    campaign_id:       row.campaignName
      ? campaignMap.get(row.campaignName)
      : undefined,
    created_by: createdBy,
  }));

  // ── 10. Bulk insert inside a transaction ──────────────────────────────────
  const inserted = await bulkInsertCustomers(readyRows);

  return {
    totalRows: rawRows.length,
    imported: inserted,
    failed: 0,
    errors: [],
  };
}
