// 許可するソートキーのリスト
export const ALLOWED_SORT_KEYS = [
  'random_key_1',
  'random_key_2',
  'random_key_3',
  'random_key_4',
  'random_key_5',
] as const;

// 型定義: 許可されたソートキーの型
export type SortKey = typeof ALLOWED_SORT_KEYS[number];

// フロントエンドのコンポーネント形式にデータを整形するためのインターフェイス
export interface FormattedPost {
  id: string;
  placeName: string;
  badgeUrl: string;
  reviewText: string;
  imageUrl: string | null;
  reactionCount: number;
  userAvatarUrl: string | null;
  userAvatarFallback: string;
  username: string;
}
