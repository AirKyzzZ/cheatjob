"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export function Sidebar({ locale }: { locale: string }) {
  const t = useTranslations("app.sidebar");
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/dashboard`, label: t("candidatures") },
    { href: `/${locale}/dashboard/profile`, label: t("profile") },
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border-subtle bg-cream sticky top-0 h-screen">
      <div className="px-6 py-6">
        <Link
          href={`/${locale}/dashboard`}
          className="font-serif text-[24px] tracking-[-0.01em] text-ink hover:opacity-80 transition-opacity"
        >
          cheatjob
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-[14px] font-sans transition-all relative",
                isActive
                  ? "bg-burgundy-soft text-burgundy font-medium"
                  : "text-muted hover:bg-cream-soft hover:text-ink",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-burgundy rounded-r" />
              )}
              <span className={isActive ? "ml-1" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-6 border-t border-border-subtle pt-4">
        <form action={signOut.bind(null, locale)}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-[14px] font-sans text-muted hover:text-ink transition-colors"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}
