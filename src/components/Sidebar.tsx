"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Bell, UserCheck } from "lucide-react";
import { ROUTES } from "@/consts/ROUTES";

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
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-slate-200 md:bg-white md:pt-20 md:flex md:flex-col md:p-4 md:gap-2">
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-full transition-colors
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-lg">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
