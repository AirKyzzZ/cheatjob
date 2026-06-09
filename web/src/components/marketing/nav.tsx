"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { getBrowserClient } from "@/lib/supabase/client";
import { useLocale, useTranslations } from "next-intl";
import { EVENTS, track } from "@/lib/analytics/events";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

const MotionLink = motion.create(Link);

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  // On the landing the nav links are in-page anchors; on every other page (blog,
  // etc.) they must point back to the landing or they no-op (nothing to scroll to).
  const onLanding = pathname === `/${locale}` || pathname === `/${locale}/`;
  const sectionHref = (id: string) => (onLanding ? `#${id}` : `/${locale}#${id}`);
  const homeHref = onLanding ? "#top" : `/${locale}`;
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // Resolved client-side so the landing stays static; only a logged-in visitor
  // (a minority here) sees the buttons swap to their avatar.
  const [account, setAccount] = useState<{ initial: string } | null>(null);
  useEffect(() => {
    getBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) {
          setAccount({ initial: (data.user.email ?? "?").charAt(0).toUpperCase() });
        }
      });
  }, []);

  const secondaryLinks = [
    { label: t("wedge"), id: "wedge" },
    { label: t("evidence"), id: "evidence" },
    { label: t("faq"), id: "faq" },
  ] as const;

  // Hero is cream-on-cream now (was dark before), so the nav needs a
  // visible baseline state at scrollY=0 — otherwise it reads as empty.
  // The pill stays cream-tinted with backdrop-blur throughout, just
  // intensifies slightly as you scroll into solid sections.
  const bg = useTransform(
    scrollY,
    [0, 600],
    ["rgba(250, 249, 246, 0.78)", "rgba(250, 249, 246, 0.96)"]
  );
  const border = useTransform(
    scrollY,
    [0, 600],
    ["rgba(232, 230, 225, 0.6)", "rgba(232, 230, 225, 1)"]
  );
  const wordmarkColor = useTransform(scrollY, [0, 600], ["#6b1f28", "#6b1f28"]);
  const linkColor = useTransform(scrollY, [0, 600], ["#0a0a0a", "#0a0a0a"]);
  const ctaBg = useTransform(scrollY, [0, 600], ["#6b1f28", "#6b1f28"]);
  const ctaFg = useTransform(scrollY, [0, 600], ["#faf9f6", "#faf9f6"]);
  const glassBlur = useTransform(scrollY, [0, 600], ["blur(18px)", "blur(12px)"]);
  const glassSaturate = useTransform(
    scrollY,
    [0, 600],
    ["saturate(160%)", "saturate(110%)"]
  );
  const backdropFilter = useTransform(
    [glassBlur, glassSaturate],
    ([b, s]: string[]) => `${b} ${s}`
  );

  return (
    <motion.header
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ top: "calc(var(--beta-banner-h, 0px) + 1rem)" }}
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[1120px]"
    >
      <motion.div
        style={{
          backgroundColor: bg,
          borderColor: border,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.25)",
        }}
        className="glass-pill rounded-full h-14 flex items-center justify-between px-5 md:px-6 border"
      >
        <Link
          href={homeHref}
          aria-label={t("wordmarkAria")}
          onClick={() => track(EVENTS.NavLinkClick, { target: "top" })}
          className="flex items-baseline font-serif"
        >
          <motion.span
            style={{ color: wordmarkColor }}
            className="font-serif text-[22px] leading-none tracking-[-0.01em]"
          >
            cheatjob
          </motion.span>
        </Link>

        <nav className="flex items-center gap-1 lg:gap-2">
          <div className="hidden lg:flex items-center gap-1 pr-2">
            {secondaryLinks.map((link) => (
              <MotionLink
                key={link.id}
                href={sectionHref(link.id)}
                onClick={() =>
                  track(EVENTS.NavLinkClick, { target: link.id, source: "link" })
                }
                style={{ color: linkColor }}
                className="text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 rounded-full font-sans"
              >
                {link.label}
              </MotionLink>
            ))}
          </div>
          <MotionLink
            href={`/${locale}/blog`}
            onClick={() =>
              track(EVENTS.NavLinkClick, { target: "blog", source: "link" })
            }
            style={{ color: linkColor }}
            className="hidden md:inline-block text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 font-sans"
          >
            {t("blog")}
          </MotionLink>
          <MotionLink
            href={sectionHref("pricing")}
            onClick={() =>
              track(EVENTS.NavLinkClick, { target: "pricing", source: "link" })
            }
            style={{ color: linkColor }}
            className="hidden md:inline-block text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 font-sans"
          >
            {t("pricing")}
          </MotionLink>
          <LocaleSwitcher linkColor={linkColor} />
          {account ? (
            <MotionLink
              href={`/${locale}/dashboard`}
              onClick={() =>
                track(EVENTS.NavLinkClick, { target: "dashboard", source: "avatar" })
              }
              style={{ backgroundColor: ctaBg, color: ctaFg }}
              aria-label={t("account")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full text-[14px] font-semibold font-sans hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              {account.initial}
            </MotionLink>
          ) : (
            <>
              <MotionLink
                href={`/${locale}/sign-in`}
                onClick={() =>
                  track(EVENTS.NavLinkClick, { target: "sign-in", source: "link" })
                }
                style={{ color: linkColor }}
                className="hidden md:inline-block text-[13px] font-medium hover:opacity-80 transition-opacity px-3 py-1.5 font-sans"
              >
                {t("login")}
              </MotionLink>
              <MotionLink
                href={`/${locale}/sign-up`}
                onClick={() =>
                  track(EVENTS.NavLinkClick, { target: "sign-up", source: "cta" })
                }
                style={{ backgroundColor: ctaBg, color: ctaFg }}
                className="inline-flex items-center h-10 px-4 md:px-5 rounded-full text-[13px] font-semibold font-sans hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                {t("cta")}
              </MotionLink>
            </>
          )}
        </nav>
      </motion.div>
    </motion.header>
  );
}
