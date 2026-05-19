// ─── API response envelope ────────────────────────────────────────────────────

/**
 * Every successful API response is wrapped in this shape.
 * `T` is the payload — e.g. ApiResponse<Customer> or ApiResponse<Customer[]>
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Every failed API response is wrapped in this shape.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[];
}

// ─── HTTP error ───────────────────────────────────────────────────────────────

/**
 * Throw this from anywhere in the app to produce a specific HTTP status code.
 * The error-handling middleware catches it and serialises it into ApiErrorResponse.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: string[];

  constructor(message: string, statusCode = 500, details?: string[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;

    // Required in TypeScript when extending built-in classes
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Express request augmentation ────────────────────────────────────────────

/**
 * Extend Express's Request type here as the project grows
 * (e.g. to attach a decoded JWT user after auth middleware).
 */
export interface RequestUser {
  id: string;
  email: string;
}

// Uncomment when you add authentication:
// declare global {
//   namespace Express {
//     interface Request {
//       user?: RequestUser;
//     }
//   }
// }
