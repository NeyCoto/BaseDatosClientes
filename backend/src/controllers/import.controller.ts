import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError, ApiResponse } from "../types";
import { processExcelImport, IMPORT_LIMITS } from "../services/import.service";
import { ImportResult } from "../types/import.types";

// ─── Multer configuration ─────────────────────────────────────────────────────
// Store file in memory — no temp files on disk.

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  // Extension check only — MIME type is intentionally not used as the primary
  // guard. Postman, browsers, and different OS configurations commonly send
  // .xlsx files as "application/octet-stream" instead of the official MIME type.
  // The xlsx.read() call in the service acts as the real content validation —
  // any file that is not a valid xlsx binary will fail to parse there.
  const allowedExtensions = /\.xlsx$/i;

  if (allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only .xlsx files are accepted.",
        400
      ) as unknown as Error
    );
  }
};

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMPORT_LIMITS.MAX_FILE_SIZE_BYTES },
  fileFilter,
}).single("file"); // field name in multipart/form-data must be "file"

// ─── Multer error wrapper ─────────────────────────────────────────────────────
// Multer calls next(err) with its own error types — convert to AppError so the
// central error handler formats them consistently.

export function handleMulterError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(
        new AppError(
          `File exceeds the maximum allowed size of ${
            IMPORT_LIMITS.MAX_FILE_SIZE_BYTES / 1024 / 1024
          } MB`,
          400
        )
      );
      return;
    }
    next(new AppError(`File upload error: ${err.message}`, 400));
    return;
  }
  next(err);
}

// ─── POST /api/customers/import ───────────────────────────────────────────────

export async function importCustomersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError(
        "No file provided. Send an .xlsx file in the 'file' field of a multipart/form-data request.",
        400
      );
    }

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result: ImportResult = await processExcelImport(
      req.file.buffer,
      req.file.size,
      req.user.id
    );

    const hasErrors = result.errors.length > 0;

    const body: ApiResponse<ImportResult> = {
      success: true,
      data: result,
      message: hasErrors
        ? `Import failed: ${result.failed} validation error(s) found. No records were inserted.`
        : `${result.imported} customer(s) imported successfully.`,
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
