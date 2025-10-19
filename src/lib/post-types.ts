// 投稿関連の基本型定義
export type CreatePostRequestBody = {
  moodType?: unknown;
  contents?: unknown;
  placeId?: unknown;
  imageUrl?: unknown;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
};

export const ALLOWED_MOOD_TYPES = ["relax", "focus", "idea", "chat"] as const;

export type MoodType = (typeof ALLOWED_MOOD_TYPES)[number];

export type ParsedCreatePostBodyWithNumericId = {
  moodType: MoodType;
  contents: string;
  placeId: bigint;
  imageUrl: string | null;
};

export type ParsedCreatePostBodyWithName = {
  moodType: MoodType;
  contents: string;
  placeName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string | null;
};

export type ParsedCreatePostBody =
  | ParsedCreatePostBodyWithNumericId
  | ParsedCreatePostBodyWithName;

export type ParsedCreatePostBodyWithLocation = {
  moodType: MoodType;
  contents: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  imageUrl: string | null;
};

export const REQUIRED_CREATE_POST_FIELDS = [
  "moodType",
  "contents",
  "placeId",
] as const;

// 投稿データ型（FeedList.tsxから移動）
export interface PostData {
  id: number;
  placeName: string;
  moodType: string;
  contents: string;
  imageUrl: string | null;
  reactionCount: number;
  userAvatarUrl: string | null;
  username: string;
  latitude: number;
  longitude: number;
}

// 投稿フォーム関連の型定義
export interface PostLocation {
  latitude: number;
  longitude: number;
  name?: string;
  isDefault?: boolean;
}

export interface PostFormData {
  placeId: string | null;
  spotName: string;
  mood: MoodType | null;
  text: string;
  image: File | null;
  location: PostLocation | null;
}

export interface PlaceOption {
  id: string;
  name: string;
}

// コンポーネントProps型定義（各コンポーネントから移動）
export interface FeedListProps {
  initialPosts: PostData[];
}

export interface PostFormFieldsProps {
  formData: PostFormData;
  isSubmitting: boolean;
  onSpotNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  places: PlaceOption[];
  placesLoading: boolean;
  placesError: string | null;
  onPlaceSelect: (placeId: string | null) => void;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMoodSelect: (mood: MoodType) => void;
  onImageSelect: (file: File | null) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
}

export interface PostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostFormData) => Promise<void>;
}

export interface ImageUploadProps {
  selectedImage: File | null;
  onImageSelect: (file: File | null) => void;
}

export interface ReviewCardProps {
  postId: number;
  placeName: string;
  badgeUrl: string;
  reviewText: string;
  imageUrl: string | null;
  reactionCount: number;
  userAvatarUrl: string | null;
  userAvatarFallback: string;
  username: string;
  latitude: number;
  longitude: number;
  className?: string;
}
