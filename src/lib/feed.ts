import { ALLOWED_SORT_KEYS, type SortKey } from "./feed-types";
import type { MoodType } from "./post-types";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export interface PostData {
  id: number;
  placeId: number;
  placeName: string;
  moodType: MoodType;
  contents: string;
  imageUrl: string | null;
  reactionCount: number;
  userAvatarUrl: string | null;
  username: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse {
  posts: PostData[];
  nextPageState: {
    sortBy: string;
    cursor: number | null;
  };
}

// ---- 追加：POINT 解析の正規表現をモジュール定数に ----
const POINT_PATTERN = /POINT\s*\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)/;
export async function fetchPosts(
  sortKey: string | undefined,
  limit: number = 10,
  cursor: number | undefined = undefined,
  moodTypes?: string[]
): Promise<ApiResponse> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (sortKey) {
    params.append("sort_by", sortKey);
  }
  if (cursor !== undefined) {
    params.append("cursor", cursor.toString());
  }
  if (moodTypes && moodTypes.length > 0) {
    for (const moodType of moodTypes) {
      params.append("mood_type", moodType);
    }
  }

  const response = await fetch(`/api/post/getFeed?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export function getRandomSortKey(excludes: string[] = []): string {
  const filteredKeys = ALLOWED_SORT_KEYS.filter(
    (key) => !excludes.includes(key)
  );
  const randomIndex = Math.floor(Math.random() * filteredKeys.length);
  return filteredKeys[randomIndex];
}

export async function getFeedLogic(
  sortBy: SortKey,
  limit: number,
  cursor?: number
): Promise<ApiResponse> {
  // ---- 重要：ソートキーのバリデーション（識別子はパラメータ化できないため）----
  if (!ALLOWED_SORT_KEYS.includes(sortBy)) {
    throw new Error("Invalid sort key");
  }
  // カラム名は安全なリテラルとして挿入
  const col = Prisma.raw(`"${sortBy}"`);

  // ---- 重要：cursor の検証（数値前提のため）----
  if (cursor !== undefined && !Number.isFinite(cursor)) {
    throw new Error("Invalid cursor");
  }
  const parsedCursor = cursor as number | undefined;

  // ---- ここが核心：$queryRawUnsafe の撤去 → $queryRaw(Prisma.sql`...`) でパラメータ化 ----
  const postsFromDb = await prisma.$queryRaw<
    Array<{
      id: string;
      place_id: string;
      mood_type: string;
      contents: string;
      img: string | null;
      sort_key: number;
      place_name: string;
      geom_text: string;
      author_name: string;
      author_avatar: string | null;
      reaction_count: string;
    }>
  >(Prisma.sql`
    SELECT 
      p.id,
      p."placeId" as place_id,
      p.mood_type,
      p.contents,
      p.img,
      p.${col} as sort_key,
      pl.name as place_name,
      ST_AsText(pl.geom) as geom_text,
      u.name as author_name,
      u.avatar as author_avatar,
      COUNT(r.id) as reaction_count
    FROM "Post" p
    JOIN "Place" pl ON p."placeId" = pl.id
    JOIN "User"  u  ON p."authorId" = u.id
    LEFT JOIN "Reaction" r ON p.id = r."postId"
    ${
      parsedCursor !== undefined
        ? Prisma.sql`WHERE p.${col} > ${parsedCursor}`
        : Prisma.empty
    }
    GROUP BY p.id, pl.id, u.id
    ORDER BY p.${col} ASC
    LIMIT ${limit + 1}
  `);

  // 2. 次ページのカーソルを決定
  let nextCursor: number | null = null;
  let postsForResponse = postsFromDb;

  if (postsFromDb.length > limit) {
    const lastPost = postsFromDb[postsFromDb.length - 1];
    postsForResponse = postsFromDb.slice(0, limit);
    nextCursor = Number(lastPost.sort_key);
  }

  // 3. フロントエンド用に整形
  //    不正な POINT は [0,0] フォールバックをやめてスキップ（誤表示防止）
  const formattedPosts: PostData[] = postsForResponse
    .map((post) => {
      const match = POINT_PATTERN.exec(post.geom_text ?? "");
      if (!match) {
        // 解析できない座標はスキップ
        return null;
      }
      const longitude = Number(match[1]);
      const latitude = Number(match[2]);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return null;
      }

      return {
        id: Number(post.id),
        placeId: Number(post.place_id),
        placeName: post.place_name,
        moodType: post.mood_type as MoodType,
        contents: post.contents,
        imageUrl: post.img,
        reactionCount: Number(post.reaction_count),
        userAvatarUrl: post.author_avatar,
        username: post.author_name,
        latitude,
        longitude,
      } as PostData;
    })
    .filter((p): p is PostData => p !== null);

  return {
    posts: formattedPosts,
    nextPageState: {
      sortBy: sortBy,
      cursor: nextCursor,
    },
  };
}
