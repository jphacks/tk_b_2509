import type { MoodType } from "@/lib/post-types";

export type CreatePostPayload = {
  moodType: MoodType;
  contents: string;
  placeId: string;
  imageUrl?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
};

export type CreatedPost = {
  id: string;
  moodType: MoodType;
  contents: string;
  imageUrl: string | null;
  placeId: string;
  placeName: string;
  postedAt: string;
  reactionCount: number;
  author: {
    name: string;
    avatar: string | null;
  };
};

type CreatePostSuccessResponse = {
  success: true;
  data: CreatedPost;
};

type CreatePostErrorResponse = {
  success?: false;
  error?: string;
  code?: string;
};

export async function createPost(
  payload: CreatePostPayload,
): Promise<CreatedPost> {
  const placeId = payload.placeId.trim();
  const contents = payload.contents.trim();

  const response = await fetch("/api/post/createPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      moodType: payload.moodType,
      contents,
      placeId,
      imageUrl: payload.imageUrl ?? null,
      location: payload.location
        ? {
            latitude: payload.location.latitude,
            longitude: payload.location.longitude,
            name: payload.location.name,
          }
        : undefined,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as
    | CreatePostSuccessResponse
    | CreatePostErrorResponse;

  if (!response.ok || !("success" in body && body.success)) {
    const message =
      "error" in body && body.error
        ? body.error
        : "投稿の作成中にエラーが発生しました";
    throw new Error(message);
  }

  return body.data;
}
