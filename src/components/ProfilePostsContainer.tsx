"use client";

import { UserPostsList } from "@/components/post/UserPostsList";
import type { PostData } from "@/lib/post-types";
import { Plus } from "lucide-react";
import { useState } from "react";

interface ProfilePostsContainerProps {
  initialPosts: PostData[];
}

/**
 * プロフィールページの投稿セクションをクライアント側で管理
 */
export function ProfilePostsContainer({
  initialPosts,
}: ProfilePostsContainerProps) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">自分の投稿</h2>
        <button
          onClick={() => setIsPostDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新規投稿
        </button>
      </div>
      {/* UserPostsList には初期投稿一覧を渡す */}
      <UserPostsList
        initialPosts={initialPosts}
        onPostDialogOpen={setIsPostDialogOpen}
      />
    </div>
  );
}
