import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { mdxComponents } from "@/components/blog/mdx-components";
import { Nav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { BlogCta } from "@/components/blog/blog-cta";
import { BlogViewTracker } from "@/components/blog/blog-view-tracker";
import { locales } from "@/lib/i18n/config";

const HOSTNAME = "https://www.cheatjob.com";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const url = `${HOSTNAME}/${locale}/blog/${slug}`;
  return {
    title: `${post.title} · Cheatjob`,
    description: post.description,
    alternates: { canonical: url },
    robots: locale === "fr" ? undefined : { index: false, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "Cheatjob",
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const url = `${HOSTNAME}/${locale}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: "fr",
        author: { "@type": "Organization", name: "Cheatjob" },
        publisher: { "@type": "Organization", name: "Cheatjob" },
        mainEntityOfPage: url,
        url,
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <BlogViewTracker slug={slug} tool={post.tool} />
      <main className="mx-auto max-w-2xl px-4 py-20 md:px-8 md:py-28">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-muted-soft">
          {post.date} · {post.readingMinutes} min
        </p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] tracking-[-0.02em] text-ink md:text-[52px]">
          {post.title}
        </h1>
        <p className="mt-6 font-sans text-[19px] leading-relaxed text-muted-soft">
          {post.description}
        </p>

        <article className="mt-12">
          <MDXRemote source={post.body} components={mdxComponents} />
        </article>

        <BlogCta locale={locale} tool={post.tool} slug={slug} />

        {post.faq.length > 0 && (
          <section className="mt-20 border-t border-border-subtle pt-12">
            <h2 className="font-serif text-[28px] leading-tight tracking-[-0.01em] text-ink">
              Questions fréquentes
            </h2>
            <dl className="mt-8 space-y-8">
              {post.faq.map((f, i) => (
                <div key={i}>
                  <dt className="font-serif text-[19px] leading-snug text-ink">{f.q}</dt>
                  <dd className="mt-3 font-sans text-[16px] leading-relaxed text-muted-soft">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
