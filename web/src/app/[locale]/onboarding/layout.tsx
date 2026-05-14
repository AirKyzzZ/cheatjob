import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/sign-in?next=/${locale}/onboarding`);

  const profile = await getProfile(supabase, user.id);
  if (profile?.onboarded_at) redirect(`/${locale}/dashboard`);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
