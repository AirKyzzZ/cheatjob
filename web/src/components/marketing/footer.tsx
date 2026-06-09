"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { FadingVideo } from "@/components/ui/fading-video";
import { EVENTS, track } from "@/lib/analytics/events";
import type { Locale } from "@/types/locale";

// Self-hosted footer video — served from Vercel edge CDN. Source was 3.6 MB
// CloudFront URL (1920×1080 @ 24fps); compressed to 1280×720 / CRF 30 /
// +faststart → 260 KB. Poster JPEG (15 KB) shows instantly while buffer.
const FOOTER_VIDEO = "/videos/footer.mp4";
const FOOTER_POSTER = "/videos/footer-poster.jpg";

const PRODUCT_KEYS = ["wedge", "evidence", "pricing", "faq"] as const;
const HOUSE_KEYS = ["founder", "mentions", "privacy", "rgpd"] as const;

function productHref(key: (typeof PRODUCT_KEYS)[number], locale: Locale) {
  if (key === "wedge") return "#wedge";
  if (key === "evidence") return "#evidence";
  if (key === "pricing") return "#pricing";
  if (key === "faq") return "#faq";
  return `/${locale}`;
}

function houseHref(key: (typeof HOUSE_KEYS)[number], locale: Locale) {
  if (key === "founder") return "#founder";
  if (key === "mentions") return `/${locale}/mentions-legales`;
  if (key === "privacy") return `/${locale}/confidentialite`;
  if (key === "rgpd") return `/${locale}/rgpd`;
  return `/${locale}`;
}

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");

  function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track(EVENTS.WaitlistOpened, { source: "footer" });
    router.push(`/${locale}/sign-up?email=${encodeURIComponent(email)}`);
  }

  return (
    <footer className="bg-cream text-ink relative overflow-hidden pt-16 pb-10 px-4 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        {/* Two-card grid (Kresna pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 items-stretch">
          {/* LEFT — Video card with logo + tagline + social */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[360px] rounded-[28px] overflow-hidden bg-ink p-8 flex flex-col justify-between"
          >
            <FadingVideo
              src={FOOTER_VIDEO}
              poster={FOOTER_POSTER}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            />
            {/* Subtle ink overlay so text reads cleanly without losing motion */}
            <div
              aria-hidden
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.15) 50%, rgba(10,10,10,0.55) 100%)",
              }}
            />

            {/* Logo */}
            <div className="relative z-10 flex items-baseline">
              <a
                href="#top"
                aria-label={t("wordmarkAria")}
                className="font-serif text-[26px] tracking-[-0.01em] text-cream leading-none"
              >
                cheatjob
              </a>
            </div>

            {/* Tagline */}
            <p className="relative z-10 font-serif text-[22px] md:text-[26px] leading-[1.2] text-cream max-w-[18ch] mt-auto mb-7">
              {t("tagline")}
              <br />
              <span className="text-cream/65 italic">{t("taglineAccent")}</span>
            </p>

            {/* Social row */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <span className="font-serif italic text-[16px] text-cream/85">
                {t("socialLabel")}
              </span>
              <div className="flex items-center gap-2">
                <SocialIcon href="https://x.com/maximecodes" label="X">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://www.linkedin.com/in/maxime-mansiet/" label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.91 1.65-1.86 3.39-1.86 3.62 0 4.29 2.39 4.29 5.5v6.25ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://github.com/AirKyzzZ/cheatjob" label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                </SocialIcon>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Light card with nav + subscribe */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative bg-cream-soft rounded-[28px] p-8 md:p-10 flex flex-col justify-between min-h-[360px] border border-border-subtle"
          >
            {/* Two nav columns */}
            <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
              <div className="flex flex-col">
                <h4 className="font-serif italic text-[20px] text-muted-soft mb-5">
                  {t("navTitleProduct")}
                </h4>
                <nav className="flex flex-col gap-3">
                  {PRODUCT_KEYS.map((key) => (
                    <a
                      key={key}
                      href={productHref(key, locale)}
                      className="font-sans text-[14px] font-medium text-ink hover:text-burgundy transition-colors"
                    >
                      {t(`navProduct.${key}`)}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex flex-col">
                <h4 className="font-serif italic text-[20px] text-muted-soft mb-5">
                  {t("navTitleHouse")}
                </h4>
                <nav className="flex flex-col gap-3">
                  {HOUSE_KEYS.map((key) => (
                    <a
                      key={key}
                      href={houseHref(key, locale)}
                      className="font-sans text-[14px] font-medium text-ink hover:text-burgundy transition-colors"
                    >
                      {t(`navHouse.${key}`)}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Bottom row — copyright + mini-CTA */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-10">
              <p className="font-sans text-[12px] text-muted-soft">
                {t("copyright")}
              </p>

              <div className="flex flex-col gap-3 md:items-end">
                <p className="font-sans text-[14px] text-muted leading-tight max-w-[28ch]">
                  {t("ctaLead")}{" "}
                  <span className="block font-serif text-[18px] text-ink mt-1">
                    {t("ctaStrong")}
                  </span>
                </p>

                <form
                  onSubmit={onSubscribe}
                  className="flex w-full md:w-[320px] bg-white border border-border-subtle rounded-[12px] p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("subscribePlaceholder")}
                    aria-label={t("subscribePlaceholder")}
                    className="flex-1 bg-transparent border-0 px-3 py-2 font-sans text-[14px] text-ink placeholder:text-muted-soft focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-ink text-cream rounded-[8px] px-4 py-2 font-sans text-[13px] font-semibold hover:-translate-y-0.5 transition-transform"
                  >
                    {t("subscribeCta")}
                    <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Watermark — massive faded "cheatjob" wordmark */}
        <div
          aria-hidden
          className="relative mt-[-40px] md:mt-[-80px] pointer-events-none select-none overflow-hidden"
        >
          <p
            className="font-serif text-ink/[0.045] leading-[0.78] tracking-[-0.045em] whitespace-nowrap text-center"
            style={{ fontSize: "clamp(120px, 22vw, 360px)" }}
          >
            cheatjob
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="size-9 rounded-[10px] bg-ink/85 text-cream flex items-center justify-center hover:bg-ink hover:-translate-y-0.5 transition-all"
    >
      {children}
    </a>
  );
}
