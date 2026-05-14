import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
