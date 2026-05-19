import bcrypt from "bcrypt";
import {
  SafeUser,
  LoginResult,
  RegisterResult,
  AuthTokens,
} from "../types/auth.types";
import { RegisterInput, LoginInput } from "../config/auth.schemas";
import { generateTokenPair, verifyRefreshToken } from "../config/jwt";
import {
  findUserByEmail,
  findUserById,
  userExistsByEmail,
  createUser,
} from "../repositories/user.repository";
import { AppError } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

// bcrypt cost factor — 12 is the production standard (balances security vs latency)
// Each increment doubles the hashing time: 12 ≈ 250ms, 13 ≈ 500ms
const BCRYPT_ROUNDS = 12;

// Generic message used for both "user not found" and "wrong password" to prevent
// user enumeration attacks (an attacker shouldn't know which part was wrong)
const INVALID_CREDENTIALS_MSG = "Invalid email or password";

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { name, email, password, role } = input;

  // 1. Check uniqueness
  const exists = await userExistsByEmail(email);
  if (exists) {
    throw new AppError("An account with this email already exists", 409);
  }

  // 2. Hash password — never store plain text
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Persist
  const user = await createUser({ name, email, passwordHash, role });

  // 4. Issue tokens immediately so the user is logged in after registering
  const tokens = generateTokenPair(user.id, user.email, user.role);

  return { user, tokens };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const { email, password } = input;

  // 1. Fetch full row — we need password_hash for comparison
  const userRow = await findUserByEmail(email);

  // 2. Use timing-safe comparison even when user doesn't exist to prevent
  //    timing attacks that reveal valid emails
  const dummyHash =
    "$2b$12$invalidhashfortimingsafety000000000000000000000000000";
  const hashToCompare = userRow?.password_hash ?? dummyHash;
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!userRow || !passwordMatches) {
    throw new AppError(INVALID_CREDENTIALS_MSG, 401);
  }

  // 3. Block deactivated accounts
  if (!userRow.is_active) {
    throw new AppError("This account has been deactivated", 403);
  }

  // 4. Build safe user (strip password_hash before sending to client)
  const user: SafeUser = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role,
    is_active: userRow.is_active,
    created_at: userRow.created_at,
  };

  // 5. Issue tokens
  const tokens = generateTokenPair(user.id, user.email, user.role);

  return { user, tokens };
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // 1. Verify the incoming refresh token (throws AppError if invalid/expired)
  const payload = verifyRefreshToken(refreshToken);

  // 2. Confirm the user still exists and is active
  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }
  if (!user.is_active) {
    throw new AppError("This account has been deactivated", 403);
  }

  // 3. Issue a fresh token pair (both access + refresh rotate)
  return generateTokenPair(user.id, user.email, user.role);
}

// ─── Get current user profile ─────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
