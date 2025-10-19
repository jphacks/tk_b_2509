"use client";

import { ReviewCard } from "@/components/post/ReviewCard";
import { PostDialog } from "@/components/post";
import { Loader2, Plus } from "lucide-react"; // shadcn/ui 標準のスピナーアイコン
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // 無限スクロール用
import type { PostFormData, PostData, FeedListProps } from "@/lib/post-types";
import { getRandomSortKey, fetchPosts } from "@/lib/feed";
import { SortKey } from "@/lib/feed-types";
import { createPost } from "@/lib/api/posts";

/* --- ヘルパー関数 (page.tsx と同じもの) --- */
function getAvatarFallback(username: string): string {
  if (!username) return "??";
  return username.substring(0, 2).toUpperCase();
}

export function FeedList({ initialPosts }: FeedListProps) {
  // 1. 投稿リストの状態管理
  const [posts, setPosts] = useState(initialPosts);

  // 2. 「引っ張って更新」用の状態管理
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. 投稿ダイアログの状態管理
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // 4. 現在のソートキーとカーソルの状態管理
  const [sortBy, setSortBy] = useState<SortKey>('random_key_1');
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  // 4. 「無限スクロール」用の設定
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0, // 少しでも見えたらトリガー
    triggerOnce: false, // 見えるたびにトリガー（通常はtrueだが、フェッチ中にfalseになるように制御するためfalseに）
  });

  // 5. 「引っ張って更新」のロジック (PCのホイール操作)
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

        fetchPosts(sortBy, 10, cursor).then((data) => {
          setPosts(data.posts.map(post => ({
            ...post,
            mood_type: post.moodType
          })));
          setCursor(data.nextPageState.cursor || undefined);
          setIsRefreshing(false);
        }).catch(() => {
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
  }, [isRefreshing]); // isRefreshing が変わるたびにリスナーを再評価

  // 6. 「無限スクロール」のロジック
  useEffect(() => {
    // 監視対象が見えて、かつ更新中でない（多重フェッチ防止）
    if (loadMoreInView && !isRefreshing) {
      console.log("追加fetch"); // ★ 追加フェッチ処理の実行

      // (ダミー) ここで fetch した追加データ (newPosts) を
      // setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      // のようにして既存のリストに追加する

      // (例) ダミーデータを1件追加するデモ
      const newPost: PostData = {
        id: Math.random(), // IDはユニークにする
        placeName: "追加読み込みされたカフェ",
        moodType: "demo",
        contents: "これは無限スクロールで追加された投稿です。",
        imageUrl: null,
        reactionCount: 0,
        userAvatarUrl: null,
        username: "System",
      };

      // 1秒後にダミーデータを追加
      setTimeout(() => {
        setPosts((prevPosts) => [...prevPosts, newPost]);
      }, 1000);
    }
  }, [loadMoreInView, isRefreshing]);

  const fileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
      reader.readAsDataURL(file);
    });

  return (
    <>
      <div className="flex flex-col items-center space-y-6 pb-24 md:pb-0">
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
            placeName={post.placeName}
            badgeUrl="/vercel.svg" // 仮のバッジ
            reviewText={post.contents}
            imageUrl={post.imageUrl}
            reactionCount={post.reactionCount}
            userAvatarUrl={
              post.userAvatarUrl ??
              "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
            }
            userAvatarFallback={getAvatarFallback(post.username)}
            username={post.username}
          />
        ))}

        {/* 9. 「無限スクロール」用の監視対象要素 */}
        <div ref={loadMoreRef} className="h-10 w-full">
          {/* ここにもスピナーを置くことが多い
            (例: !isRefreshing && loadMoreInView && <Loader2 ... />) 
          */}
        </div>
      {/* 8. 投稿リストの表示 */}
      {posts.map((post) => (
        <ReviewCard
          key={post.id}
          placeName={post.placeName}
          badgeUrl="/vercel.svg"
          reviewText={post.contents}
          imageUrl={post.imageUrl}
          reactionCount={post.reactionCount}
          userAvatarUrl={
            post.userAvatarUrl ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
          }
          userAvatarFallback={getAvatarFallback(post.username)}
          username={post.username}
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
            placeName: createdPost.placeName,
            moodType: createdPost.moodType,
            contents: createdPost.contents,
            imageUrl: createdPost.imageUrl,
            reactionCount: createdPost.reactionCount,
            userAvatarUrl: createdPost.author.avatar,
            username: createdPost.author.name,
          };

          setPosts((prev) => [newPost, ...prev]);
        }}
      />
    </>
  );
}
