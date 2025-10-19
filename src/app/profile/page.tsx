import { UserPostsList } from "@/components/post/UserPostsList";
import { getUserPostsLogic } from "@/lib/feed";
import { authenticateRequest } from "@/lib/middleware";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * 自分の投稿ページ (サーバーコンポーネント)
 */
export default async function MyPostsPage() {
  // クッキーからトークンを取得して認証
  const cookieStore = await cookies();
  const fakeRequest = {
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
    headers: {
      get: () => null,
    },
  } as unknown as NextRequest;

  const authResult = authenticateRequest(fakeRequest);

  if (!authResult.isAuthenticated || !authResult.user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">自分の投稿</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">�</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              ログインが必要です
            </h2>
            <p className="text-slate-600">
              このページを表示するにはログインしてください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    // ユーザーの投稿を取得
    const userPostsData = await getUserPostsLogic(
      authResult.user.userId,
      10, // 初回読み込み件数
      undefined, // 初回なのでカーソルはなし
    );

    return (
      <div className="container mx-auto p-4 min-h-screen bg-background pb-24 md:pb-0">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">自分の投稿</h1>
          {/* UserPostsList には初期投稿一覧を渡す */}
          <UserPostsList initialPosts={userPostsData.posts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">自分の投稿</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              投稿の読み込みに失敗しました
            </h2>
            <p className="text-slate-600">
              申し訳ございません。もう一度お試しください。
            </p>
          </div>
        </div>
      </div>
    );
  }
}
