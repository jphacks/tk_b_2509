# プロジェクトディレクトリ構成

## 概要
Next.js 15アプリケーション（App Router使用）で、TypeScript、Prisma、Shadcn/uiを採用したモダンなWebアプリケーションです。

## ルートレベル
```
tk_b_2509/
├── .gitignore              # Git除外設定
├── AGENTS.md              # エージェントガイドライン
├── biome.json            # コードフォーマッタ/リンター設定
├── components.json        # Shadcn/ui設定
├── LICENSE               # ライセンスファイル
├── next.config.ts        # Next.js設定
├── package.json          # 依存関係とスクリプト定義
├── pnpm-lock.yaml        # pnpmロックファイル
├── pnpm-workspace.yaml   # pnpmワークスペース設定
├── postcss.config.mjs    # PostCSS設定
├── README.md             # プロジェクト説明
├── tsconfig.json         # TypeScript設定
├── vercel.json           # Vercelデプロイ設定
└── prisma/               # データベース関連
    └── schema.prisma     # Prismaデータベーススキーマ
```

## ソースコード構造 (`src/`)
```
src/
├── app/                  # Next.js App Router
│   ├── api/             # APIルート
│   │   └── db-health/   # データベースヘルスチェックAPI
│   │       └── route.ts
│   ├── favicon.ico      # ファビコン
│   ├── globals.css      # グローバルスタイル
│   ├── layout.tsx       # ルートレイアウト
│   └── page.tsx         # ホームページ
├── hooks/               # カスタムReactフック
├── lib/                 # ユーティリティ関数
│   ├── prisma.ts        # Prismaクライアント設定
│   └── utils.ts         # 共通ユーティリティ関数
└── components/          # UIコンポーネント（shadcn/uiから生成）
```

## 静的ファイル (`public/`)
```
public/
├── file.svg             # ファイルアイコン
├── globe.svg           # グローブアイコン
├── next.svg            # Next.jsロゴ
├── vercel.svg          # Vercelロゴ
└── window.svg          # ウィンドウアイコン
```

## 主な技術スタック
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Code Quality**: Biome (フォーマッタ/リンター)
- **Deployment**: Vercel

## 開発コマンド
- `pnpm install` - 依存関係インストール
- `pnpm dev` - 開発サーバー起動（Turbopack）
- `pnpm build` - 本番ビルド
- `pnpm start` - 本番サーバー起動
- `pnpm lint` - コードチェック
- `pnpm format` - コードフォーマット

## プロジェクト構造の特徴
この構成は、モダンなNext.jsプロジェクトのベストプラクティスに従っており、以下の特徴があります：

1. **App Router構造**: `src/app/`配下にルートが配置され、ファイルシステムベースのルーティング
2. **機能分離**: APIルート、UIコンポーネント、ユーティリティ関数が適切に分離
3. **モダンなツール**: Biomeによるコード品質管理、pnpmによる効率的なパッケージ管理
4. **データベース統合**: Prismaによる型安全なデータベースアクセス
