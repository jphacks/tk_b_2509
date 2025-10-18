import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createAuthSuccessResponse,
  generateToken,
  hashPassword,
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

    // JWTトークン生成
    const token = generateToken({
      userId: newUser.id.toString(),
      name: newUser.name,
    });

    // 成功レスポンス
    return NextResponse.json(
      createAuthSuccessResponse(
        {
          id: newUser.id.toString(),
          name: newUser.name,
        },
        token,
      ),
    );
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
