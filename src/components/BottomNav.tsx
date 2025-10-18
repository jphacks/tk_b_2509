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
    label: "マップ",
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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-full h-full gap-1
                transition-colors
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
