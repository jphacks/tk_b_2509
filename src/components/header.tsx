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
    // "/notification": "通知",
    // "/settings": "設定",
    // "/profile": "プロフィール",
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
        <div className="grid grid-cols-[auto_1fr_auto] items-center">
          {/* 左: ロゴ */}
          <div className="justify-self-start">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                alt={APP_NAME}
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-base font-bold text-slate-900 hidden sm:inline">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* 中央: ページタイトル（トップでは非表示） */}
          <div className="justify-self-center">
            {!isRoot && (
              <h1 className="text-xl font-bold text-slate-900">
                {getPageTitle()}
              </h1>
            )}
          </div>

          {/* 右: アクション */}
          <div className="justify-self-end flex items-center gap-3">
            {isRoot ? (
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
            ) : (
              <Link
                href={ROUTES.login}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
