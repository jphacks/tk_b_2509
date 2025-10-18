import { ALLOWED_SORT_KEYS, FormattedPost, SortKey } from '@/lib/feed-types';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * 投稿のフィードを取得するAPIエンドポイント
 * 「複数ランダムキー + カーソル方式」のページネーションを実装
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. クエリパラメータの取得とバリデーション
    const limitParam = searchParams.get('limit');
    const sortByParam = searchParams.get('sort_by');
    const cursorParam = searchParams.get('cursor');

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const cursor = cursorParam ? parseFloat(cursorParam) : undefined;
    
    // sort_by パラメータが指定されていないか、許可リストにない場合はエラー
    if (!sortByParam || !ALLOWED_SORT_KEYS.includes(sortByParam as SortKey)) {
      return NextResponse.json(
        { error: 'A valid sort_by parameter is required (e.g., random_key_1).' },
        { status: 400 }
      );
    }
    const sortBy = sortByParam as SortKey;

    // 2. データベースから投稿を取得
    // limit + 1 件取得することで、次のページが存在するかを判定する
    const posts = await prisma.post.findMany({
      take: limit + 1,
      where: cursor
        ? { [sortBy]: { gt: cursor } } // カーソルが指定されている場合、その値より大きいものを取得
        : undefined,                  // 初回ロード時は条件なし
      orderBy: {
        [sortBy]: 'asc', // 指定されたキーで昇順ソート
      },
      select: {
        img: true,
      },
      include: {
        place: { // 投稿場所の情報を取得
          select: { name: true },
        },
        author: { // 投稿者の情報を取得
          select: { name: true, avatar: true },
        },
        _count: { // 関連モデルの件数を取得
          select: { reactions: true }, // この投稿へのリアクション数を取得
        },
      },
    });

    // 3. 次ページのカーソルを決定
    let nextCursor: number | null = null;
    if (posts.length > limit) {
      // limitより1件多く取得できた場合、次のページが存在する
      const lastPost = posts.pop(); // 余分な1件を配列から削除
      if (lastPost) {
        // 実際のフィールド名でソートキーを取得（例: idを数値に変換）
        nextCursor = Number(lastPost.id); // IDを数値として次のカーソルとする
      }
    }

    // 4. フロントエンドのコンポーネント形式にデータを整形
    const formattedPosts: FormattedPost[] = posts.map((post) => {      
      return {
        id: post.id.toString(), // IDは文字列に変換
        placeName: post.place.name,
        moodType: post.mood_type,
        reviewText: post.contents,
        imageUrl: post.img,
        reactionCount: post._count.reactions,
        userAvatarUrl: post.author.avatar, // post.author.avatar はスキーマ定義(String?)により元からnullを返す可能性があります
        userAvatarFallback: post.author.name.charAt(0),
        username: post.author.name,
      };
    });

    // 5. 最終的なJSONレスポンスを返す
    return NextResponse.json({
      posts: formattedPosts,
      nextPageState: {
        sortBy: sortBy,
        cursor: nextCursor,
      },
    });

  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the feed.' },
      { status: 500 }
    );
  }
}
