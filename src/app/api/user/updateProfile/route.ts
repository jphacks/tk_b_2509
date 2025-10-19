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
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid name" },
        { status: 400 },
      );
    }

    // ユーザー名が既に使用されているか確認
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (
      existingUser &&
      existingUser.id !== BigInt(authResult.user.userId.toString())
    ) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    // ユーザー名を更新
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(authResult.user.userId.toString()) },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
      },
    });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 },
    );
  }
}
