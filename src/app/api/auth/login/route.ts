import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  createAuthSuccessResponse,
  generateToken,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Edge不可

/**
 * ログイン処理
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json();

    // バリデーション
    if (!name || !password) {
      return NextResponse.json(
        {
          error: "ユーザー名とパスワードは必須です",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 },
      );
    }

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        password: true,
        isValid: true,
        last_login_at: true,
      },
    });

    // ユーザーが存在しない場合
    if (!user) {
      return NextResponse.json(
        {
          error: "ユーザー名またはパスワードが間違っています",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      );
    }

    // アカウントが無効の場合
    if (!user.isValid) {
      return NextResponse.json(
        { error: "アカウントが無効です", code: "ACCOUNT_DISABLED" },
        { status: 401 },
      );
    }

    // パスワード検証
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "ユーザー名またはパスワードが間違っています",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 },
      );
    }

    // 最終ログイン時間を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // JWTトークン生成
    const token = generateToken({
      userId: user.id.toString(),
      name: user.name,
    });

    // 成功レスポンス + Cookieに保存
    const response = NextResponse.json(
      createAuthSuccessResponse(
        {
          id: user.id.toString(),
          name: user.name,
        },
        token,
      ),
    );
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
    });
    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
