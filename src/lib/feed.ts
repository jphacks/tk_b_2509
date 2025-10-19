import { ALLOWED_SORT_KEYS, type SortKey } from "./feed-types";
import type { MoodType } from "./post-types";
import { prisma } from "./prisma";

export interface PostData {
  id: number;
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

export async function fetchPosts(
  sortKey: string | undefined,
  limit: number = 10,
  cursor: number | undefined = undefined,
  moodTypes?: string[],
): Promise<ApiResponse> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  if (sortKey) {
    params.append("sort_by", sortKey);
  }
  if (cursor) {
    params.append("cursor", cursor.toString());
  }
  if (moodTypes && moodTypes.length > 0) {
    // 複数の mood_type をクエリパラメータに追加
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
  // 1. データベースから取得 - raw SQL で geom も取得
  let query: string;

  if (cursor !== undefined) {
    query = `
      SELECT 
        p.id,
        p.mood_type,
        p.contents,
        p.img,
        p."${sortBy}" as sort_key,
        pl.name as place_name,
        ST_AsText(pl.geom) as geom_text,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(r.id) as reaction_count
      FROM "Post" p
      JOIN "Place" pl ON p."placeId" = pl.id
      JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Reaction" r ON p.id = r."postId"
      WHERE p."${sortBy}" > ${cursor}
      GROUP BY p.id, pl.id, u.id
      ORDER BY p."${sortBy}" ASC
      LIMIT ${limit + 1}
    `;
  } else {
    query = `
      SELECT 
        p.id,
        p.mood_type,
        p.contents,
        p.img,
        p."${sortBy}" as sort_key,
        pl.name as place_name,
        ST_AsText(pl.geom) as geom_text,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(r.id) as reaction_count
      FROM "Post" p
      JOIN "Place" pl ON p."placeId" = pl.id
      JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Reaction" r ON p.id = r."postId"
      GROUP BY p.id, pl.id, u.id
      ORDER BY p."${sortBy}" ASC
      LIMIT ${limit + 1}
    `;
  }

  const postsFromDb = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
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
  >(query);

  // 2. 次ページのカーソルを決定
  let nextCursor: number | null = null;
  let postsForResponse = postsFromDb;

  if (postsFromDb.length > limit) {
    const lastPost = postsFromDb[postsFromDb.length - 1];
    postsForResponse = postsFromDb.slice(0, limit);
    nextCursor = Number(lastPost.sort_key);
  }

  // 3. フロントエンド用に整形
  const formattedPosts: PostData[] = postsForResponse.map((post) => {
    // POINT(longitude latitude) 形式から緯度経度を抽出
    const pointPattern =
      /POINT\s*\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)/;
    const match = post.geom_text.match(pointPattern);
    const [longitude, latitude] = match
      ? [Number(match[1]), Number(match[2])]
      : [0, 0];

    return {
      id: Number(post.id),
      placeName: post.place_name,
      moodType: post.mood_type as MoodType,
      contents: post.contents,
      imageUrl: post.img,
      reactionCount: Number(post.reaction_count),
      userAvatarUrl: post.author_avatar,
      username: post.author_name,
      latitude,
      longitude,
    };
  });

  return {
    posts: formattedPosts,
    nextPageState: {
      sortBy: sortBy,
      cursor: nextCursor,
    },
  };
}
