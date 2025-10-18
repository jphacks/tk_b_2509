import { FeedList } from "@/components/post/FeedList";
// サーバー用の 'getFeedLogic' と、ランダムキー取得関数をインポート
import { getFeedLogic, getRandomSortKey } from "@/lib/feed";
import { SortKey } from "@/lib/feed-types";

/**
 * ★ 解決策: revalidate = 0 を指定し、
 * このページを動的レンダリング (SSR) に変更する。
 * これにより、アクセスごとに getRandomSortKey が実行される。
 */
export const revalidate = 0; 

/**
 * フィード画面ページコンポーネント (サーバーコンポーネント)
 */
export default async function FeedPage() {
  
  // 1. SSRにより、リクエストごとにランダムキーが選ばれる
  const sortKey = getRandomSortKey() as SortKey;

  // 2. ★ 解決策: fetchPosts の代わりに 'getFeedLogic' を直接呼び出す
  // これで "Failed to parse URL" エラーが解消される
  const initialFeedData = await getFeedLogic(
    sortKey, 
    10, // 初回読み込み件数を10件に（適宜調整してください）
    undefined // 初回なのでカーソルはなし
  );
  
  return (
    <div className="container mx-auto p-4 min-h-screen bg-background">
      {/* FeedList には initialPosts 配列と、
        クライアントが「続きを読む」ために使う sortKey を渡す
      */}
      <FeedList 
        posts={initialFeedData.posts} 
        nextPageState={{
          sortBy: initialFeedData.nextPageState.sortBy, 
          cursor: initialFeedData.nextPageState.cursor 
        }}
      />
    </div>
  );
}