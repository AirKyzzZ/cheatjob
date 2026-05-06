import { ImageResponse } from "next/og";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/lib/i18n/config";

export const alt = "Cheatjob";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type OgProps = {
  params: Promise<{ locale: string }>;
};

export default async function Image({ params }: OgProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 22% 18%, rgba(107,31,40,0.32) 0%, rgba(107,31,40,0) 55%), #0a0a0a",
          color: "#f5f1e8",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(245,241,232,0.78)",
          }}
        >
          <span
            style={{
              width: 42,
              height: 2,
              background: "#6B1F28",
              display: "block",
            }}
          />
          <span>Cheatjob</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {t("ogTitle")}
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              color: "rgba(245,241,232,0.72)",
              maxWidth: 900,
            }}
          >
            {t("ogDescription")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            color: "rgba(245,241,232,0.55)",
            letterSpacing: "0.08em",
          }}
        >
          <span>www.cheatjob.com</span>
          <span
            style={{
              padding: "10px 22px",
              border: "1px solid rgba(245,241,232,0.24)",
              borderRadius: 999,
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {locale}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
