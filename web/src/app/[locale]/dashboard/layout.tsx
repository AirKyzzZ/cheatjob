import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getServerClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import { Sidebar } from "./_components/sidebar";
import { AppHeader } from "./_components/app-header";

export default async function DashboardLayout({
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
  if (!user) redirect(`/${locale}/sign-in?next=/${locale}/dashboard`);

  const profile = await getProfile(supabase, user.id);
  if (!profile?.onboarded_at) redirect(`/${locale}/onboarding`);

  return (
    <div className="min-h-screen flex bg-cream text-ink">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          locale={locale}
          userEmail={user.email ?? ""}
          fullName={profile.full_name}
        />
        <main className="flex-1 px-6 md:px-10 py-10 max-w-[1200px] w-full mx-auto animate-fade-rise">
          {children}
        </main>
      </div>
    </div>
  );
}
