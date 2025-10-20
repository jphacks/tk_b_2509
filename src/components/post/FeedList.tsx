"use client";

import { PostDialog } from "@/components/post";
import { ReviewCard } from "@/components/post/ReviewCard";
import { createPost } from "@/lib/api/posts";
import { fetchPosts, getRandomSortKey } from "@/lib/feed";
import type { SortKey } from "@/lib/feed-types";
import type { FeedListProps, PostData, PostFormData } from "@/lib/post-types";
import { Loader2, Plus } from "lucide-react"; // shadcn/ui 標準のスピナーアイコン
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // 無限スクロール用

/* --- ヘルパー関数 (page.tsx と同じもの) --- */
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
      return ""; // デフォルトのバッジ画像
  }
}

export function FeedList({ initialPosts }: FeedListProps) {
  // 1. 投稿リストの状態管理
  const [posts, setPosts] = useState(initialPosts);

  // 2. moodTypeフィルターの状態管理（複数選択対応）
  const [selectedMoodTypes, setSelectedMoodTypes] = useState<string[]>([]);

  // 3. 「引っ張って更新」用の状態管理
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 4. 投稿ダイアログの状態管理
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // 5. 現在のソートキーとカーソルの状態管理
  const [sortBy, setSortBy] = useState<SortKey>("random_key_1");
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  // 4. 「無限スクロール」用の設定
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0, // 少しでも見えたらトリガー
    triggerOnce: false, // 見えるたびにトリガー（通常はtrueだが、フェッチ中にfalseになるように制御するためfalseに）
  });

  // 6. 「引っ張って更新」のロジック (PCのホイール操作)
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // ページ一番上 + 上スクロール + 更新中でない
      if (window.scrollY === 0 && event.deltaY < 0 && !isRefreshing) {
        event.preventDefault(); // デフォルトのスクロール動作をキャンセル

        setIsRefreshing(true);

        setSortBy((prev) => {
          const newSortKey = getRandomSortKey([prev]) as SortKey;
          return newSortKey;
        });

        fetchPosts(
          sortBy,
          10,
          cursor,
          selectedMoodTypes.length > 0 ? selectedMoodTypes : undefined,
        )
          .then((data) => {
            setPosts(
              data.posts.map((post) => ({
                ...post,
                mood_type: post.moodType,
              })),
            );
            setCursor(data.nextPageState.cursor || undefined);
            setIsRefreshing(false);
          })
          .catch(() => {
            setIsRefreshing(false);
          });
      }
    };

    // イベントリスナーを登録
    window.addEventListener("wheel", handleWheel, { passive: false });

    // クリーンアップ
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isRefreshing, sortBy, cursor, selectedMoodTypes]);

  // 7. 「無限スクロール」のロジック
  useEffect(() => {
    // 監視対象が見えて、かつ更新中でない（多重フェッチ防止）
    if (loadMoreInView && !isRefreshing) {
      console.log("追加fetch"); // ★ 追加フェッチ処理の実行

      setIsRefreshing(true); // フェッチ中フラグを立てる
      if (cursor === undefined) {
        setIsRefreshing(false); // カーソルがない場合は何もしない
        return;
      }
      fetchPosts(
        sortBy,
        10,
        cursor,
        selectedMoodTypes.length > 0 ? selectedMoodTypes : undefined,
      )
        .then((data) => {
          setPosts((prevPosts) => [...prevPosts, ...data.posts]);
          setCursor(data.nextPageState.cursor ?? undefined);
          setIsRefreshing(false); // フェッチ完了でフラグを下ろす
        })
        .catch(() => {
          setIsRefreshing(false); // エラー時もフラグを下ろす
        });
    }
  }, [loadMoreInView, isRefreshing, sortBy, cursor, selectedMoodTypes]);

  const fileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      reader.readAsDataURL(file);
    });

  // 8. moodTypeフィルター変更時に投稿を再取得
  const handleMoodTypeToggle = (moodType: string) => {
    setSelectedMoodTypes((prev) => {
      const updated = prev.includes(moodType)
        ? prev.filter((m) => m !== moodType) // 選択解除
        : [...prev, moodType]; // 選択

      // フィルター状態が変わったら投稿を再取得
      setIsRefreshing(true);
      setCursor(undefined); // リセット

      fetchPosts(
        sortBy,
        10,
        undefined,
        updated.length > 0 ? updated : undefined,
      )
        .then((data) => {
          setPosts(
            data.posts.map((post) => ({
              ...post,
              mood_type: post.moodType,
            })),
          );
          setCursor(data.nextPageState.cursor || undefined);
          setIsRefreshing(false);
        })
        .catch(() => {
          setIsRefreshing(false);
        });

      return updated;
    });
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6 pb-24 md:pb-0">
        {/* ボタングループ: moodTypeで複数選択フィルター */}
        <div className="w-full max-w-lg px-4 py-4 bg-background sticky top-16 md:top-20 z-40 shadow-sm">
          <div className="block text-sm font-medium mb-3 text-foreground">
            気分で絞り込み
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["relax", "focus", "idea", "chat"].map((moodType) => (
              <button
                key={moodType}
                type="button"
                onClick={() => handleMoodTypeToggle(moodType)}
                className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                  selectedMoodTypes.includes(moodType)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {moodType === "relax" && "リラックス"}
                {moodType === "focus" && "集中"}
                {moodType === "idea" && "発想"}
                {moodType === "chat" && "雑談"}
              </button>
            ))}
          </div>
        </div>

        {/* 7. 「引っ張って更新」用のスピナー */}
        {isRefreshing && (
          <div className="py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {/* 8. 投稿リストの表示 */}
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
        {/* 9. 「無限スクロール」用の監視対象要素 */}
        <div ref={loadMoreRef} className="h-10 w-full">
          {/* ここにもスピナーを置くことが多い
            (例: !isRefreshing && loadMoreInView && <Loader2 ... />) 
          */}
        </div>
      </div>

      {/* 浮動投稿ボタン（FAB） - モバイル向け */}
      <button
        type="button"
        onClick={() => setIsPostDialogOpen(true)}
        className="
          fixed bottom-20 right-6 md:bottom-8 md:right-8
          w-14 h-14 md:w-16 md:h-16
          rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 
          transition-all active:scale-95
          flex items-center justify-center
          z-40
        "
        aria-label="投稿を作成"
        title="投稿を作成"
      >
        <Plus className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* 投稿ダイアログ */}
      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSubmit={async (data: PostFormData) => {
          if (!data.placeId || !data.mood) {
            throw new Error("スポットと気分を選択してください");
          }

          const imageUrl = data.image ? await fileToDataUrl(data.image) : null;
          const createdPost = await createPost({
            moodType: data.mood,
            contents: data.text,
            placeId: data.placeId,
            imageUrl,
            location: data.location
              ? {
                  latitude: data.location.latitude,
                  longitude: data.location.longitude,
                  name: data.location.name,
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
            latitude: data.location?.latitude ?? 0,
            longitude: data.location?.longitude ?? 0,
          };

          setPosts((prev) => [newPost, ...prev]);
        }}
      />
    </>
  );
}
