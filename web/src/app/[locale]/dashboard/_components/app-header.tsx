import Link from "next/link";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { BetaBadge } from "./beta-badge";
import { UserMenu } from "./user-menu";

export function AppHeader({
  locale,
  userEmail,
  fullName,
}: {
  locale: string;
  userEmail: string;
  fullName: string | null;
}) {
  return (
    <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-border-subtle bg-cream/80 backdrop-blur sticky top-0 z-10">
      <Link
        href={`/${locale}/dashboard`}
        className="md:hidden font-serif text-[22px] tracking-[-0.01em] text-ink"
      >
        cheatjob
      </Link>
      <div className="flex-1" />
      <div className="flex items-center gap-3 md:gap-4">
        <BetaBadge />
        <LocaleSwitcher />
        <UserMenu locale={locale} userEmail={userEmail} fullName={fullName} />
      </div>
    </header>
  );
}
