import { authenticateRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  // 認証確認
  const authResult = authenticateRequest(request);

  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { avatar } = body;

    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json(
        { error: "Invalid avatar" },
        { status: 400 },
      );
    }

    // アバター画像を更新
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(authResult.user.userId.toString()) },
      data: { avatar },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 },
    );
  }
}
