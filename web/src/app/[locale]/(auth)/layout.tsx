import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.layout");

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="px-6 py-5">
        <Link
          href={`/${locale}`}
          className="font-serif text-[22px] tracking-[-0.01em] text-ink hover:opacity-80 transition-opacity"
        >
          cheatjob
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-rise">{children}</div>
      </main>
      <footer className="px-6 pb-10 pt-4 text-center">
        <p className="font-serif italic text-[15px] text-burgundy/80">
          {t("signature")}
        </p>
      </footer>
    </div>
  );
}
