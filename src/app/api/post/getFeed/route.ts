// app/api/post/getFeed/route.ts

import { getFeedLogic } from '@/lib/feed';
import { ALLOWED_SORT_KEYS, SortKey } from '@/lib/feed-types';
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

    // 2. 分離したコアロジックを呼び出す
    const result = await getFeedLogic(sortBy, limit, cursor);

    // 3. 結果をJSONで返す
    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to fetch feed via API:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the feed.' },
      { status: 500 }
    );
  }
}