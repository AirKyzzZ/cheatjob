import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { getCandidature } from "@/lib/db/candidatures";
import { getProfile } from "@/lib/db/profiles";
import { Wizard } from "./_components/wizard";

export default async function NewCandidaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { locale } = await params;
  const { c } = await searchParams;
  setRequestLocale(locale);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/sign-in`);

  const profile = await getProfile(supabase, user.id);
  const existing = c ? await getCandidature(supabase, c) : null;
  if (c && (!existing || existing.user_id !== user.id)) {
    redirect(`/${locale}/dashboard/candidatures/new`);
  }

  return (
    <Wizard
      locale={locale}
      candidature={existing}
      quotaRemaining={(profile?.quota_total ?? 0) - (profile?.quota_used ?? 0)}
    />
  );
}
