import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { listCandidatures } from "@/lib/db/candidatures";
import { Button } from "@/components/ui/button";
import { StatsStrip } from "./_components/stats-strip";
import { CandidatureList } from "./_components/candidature-list";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/sign-in?next=/${locale}/dashboard`);

  const candidatures = await listCandidatures(supabase, user.id);
  const isEmpty = candidatures.length === 0;

  const td = await getTranslations("app.dashboard");
  const tl = await getTranslations("app.candidatures.list");

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center text-center py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft mb-6">
          {td("eyebrow")}
        </p>
        <h1 className="font-serif text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] text-ink max-w-2xl">
          {td("emptyTitle")}
        </h1>
        <p className="mt-6 font-sans text-[16px] md:text-[17px] leading-[1.6] text-muted max-w-md">
          {td("emptyDescription")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button asAnchor href={`/${locale}/dashboard/candidatures/new`}>
            {td("newCandidatureCta")}
          </Button>
          <p className="font-serif italic text-[15px] text-burgundy">
            {td("soonItalic")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.22em] font-sans font-medium text-muted-soft">
          {td("eyebrow")}
        </p>
        <Link
          href={`/${locale}/dashboard/candidatures/new`}
          className="inline-flex items-center h-9 px-4 rounded-xl bg-ink text-cream font-sans text-[13px] font-medium hover:opacity-80 transition-opacity"
        >
          {tl("newCta")}
        </Link>
      </div>

      <StatsStrip candidatures={candidatures} />
      <CandidatureList candidatures={candidatures} locale={locale} />
    </div>
  );
}
