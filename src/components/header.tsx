"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/consts/APP_NAME";
import { ROUTES } from "@/consts/ROUTES";

export default function Header() {
  const pathname = usePathname();
  const isRoot = pathname === "/";

  // ページパスに対応するタイトルマッピング
  const pageTitle: Record<string, string> = {
    // "/": "トップ",
    [ROUTES.home]: "フィード",
    // "/login": "ログイン",
    // "/signup": "会員登録",
    [ROUTES.map]: "マップ",
    [ROUTES.notification]: "通知",
    // "/settings": "設定",
    [ROUTES.profile]: "プロフィール",
  };

  const getPageTitle = (): string => {
    // 完全一致
    if (pageTitle[pathname]) {
      return pageTitle[pathname];
    }
    // 部分一致（例：/profile/123 など）
    for (const [path, title] of Object.entries(pageTitle)) {
      if (pathname.startsWith(`${path}/`)) {
        return title;
      }
    }
    return APP_NAME; // 文字列を返す
  };

  // ログイン、会員登録ページではヘッダーを表示しない
  if (pathname === ROUTES.login || pathname === ROUTES.signup) {
    return null;
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full px-4 py-3">
        {/* スマホ: ロゴ中央レイアウト */}
        <div className="md:hidden flex justify-center">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt={APP_NAME}
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
        </div>

        {/* PC: 3カラムレイアウト */}
        <div className="hidden md:grid md:grid-cols-3 items-center gap-4">
          {/* 左: ロゴ */}
          <div className="flex justify-start">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                alt={APP_NAME}
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-base font-bold text-slate-900">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* 中央: ページタイトル（トップでは非表示） */}
          <div className="flex justify-center">
            {!isRoot && (
              <h1 className="text-xl font-bold text-slate-900 truncate">
                {getPageTitle()}
              </h1>
            )}
          </div>

          {/* 右: アクション */}
          <div className="flex justify-end items-center gap-3">
            {isRoot && (
              <>
                <Link
                  href={ROUTES.login}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  ログイン
                </Link>
                <Link
                  href={ROUTES.signup}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  会員登録
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
