import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE_NAME,
  createAuthSuccessResponse,
  createSessionMetadata,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
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

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const sessionId = randomUUID();
    const refreshToken = generateRefreshToken({
      userId: user.id.toString(),
      name: user.name,
      sessionId,
    });
    const accessToken = generateAccessToken({
      userId: user.id.toString(),
      name: user.name,
      sessionId,
    });
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip")?.trim() ??
      null;
    const { fingerprintHash, deviceLabel } = createSessionMetadata({
      userAgent: request.headers.get("user-agent"),
      ip: clientIp,
    });

    await prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        issued_at: new Date(),
        expires_at: refreshToken.expiresAt,
        last_used_at: new Date(),
        refresh_token_hash: hashToken(refreshToken.token),
        fingerprint_hash: fingerprintHash,
        device_label: deviceLabel,
      },
    });

    const response = NextResponse.json(
      createAuthSuccessResponse(
        {
          id: user.id.toString(),
          name: user.name,
        },
        accessToken,
      ),
    );
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken.token, {
      ...ACCESS_COOKIE_OPTIONS,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken.token, {
      ...REFRESH_COOKIE_OPTIONS,
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
