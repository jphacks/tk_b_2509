import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWTシークレットの設定（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production.");
}

const JWT_SECRET_FALLBACK = JWT_SECRET ?? "development-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// JWT_EXPIRES_INのバリデーション（数値または文字列 "d", "h", "m", "s" を含むかチェック）
function validateExpiresIn(value: string): string | number {
  // 数値の場合はそのまま返す
  if (/^\d+$/.test(value)) {
    return Number(value);
  }
  // 1d, 7d, 12h, 30m, 45s などの形式を許可
  if (/^\d+[dhms]$/.test(value)) {
    return value;
  }
  // デフォルト値
  return "7d";
}

const validatedExpiresIn: string | number = validateExpiresIn(JWT_EXPIRES_IN);

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
  return jwt.sign(payload, JWT_SECRET_FALLBACK, options);
}

/**
 * JWTトークンを検証する関数
 */
export function verifyToken(
  token: string,
): { userId: string | number; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET_FALLBACK) as {
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
