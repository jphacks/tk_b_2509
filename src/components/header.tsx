"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();

  // ページパスに対応するタイトルマッピング
  const pageTitle: Record<string, string> = {
    "/": "ホーム",
    "/home": "フィード",
    // "/login": "ログイン",
    // "/signup": "会員登録",
    "/map": "マップ",
    "/notification": "通知",
    // "/settings": "設定",
    // "/profile": "プロフィール",
  };

  // 現在のパスに対応するタイトルを取得
  const getPageTitle = () => {
    // 完全一致
    if (pageTitle[pathname]) {
      return pageTitle[pathname];
    }
    // 部分一致（例：/profile/123など）
    for (const [path, title] of Object.entries(pageTitle)) {
      if (pathname.startsWith(`${path}/`)) {
        return title;
      }
    }
    return "CocoWork";
  };

  // ログイン、会員登録、ルートページではヘッダーを表示しない
  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full px-4 py-3">
        <div className="flex items-center justify-center relative">
          {/* ロゴ・アイコン部分（左に固定） */}
          <div className="absolute left-0">
            <Link
              href="/home"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Image
                src="/logo.webp"
                alt="CocoWork"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-base font-bold text-slate-900 hidden sm:inline">
                CocoWork
              </span>
            </Link>
          </div>

          {/* ページタイトル部分（真ん中） */}
          <h1 className="text-xl font-bold text-slate-900">{getPageTitle()}</h1>
        </div>
      </div>
    </header>
  );
}
