"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { APP_NAME } from "@/consts/APP_NAME";
import { ROUTES } from "@/consts/ROUTES";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const pathname = usePathname();
  const isRoot = pathname === "/";
  const { user, isLoading, isAuthenticated, logout } = useAuth();

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

  // 認証状態によるアクションのレンダリング
  const renderAuthActions = () => {
    if (isLoading) {
      return (
        <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3">
          {/* ユーザー情報ドロップダウン */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {user.name}
            </span>
          </div>

          {/* ログアウトボタン */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="ログアウト"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">
              ログアウト
            </span>
          </button>
        </div>
      );
    }

    // 未認証の場合
    return (
      <>
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
      </>
    );
  };

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

          {/* 右: 認証状態に応じたアクション */}
          <div className="justify-self-end">
            {renderAuthActions()}
          </div>
        </div>
      </div>
    </header>
  );
}
