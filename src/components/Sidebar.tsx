"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Bell, UserCheck } from "lucide-react";
import { ROUTES } from "@/consts/ROUTES";
import { APP_NAME } from "@/consts/APP_NAME";

const NAV_ITEMS = [
  {
    label: "ホーム",
    href: ROUTES.home,
    icon: Home,
  },
  {
    label: "マップを表示",
    href: ROUTES.map,
    icon: Map,
  },
  {
    label: "通知",
    href: ROUTES.notification,
    icon: Bell,
  },
  {
    label: "自分の投稿",
    href: ROUTES.profile,
    icon: UserCheck,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:bg-white md:flex md:flex-col md:gap-2 md:z-50 md:w-24 md:border-r md:border-slate-200 md:items-center md:p-2 lg:w-48 lg:items-center lg:p-4">
      {/* ロゴ: タブレット＆PC両方でアイコン下に文字を表示 */}
      <Link
        href={ROUTES.home}
        className="flex flex-col items-center gap-2 md:mb-8 lg:mb-8 md:pt-4 lg:pt-4"
      >
        <Image
          src="/logo.webp"
          alt={APP_NAME}
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="hidden lg:inline text-xs font-bold text-slate-900 text-center">
          {APP_NAME}
        </span>
      </Link>

      <nav className="flex flex-col gap-2 w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col md:flex-col lg:flex-col lg:gap-2 md:items-center lg:items-center md:justify-center lg:justify-center md:px-2 lg:px-4 md:py-3 lg:py-3 rounded-lg transition-colors w-full
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs md:text-xs lg:text-xs text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
