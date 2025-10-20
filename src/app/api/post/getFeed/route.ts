// app/api/post/getFeed/route.ts

import { getFeedLogic } from "@/lib/feed";
import type { SortKey } from "@/lib/feed-types";
import { ALLOWED_SORT_KEYS } from "@/lib/feed-types";
import { NextResponse } from "next/server";

/**
 * 投稿のフィードを取得するAPIエンドポイント
 * 「複数ランダムキー + カーソル方式」のページネーションを実装
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. クエリパラメータの取得とバリデーション
    const limitParam = searchParams.get("limit");
    const sortByParam = searchParams.get("sort_by");
    const cursorParam = searchParams.get("cursor");
    const _moodTypesParam = searchParams.getAll("mood_type"); // 複数の mood_type を取得

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const cursor = cursorParam ? parseFloat(cursorParam) : undefined;

    // sort_by パラメータが指定されていないか、許可リストにない場合はエラー
    if (!sortByParam || !ALLOWED_SORT_KEYS.includes(sortByParam as SortKey)) {
      return NextResponse.json(
        {
          error: "A valid sort_by parameter is required (e.g., random_key_1).",
        },
        { status: 400 },
      );
    }
    const sortBy = sortByParam as SortKey;

    // 2. getFeedLogic を呼び出して、整形済みのデータを取得
    const apiResponse = await getFeedLogic(
      sortBy,
      limit,
      cursor,
      moodTypesParam.length > 0
        ? moodTypesParam
        : undefined
    );

    // 3. 最終的なJSONレスポンスを返す
    return NextResponse.json({
      posts: apiResponse.posts,
      nextPageState: {
        sortBy: sortBy,
        cursor: apiResponse.nextPageState.cursor,
      },
    });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the feed." },
      { status: 500 },
    );
  }
}
