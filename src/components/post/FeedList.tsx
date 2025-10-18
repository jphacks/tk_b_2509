"use client";

import type { PostFormData } from "@/components/post";
import { PostDialog } from "@/components/post";
import { ReviewCard } from "@/components/post/ReviewCard";
import { type ApiResponse, fetchPosts, getRandomSortKey } from "@/lib/feed";
import { getAvatarFallback } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react"; // shadcn/ui 標準のスピナーアイコン
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // 無限スクロール用

export function FeedList({ posts, nextPageState }: ApiResponse) {
  // 1. 投稿リストの状態管理
  const [postList, setPostList] = useState(posts);
  const [cursor, setCursor] = useState<number | undefined>(nextPageState.cursor ?? undefined);
  const [sortBy, setSortBy] = useState<string>(nextPageState.sortBy);

  // 2. 「引っ張って更新」用の状態管理
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. 投稿ダイアログの状態管理
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

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
          const newSortKey = getRandomSortKey([prev]);
          return newSortKey;
        });

        fetchPosts(sortBy, 10, undefined).then((data) => {
          setPostList(data.posts);
          setCursor(undefined);
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
      setIsRefreshing(true); // フェッチ中フラグを立てる
      if (cursor === undefined) {
        setIsRefreshing(false); // カーソルがない場合は何もしない
        return;
      }
      fetchPosts(sortBy, 10, cursor).then((data) => {
        setPostList((prevPosts) => [...prevPosts, ...data.posts]);
        setCursor(data.nextPageState.cursor ?? undefined);
        setIsRefreshing(false); // フェッチ完了でフラグを下ろす
      }).catch(() => {
        setIsRefreshing(false); // エラー時もフラグを下ろす
      });
    }
  }, [loadMoreInView, isRefreshing]);

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
      {/* 8. 投稿リストの表示 */}
      {postList.map((post) => (
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
        onClick={() => setIsPostDialogOpen(true)}
        className="
          fixed bottom-6 right-6 md:bottom-8 md:right-8
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
          console.log("投稿データ:", data);
          // 本来はここでサーバーに送信
          await new Promise((resolve) => setTimeout(resolve, 1000));
          alert("投稿しました！");
        }}
      />
    </>
  );
}
