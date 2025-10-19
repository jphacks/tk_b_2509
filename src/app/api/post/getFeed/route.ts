// app/api/post/getFeed/route.ts

import { getFeedLogic } from "@/lib/feed";
import { ALLOWED_SORT_KEYS, SortKey } from "@/lib/feed-types";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const cursor = cursorParam ? parseFloat(cursorParam) : undefined;

    // sort_by パラメータが指定されていないか、許可リストにない場合はエラー
    if (!sortByParam || !ALLOWED_SORT_KEYS.includes(sortByParam as SortKey)) {
      return NextResponse.json(
        {
          error: "A valid sort_by parameter is required (e.g., random_key_1).",
        },
        { status: 400 }
      );
    }
    const sortBy = sortByParam as SortKey;

    // 2. データベースから投稿を取得
    // limit + 1 件取得することで、次のページが存在するかを判定する
    const posts = (await prisma.post.findMany({
      take: limit + 1, // 次のページの存在確認のため +1 件取得
      where: cursor
        ? { [sortBy]: { gt: cursor } } // カーソル指定時は、その値より大きいものを取得
        : undefined, // 初回ロード時は条件なし
      orderBy: {
        [sortBy]: "asc", // 指定されたキーで昇順ソート
      },
      // 必要なフィールドとリレーションを select で明示的に指定
      select: {
        // Post 自体のフィールド
        id: true,
        mood_type: true,
        contents: true,
        img: true,
        [sortBy]: true, // ★重要: カーソル計算用にソートキーの値も取得

        // リレーション先のフィールド
        place: {
          select: { name: true }, // 場所名
        },
        author: {
          select: { name: true, avatar: true }, // 投稿者名とアバター
        },
        _count: {
          select: { reactions: true }, // リアクション数
        },
      },
    })) as unknown as Array<{
      id: bigint;
      mood_type: string;
      contents: string;
      img: string | null;
      random_key_1: number;
      random_key_2: number;
      random_key_3: number;
      random_key_4: number;
      random_key_5: number;
      place: { name: string };
      author: { name: string; avatar: string | null };
      _count: { reactions: number };
    }>;

    // 3. 次ページのカーソルを決定
    let nextCursor: number | null = null;
    let postsForResponse: typeof posts;

    if (posts.length > limit) {
      // limitより1件多く取得できた場合、次のページが存在する
      // 配列を変更せずに最後の要素を取得
      const lastPost = posts[posts.length - 1];
      // 次のページの判定用に配列をスライス（最後の要素を除く）
      postsForResponse = posts.slice(0, limit);

      if (lastPost) {
        // ★修正点: 次のカーソルは、ソートに使用したキー(random_key_x)の値にする
        nextCursor = lastPost[sortBy] as number;
      }
    } else {
      // 次のページがない場合はそのまま使用
      postsForResponse = posts;
    }

    // 4. フロントエンド用の形式（ご指定のJSON）にデータを整形
    const formattedPosts = postsForResponse.map((post) => {
      return {
        id: post.id.toString(), // BigInt を String に変換
        placeName: post.place.name,
        moodType: post.mood_type,
        contents: post.contents, // 'reviewText' から 'contents' に変更
        imageUrl: post.img, // null の可能性がある
        reactionCount: post._count.reactions,
        userAvatarUrl: post.author.avatar, // null の可能性がある
        username: post.author.name,
      };
    });

    // 5. 最終的なJSONレスポンスを返す
    return NextResponse.json({
      posts: formattedPosts,
      nextPageState: {
        sortBy: sortBy,
        cursor: nextCursor, // 次のページがない場合は null
      },
    });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the feed." },
      { status: 500 }
    );
  }
}
