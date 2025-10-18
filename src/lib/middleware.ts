import { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader, createAuthErrorResponse } from "./auth";

/**
 * 認証ミドルウェア関数
 * リクエストからJWTトークンを検証し、認証情報を返します
 */
export function authenticateRequest(request: NextRequest): {
  isAuthenticated: boolean;
  user?: { userId: string | number; name: string };
  error?: any;
} {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader || "");

    if (!token) {
      return {
        isAuthenticated: false,
        error: createAuthErrorResponse("認証トークンがありません")
      };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        isAuthenticated: false,
        error: createAuthErrorResponse("無効な認証トークンです")
      };
    }

    return {
      isAuthenticated: true,
      user: decoded
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: createAuthErrorResponse("認証処理でエラーが発生しました")
    };
  }
}

/**
 * 認証必須のAPIルートで使用するヘルパー関数
 * 認証されていない場合は401エラーを返します
 */
export function requireAuth(request: NextRequest): {
  user: { userId: string | number; name: string };
} | Response {
  const authResult = authenticateRequest(request);

  if (!authResult.isAuthenticated) {
    return new Response(JSON.stringify(authResult.error), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  return { user: authResult.user! };
}
