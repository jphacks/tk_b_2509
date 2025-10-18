import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWTシークレットの設定（環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWTトークンを生成する関数
 */
export function generateToken(payload: { userId: string | number; name: string }): string {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * JWTトークンを検証する関数
 */
export function verifyToken(token: string): { userId: string | number; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string | number; name: string };
  } catch (error) {
    return null;
  }
}

/**
 * リクエストヘッダーからトークンを抽出する関数
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * 認証エラー用のレスポンスを生成する関数
 */
export function createAuthErrorResponse(message: string = "認証が必要です") {
  return {
    error: message,
    code: "AUTH_REQUIRED"
  };
}

/**
 * 認証成功時のレスポンスを生成する関数
 */
export function createAuthSuccessResponse(user: { id: string | number; name: string }, token: string) {
  return {
    user: {
      id: user.id,
      name: user.name
    },
    token,
    expiresIn: JWT_EXPIRES_IN
  };
}
