import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog/posts";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";

const HOSTNAME = "https://www.cheatjob.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const url = `${HOSTNAME}/${locale}/blog`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      types: { "application/rss+xml": `${HOSTNAME}/feed.xml` },
    },
    robots: locale === "fr" ? undefined : { index: false, follow: true },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url,
      siteName: "Cheatjob",
      type: "website",
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = await getAllPosts();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-20 md:px-8 md:py-28">
        <header>
          <p className="mb-5 font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-muted-soft">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-[17px] leading-relaxed text-muted-soft">
            {t("intro")}
          </p>
        </header>

        <div className="mt-16">
          {posts.length === 0 ? (
            <p className="font-sans text-[15px] text-muted-soft">{t("empty")}</p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group block border-t border-border-subtle py-7 transition-colors hover:bg-cream-soft/50"
              >
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-muted-soft">
                  {post.date} · {post.readingMinutes} min
                </p>
                <h2 className="mt-2 font-serif text-[26px] leading-snug text-ink transition-colors group-hover:text-burgundy">
                  {post.title}
                </h2>
                <p className="mt-2 font-sans text-[16px] leading-relaxed text-muted-soft">
                  {post.description}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
