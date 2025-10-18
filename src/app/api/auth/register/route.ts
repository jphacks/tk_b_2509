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
  hashPassword,
  hashToken,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Edge不可

/**
 * 新規ユーザー登録処理
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const { name, password, avatar, hometown } = await request.json();

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

    // パスワードの長さチェック
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "パスワードは6文字以上で入力してください",
          code: "PASSWORD_TOO_SHORT",
        },
        { status: 400 },
      );
    }

    // ユーザー名重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { name },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "このユーザー名は既に使用されています",
          code: "USERNAME_EXISTS",
        },
        { status: 409 },
      );
    }

    // パスワードハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザー作成
    const newUser = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        avatar: avatar || null,
        home_town: hometown || null,
        isValid: true,
        last_login_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        isValid: true,
        created_at: true,
        last_login_at: true,
      },
    });

    const sessionId = randomUUID();
    const refreshToken = generateRefreshToken({
      userId: newUser.id.toString(),
      name: newUser.name,
      sessionId,
    });
    const accessToken = generateAccessToken({
      userId: newUser.id.toString(),
      name: newUser.name,
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
        userId: newUser.id,
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
          id: newUser.id.toString(),
          name: newUser.name,
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
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
