import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWTシークレットの設定（環境変数から取得）
const JWT_SECRET_FROM_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const AUTH_COOKIE_NAME = "jwt";

const AUTH_COOKIE_BASE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

// `jsonwebtoken` の `expiresIn` とCookieのmaxAgeを整合させる
function expiresInToMaxAge(value: jwt.SignOptions["expiresIn"]): number | null {
  if (typeof value === "number") {
    return value;
  }

  const match = /^(\d+)([dhms])$/.exec(value);
  if (!match) {
    return null;
  }

  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return amount * 60 * 60 * 24;
    case "h":
      return amount * 60 * 60;
    case "m":
      return amount * 60;
    case "s":
      return amount;
    default:
      return null;
  }
}

function resolveJwtSecret(): string {
  if (JWT_SECRET_FROM_ENV) {
    return JWT_SECRET_FROM_ENV;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET environment variable must be set in production.",
    );
  }
  return "development-secret";
}

// JWT_EXPIRES_INのバリデーション（数値または文字列 "d", "h", "m", "s" を含むかチェック）
function validateExpiresIn(value: string): jwt.SignOptions["expiresIn"] {
  // 数値の場合はそのまま返す
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  // 1d, 7d, 12h, 30m, 45s などの形式を許可
  if (/^\d+[dhms]$/.test(value)) {
    return value as jwt.SignOptions["expiresIn"];
  }
  // デフォルト値
  return "7d";
}

const validatedExpiresIn = validateExpiresIn(JWT_EXPIRES_IN);
const resolvedCookieMaxAge =
  expiresInToMaxAge(validatedExpiresIn) ?? DEFAULT_COOKIE_MAX_AGE_SECONDS;

export const AUTH_COOKIE_OPTIONS = Object.freeze({
  ...AUTH_COOKIE_BASE_OPTIONS,
  maxAge: resolvedCookieMaxAge,
});

/**
 * パスワードをハッシュ化する関数
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * パスワードを検証する関数
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWTトークンを生成する関数
 */
export function generateToken(payload: {
  userId: string | number;
  name: string;
}): string {
  const options: jwt.SignOptions = {
    expiresIn: validatedExpiresIn,
  };
  return jwt.sign(payload, resolveJwtSecret(), options);
}

/**
 * JWTトークンを検証する関数
 */
export function verifyToken(
  token: string,
): { userId: string | number; name: string } | null {
  try {
    return jwt.verify(token, resolveJwtSecret()) as {
      userId: string | number;
      name: string;
    };
  } catch (_error) {
    return null;
  }
}

/**
 * 認証エラー用のレスポンスを生成する関数
 */
export function createAuthErrorResponse(message: string = "認証が必要です") {
  return {
    error: message,
    code: "AUTH_REQUIRED",
  };
}

type AuthUser = {
  id: string;
  name: string;
};

/**
 * 認証成功時のレスポンスを生成する関数
 */
export function createAuthSuccessResponse(user: AuthUser, token: string) {
  return {
    token,
    user,
  };
}

/**
 * AuthorizationヘッダーからBearerトークンを抽出する関数
 */
export function extractTokenFromHeader(
  header: string | null | undefined,
): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}
