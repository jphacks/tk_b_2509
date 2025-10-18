export type CreatePostRequestBody = {
  moodType?: unknown;
  contents?: unknown;
  placeId?: unknown;
  imageUrl?: unknown;
};

export type ParsedCreatePostBody = {
  moodType: string;
  contents: string;
  placeId: bigint;
  imageUrl: string | null;
};

export const REQUIRED_CREATE_POST_FIELDS = [
  "moodType",
  "contents",
  "placeId",
] as const;
