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
}

export interface ApiResponse {
  posts: PostData[];
  nextPageState: {
    sortBy: string;
    cursor: number | null;
  };
}

export async function fetchPosts(sortKey: string | undefined, limit: number = 10, cursor: number | undefined = undefined, moodType?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (sortKey) {
      params.append("sort_by", sortKey);
    }
    if (cursor) {
      params.append("cursor", cursor.toString());
    }
    if (moodType) {
      params.append("mood_type", moodType);
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
  const postsFromDb = await prisma.post.findMany({
    take: limit + 1,
    where: cursor ? { [sortBy]: { gt: cursor } } : undefined,
    orderBy: { [sortBy]: "asc" },
    select: {
      id: true,
      mood_type: true,
      contents: true,
      img: true,
      [sortBy]: true,
      place: { select: { name: true } },
      author: { select: { name: true, avatar: true } },
      _count: { select: { reactions: true } },
    },
  }) as unknown as Array<{
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

  // 2. 次ページのカーソルを決定 (route.tsからロジックを移動)
  let nextCursor: number | null = null;
  if (postsFromDb.length > limit) {
    const lastPost = postsFromDb.pop();
    if (lastPost) {
      nextCursor = lastPost[sortBy] as number;
    }
  }

  // 3. フロントエンド用に整形 (route.tsからロジックを移動)
  const formattedPosts: PostData[] = postsFromDb.map((post) => ({
    id: Number(post.id), // BigIntをnumberに
    placeName: post.place.name,
    moodType: post.mood_type as MoodType, // mood_type -> moodType
    contents: post.contents,
    imageUrl: post.img,
    reactionCount: post._count.reactions,
    userAvatarUrl: post.author.avatar,
    username: post.author.name,
  }));

  return {
    posts: formattedPosts,
    nextPageState: {
      sortBy: sortBy,
      cursor: nextCursor,
    },
  };
}
