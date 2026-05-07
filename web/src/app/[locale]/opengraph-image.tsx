import { ImageResponse } from "next/og";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/lib/i18n/config";

export const alt = "Cheatjob — L'avantage déloyal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type OgProps = {
  params: Promise<{ locale: string }>;
};

const COLORS = {
  cream: "#FAF9F6",
  ink: "#0A0A0A",
  muted: "#6F6A60",
  burgundy: "#6B1F28",
  border: "#E8E4DA",
};

async function loadFont(weight: string, style: "normal" | "italic"): Promise<ArrayBuffer | null> {
  try {
    // Satori (powering next/og) supports TTF, OTF, and WOFF — fontsource ships .woff at this path.
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif@5/files/instrument-serif-latin-${weight}-${style}.woff`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: OgProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  const [serifRegular, serifItalic] = await Promise.all([
    loadFont("400", "normal"),
    loadFont("400", "italic"),
  ]);

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400;
    style: "normal" | "italic";
  }> = [];
  if (serifRegular) {
    fonts.push({ name: "Instrument Serif", data: serifRegular, weight: 400, style: "normal" });
  }
  if (serifItalic) {
    fonts.push({ name: "Instrument Serif", data: serifItalic, weight: 400, style: "italic" });
  }

  const serifFamily = fonts.length ? "Instrument Serif" : "Georgia, serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: COLORS.cream,
          color: COLORS.ink,
          position: "relative",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Subtle burgundy halo in the top-right corner */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at center, rgba(107,31,40,0.18) 0%, rgba(107,31,40,0) 70%)",
          }}
        />

        {/* Top edge — fine ink rule + brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: COLORS.ink,
          }}
        >
          <span
            style={{
              width: 56,
              height: 2,
              background: COLORS.burgundy,
              display: "block",
            }}
          />
          <span style={{ fontWeight: 600 }}>Cheatjob</span>
          <span style={{ color: COLORS.muted, letterSpacing: "0.18em", fontSize: 18 }}>
            — Vol. I
          </span>
        </div>

        {/* Headline + dek */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            maxWidth: 1020,
          }}
        >
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              fontFamily: serifFamily,
              display: "flex",
            }}
          >
            {t("ogTitle")}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: COLORS.muted,
              fontStyle: "italic",
              fontFamily: serifFamily,
              maxWidth: 920,
              display: "flex",
            }}
          >
            {t("ogDescription")}
          </div>
        </div>

        {/* Footer rule + URL + locale chip */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ height: 1, background: COLORS.border, width: "100%" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 20,
              color: COLORS.ink,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span>www.cheatjob.com</span>
            <span
              style={{
                padding: "8px 18px",
                border: `1px solid ${COLORS.ink}`,
                borderRadius: 999,
                fontSize: 14,
                letterSpacing: "0.22em",
              }}
            >
              {locale.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
