"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "@/server/actions/auth";

export function UserMenu({
  locale,
  userEmail,
  fullName,
}: {
  locale: string;
  userEmail: string;
  fullName: string | null;
}) {
  const t = useTranslations("app.userMenu");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = (fullName ?? userEmail)
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-full bg-burgundy text-cream font-sans font-semibold text-[13px] hover:bg-burgundy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:ring-offset-2 focus:ring-offset-cream"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials || "?"}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-cream-soft border border-border-subtle rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.06)] py-2 z-50 animate-fade-rise origin-top-right"
        >
          <div className="px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-sans text-muted-soft border-b border-border-subtle mb-1">
            {userEmail}
          </div>
          <form action={signOut.bind(null, locale)}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 text-[14px] font-sans text-ink hover:bg-burgundy-soft hover:text-burgundy transition-colors"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
