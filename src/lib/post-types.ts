export type CreatePostRequestBody = {
  moodType?: unknown;
  contents?: unknown;
  placeId?: unknown;
  imageUrl?: unknown;
};

export const ALLOWED_MOOD_TYPES = ["relax", "focus", "idea", "chat"] as const;

export type MoodType = (typeof ALLOWED_MOOD_TYPES)[number];

export type ParsedCreatePostBody = {
  moodType: MoodType;
  contents: string;
  placeId: bigint;
  imageUrl: string | null;
};

export const REQUIRED_CREATE_POST_FIELDS = [
  "moodType",
  "contents",
  "placeId",
] as const;
