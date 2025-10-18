import type { MoodType } from "@/lib/post-types";

export type CreatePostPayload = {
  moodType: MoodType;
  contents: string;
  placeId: string;
  imageUrl?: string | null;
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
  const response = await fetch("/api/post/createPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      moodType: payload.moodType,
      contents: payload.contents,
      placeId: payload.placeId,
      imageUrl: payload.imageUrl ?? null,
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
