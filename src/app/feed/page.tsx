import { FeedList } from "@/components/post/FeedList";
import { getRandomSortKey, getFeedLogic } from "@/lib/feed";
import { SortKey } from "@/lib/feed-types";
import type { PostData } from "@/lib/post-types";

/**
 * 1. データベースから投稿データを取得する関数（ダミー）
 * (async にすることで、将来的にDBアクセスを await できるようにする)
 */
async function fetchPosts(): Promise<PostData[]> {
  console.log("fetch"); // ★ サーバーのコンソールに "fetch" と表示されます

  // --- 本来はここでDBからデータを取得する ---
  // const data = await db.posts.findMany(...);

  // --- ここから下はダミーデータです ---
  const dummyData: PostData[] = [
    {
      id: 1,
      placeName: "スターバックス 渋谷TSUTAYA店",
      moodType: "focus", // バッジ用のデータ
      contents:
        "ここのスタバは窓際席が最高です。コンセントも完備されていて、Wi-Fiも安定。長時間の作業にもってこいですが、午後は混雑しがちなので朝一が狙い目です。",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=300&fit=crop", // 仮の場所画像
      reactionCount: 128,
      userAvatarUrl: "https://github.com/shadcn.png", // アバターあり
      username: "shadcn_fan",
    },
    {
      id: 2,
      placeName: "近所の公民館の図書室",
      moodType: "focus", // バッジ用のデータ
      contents:
        "意外と穴場なのがここの図書室。静かで、机も広い。飲食は禁止ですが、集中して本を読んだり、PC作業（タイピング音注意）するのには最適。無料で使えるのも嬉しいポイント。",
      imageUrl: null, // ★画像なし
      reactionCount: 42,
      userAvatarUrl: null, // ★アバターなし
      username: "vercel_user",
    },
    {
      id: 3,
      placeName: "コメダ珈琲店",
      moodType: "relax",
      contents: "シロノワールを食べながら作業。ソファ席が快適すぎる。",
      imageUrl: null,
      reactionCount: 77,
      userAvatarUrl: null, // ★アバターなし
      username: "ユーザ名", // 日本語の場合
    },
  ];

  return dummyData;
}

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
        initialPosts={initialFeedData.posts.map(post => ({
          ...post,
          mood_type: post.moodType
        }))}
      />
    </div>
  );
}
