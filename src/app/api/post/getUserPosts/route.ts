import { getUserPostsLogic } from "@/lib/feed";
import { authenticateRequest } from "@/lib/middleware";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // 認証確認
  const authResult = authenticateRequest(request);

  if (!authResult.isAuthenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // クエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50,
    ); // 1〜50件の範囲
    const cursorParam = searchParams.get("cursor");
    const cursor = cursorParam ? parseInt(cursorParam, 10) : undefined;

    // ユーザーの投稿を取得
    const result = await getUserPostsLogic(
      authResult.user.userId,
      limit,
      cursor,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 },
    );
  }
}
