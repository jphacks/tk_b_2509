"use client";

import { PostDialog } from "@/components/post";
import { ReviewCard } from "@/components/post/ReviewCard";
import { createPost } from "@/lib/api/posts";
import type {
    PostData,
    PostFormData,
    UserPostsListProps,
} from "@/lib/post-types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

/* --- ヘルパー関数 --- */
function getAvatarFallback(username: string): string {
  if (!username) return "??";
  return username.substring(0, 2).toUpperCase();
}

export function getBadgeImageUrl(moodType: string): string {
  switch (moodType) {
    case "relax":
      return "/relax_badge.png";
    case "focus":
      return "/focus_badge.png";
    case "idea":
      return "/idea_badge.png";
    case "chat":
      return "/chat_badge.png";
    default:
      return "";
  }
}

/**
 * ユーザーの投稿を表示するコンポーネント（プロファイル用）
 * FeedListと異なり、気分フィルタリング機能と「引っ張って更新」機能はなし
 */
export function UserPostsList({
  initialPosts,
  onPostDialogOpen,
}: UserPostsListProps) {
  // 1. 投稿リストの状態管理
  const [posts, setPosts] = useState(initialPosts);

  // 2. 投稿ダイアログの状態管理
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // 3. 無限スクロール用の状態
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // 4. 無限スクロール用の参照
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // 5. ファイルをData URLに変換
  const fileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      reader.readAsDataURL(file);
    });

  // 6. 投稿作成時のロジック
  const handlePostCreate = async (formData: PostFormData) => {
    try {
      // バリデーション
      if (!formData.placeId || !formData.mood) {
        throw new Error("スポットと気分を選択してください");
      }

      const imageUrl = formData.image
        ? await fileToDataUrl(formData.image)
        : null;
      const createdPost = await createPost({
        moodType: formData.mood,
        contents: formData.text,
        placeId: formData.placeId,
        imageUrl,
        location: formData.location
          ? {
              latitude: formData.location.latitude,
              longitude: formData.location.longitude,
              name: formData.location.name,
            }
          : undefined,
      });

      const newPost: PostData = {
        id: Number(createdPost.id),
        placeId: Number(createdPost.placeId),
        placeName: createdPost.placeName,
        moodType: createdPost.moodType,
        contents: createdPost.contents,
        imageUrl: createdPost.imageUrl,
        reactionCount: createdPost.reactionCount,
        userAvatarUrl: createdPost.author.avatar,
        username: createdPost.author.name,
        latitude: formData.location?.latitude ?? 0,
        longitude: formData.location?.longitude ?? 0,
      };

      // 新しい投稿をリストの先頭に追加
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setIsPostDialogOpen(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  };

  // 7. 無限スクロールのロジック
  useEffect(() => {
    if (loadMoreInView && !isLoading && hasMore) {
      setIsLoading(true);

      if (cursor === undefined) {
        setIsLoading(false);
        setHasMore(false);
        return;
      }

      fetch(`/api/post/getUserPosts?limit=10&cursor=${cursor}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts((prevPosts) => [...prevPosts, ...data.posts]);
          setCursor(data.nextPageState.cursor ?? undefined);
          setHasMore(data.nextPageState.cursor !== null);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch more posts:", error);
          setIsLoading(false);
        });
    }
  }, [loadMoreInView, isLoading, hasMore, cursor]);

  // 初期データからカーソルを設定
  useEffect(() => {
    if (initialPosts.length > 0) {
      const lastPost = initialPosts[initialPosts.length - 1];
      setCursor(lastPost.id);
    }
  }, [initialPosts]);

  return (
    <div className="space-y-4">
      {/* 投稿ダイアログ */}
      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSubmit={handlePostCreate}
      />

      {/* 投稿がない場合 */}
      {posts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            投稿がまだありません
          </h2>
          <p className="text-slate-600">
            最初の投稿を作成して、あなたのストーリーをシェアしましょう！
          </p>
        </div>
      )}

      {/* 投稿リスト */}
      <div className="space-y-4">
        {posts.map((post) => (
          <ReviewCard
            key={post.id}
            postId={post.id}
            placeName={post.placeName}
            badgeUrl={getBadgeImageUrl(post.moodType)}
            reviewText={post.contents}
            imageUrl={post.imageUrl}
            reactionCount={post.reactionCount}
            userAvatarUrl={
              post.userAvatarUrl ??
              "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
            }
            userAvatarFallback={getAvatarFallback(post.username)}
            username={post.username}
            latitude={post.latitude}
            longitude={post.longitude}
          />
        ))}
      </div>

      {/* 無限スクロール監視用の要素 */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>読み込み中...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
