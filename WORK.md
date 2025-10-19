## 作業内容

- 投稿作成 API (`src/app/api/post/createPost/route.ts`) を更新し、フロントから渡されるスポット名と現在地を用いて常に新しい `Place` レコードを生成するようにしました。従来の数値 ID 指定ルートは後方互換のため維持しています。
- 投稿フォーム (`src/components/post/PostDialog.tsx`) で場所検索の呼び出しを廃止し、送信時に `getCurrentLocation` を直接利用して端末の現在地を取得するよう変更しました。取得失敗時はエラーを通知し、デフォルトロケーションを使わないようにしています。フォームリセット時には位置情報もクリアします。
- 投稿フォームのフィールド定義 (`src/components/post/PostFormFields.tsx` と `src/lib/post-types.ts`) を整理し、検索用のプロパティを削除して現在地ベースの入力に特化させました。
- 投稿一覧 (`src/components/post/FeedList.tsx`) から `createPost` 呼び出し時に位置情報を渡すようにし、API とのデータ整合性を保ちました。
- クライアント側の API ヘルパー (`src/lib/api/posts.ts`) と型定義 (`src/lib/post-types.ts`) に位置情報フィールドを追加し、フロントとバックエンドのデータ契約を拡張しました。

## 確認状況

- `pnpm lint` を実行しましたが、既存のコードベースに起因する未解決の lint/format エラーが複数残っています（今回の変更箇所以外にも発生）。必要に応じて別途対応してください。
