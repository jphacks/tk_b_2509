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
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:bg-white md:pt-20 md:flex md:flex-col md:gap-2 md:z-50 md:w-24 md:border-r md:border-slate-200 md:items-center md:p-2 lg:w-64 lg:items-start lg:p-4">
      <nav className="flex flex-col gap-2 w-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col md:flex-col lg:flex-row lg:gap-4 md:items-center lg:items-center md:justify-center lg:justify-start md:px-2 lg:px-4 md:py-3 lg:py-3 rounded-lg lg:rounded-full transition-colors w-full
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs md:text-xs lg:text-lg text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
