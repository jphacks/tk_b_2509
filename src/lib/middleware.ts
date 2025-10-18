import type { NextRequest } from "next/server";
import {
  createAuthErrorResponse,
  extractTokenFromHeader,
  verifyToken,
} from "./auth";

type AuthenticatedUser = {
  userId: string | number;
  name: string;
};

type AuthResult = {
  isAuthenticated: boolean;
  user?: AuthenticatedUser;
  error?: ReturnType<typeof createAuthErrorResponse>;
};

/**
 * 認証ミドルウェア関数
 * リクエストからJWTトークンを検証し、認証情報を返します
 */
export function authenticateRequest(request: NextRequest): AuthResult {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader || "");

    if (!token) {
      return {
        isAuthenticated: false,
        error: createAuthErrorResponse("認証トークンがありません"),
      };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        isAuthenticated: false,
        error: createAuthErrorResponse("無効な認証トークンです"),
      };
    }

    return {
      isAuthenticated: true,
      user: decoded,
    };
  } catch (_error) {
    return {
      isAuthenticated: false,
      error: createAuthErrorResponse("認証処理でエラーが発生しました"),
    };
  }
}

/**
 * 認証必須のAPIルートで使用するヘルパー関数
 * 認証されていない場合は401エラーを返します
 */
export function requireAuth(request: NextRequest): AuthResult {
  const authResult = authenticateRequest(request);

  if (!authResult.isAuthenticated) {
    return {
      isAuthenticated: false,
      error: authResult.error,
    };
  }

  return {
    isAuthenticated: true,
    user: authResult.user,
  };
}
