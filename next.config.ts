import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 既存の設定
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/**",
      },
      // --- ↓↓ 開発用：すべてのホスト名を許可 ↓↓ ---
      // 警告：本番環境ではセキュリティリスクのため非推奨
      {
        protocol: "https",
        hostname: "**", // すべてのドメインをマッチ
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http", // httpも許可
        hostname: "**",
        port: "",
        pathname: "/**",
      },
      // --- ↑↑ 開発用：すべてのホスト名を許可 ↑↑ ---
    ],
  },
};

export default nextConfig;
