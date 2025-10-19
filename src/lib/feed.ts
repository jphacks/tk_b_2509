import { ALLOWED_SORT_KEYS, SortKey } from "./feed-types";
import { MoodType } from "./post-types";
import { prisma } from "./prisma";

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
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ApiResponse {
  posts: PostData[];
  nextPageState: {
    sortBy: string;
    cursor: number | null;
  };
}

export async function fetchPosts(sortKey: string | undefined, limit: number = 10, cursor: number | undefined = undefined): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (sortKey) {
      params.append("sort_by", sortKey);
    }
    if (cursor) {
      params.append("cursor", cursor.toString());
    }

  const response = await fetch(`/api/post/getFeed?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export function getRandomSortKey(excludes: string[] = []): string {
    const filteredKeys = ALLOWED_SORT_KEYS.filter(key => !excludes.includes(key));
    const randomIndex = Math.floor(Math.random() * filteredKeys.length);
    return filteredKeys[randomIndex];
}

export async function getFeedLogic(
  sortBy: SortKey,
  limit: number,
  cursor?: number,
): Promise<ApiResponse> {
  
  // 1. データベースから取得 (route.tsからロジックを移動)
  // NOTE: Prismaでは Unsupported型(geom)を直接selectできないため、rawクエリを使用
  type PostRow = {
    id: bigint;
    placeId: bigint;
    mood_type: string;
    contents: string;
    img: string | null;
    sort_value: number;
    place_name: string;
    latitude: number;
    longitude: number;
    author_name: string;
    author_avatar: string | null;
    reactions_count: number;
  };

  // 動的にカラムを参照するため、whereクローズを分岐
  let postsFromDb: PostRow[];
  
  if (cursor) {
    postsFromDb = await (prisma as any).$queryRaw`
      SELECT
        p.id,
        p."placeId",
        p.mood_type,
        p.contents,
        p.img,
        p."${sortBy}" as sort_value,
        pl.name as place_name,
        ST_Y(pl.geom)::float as latitude,
        ST_X(pl.geom)::float as longitude,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(r.id)::int as reactions_count
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
    postsFromDb = await (prisma as any).$queryRaw`
      SELECT
        p.id,
        p."placeId",
        p.mood_type,
        p.contents,
        p.img,
        p."${sortBy}" as sort_value,
        pl.name as place_name,
        ST_Y(pl.geom)::float as latitude,
        ST_X(pl.geom)::float as longitude,
        u.name as author_name,
        u.avatar as author_avatar,
        COUNT(r.id)::int as reactions_count
      FROM "Post" p
      JOIN "Place" pl ON p."placeId" = pl.id
      JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Reaction" r ON p.id = r."postId"
      GROUP BY p.id, pl.id, u.id
      ORDER BY p."${sortBy}" ASC
      LIMIT ${limit + 1}
    `;
  }

  // 2. 次ページのカーソルを決定 (route.tsからロジックを移動)
  let nextCursor: number | null = null;
  if (postsFromDb.length > limit) {
    const lastPost = postsFromDb[postsFromDb.length - 1];
    postsFromDb.pop();
    if (lastPost) {
      nextCursor = Number(lastPost.sort_value);
    }
  }

  // 3. フロントエンド用に整形 (route.tsからロジックを移動)
  const formattedPosts: PostData[] = postsFromDb.map((post) => {
    // 座標情報を抽出
    const location = {
      latitude: Number(post.latitude),
      longitude: Number(post.longitude),
    };

    return {
      id: Number(post.id), // BigIntをnumberに
      placeId: Number(post.placeId), // placeIdを追加
      placeName: post.place_name,
      moodType: post.mood_type as MoodType, // mood_type -> moodType
      contents: post.contents,
      imageUrl: post.img,
      reactionCount: Number(post.reactions_count),
      userAvatarUrl: post.author_avatar,
      username: post.author_name,
      location, // 座標情報を追加
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
