import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

/**
 * 現在のユーザー情報取得API
 * GET /api/auth/me
 * 認証必須（Cookie もしくは Authorization ヘッダー）
 *
 * 成功時レスポンス例:
 * ```json
 * {
 *   "user": {
 *     "id": "123",
 *     "name": "Kevin",
 *     "avatar": "https://example.com/avatar.jpg"
 *   }
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);

  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(
      {
        error: "認証が必要です",
        code: "AUTH_REQUIRED",
      },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(authResult.user.userId),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "ユーザーが見つかりません",
          code: "USER_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error);
    return NextResponse.json(
      {
        error: "ユーザー情報の取得に失敗しました",
        code: "USER_INFO_FETCH_FAILED",
      },
      { status: 500 },
    );
  }
}
