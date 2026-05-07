import "server-only";

/**
 * Brandfetch Brand API client — fetches a brand's official logo URL
 * (preferring the horizontal wordmark "logo" variant over the square
 * "icon"). The Brand API requires the server-only secret key, so this
 * module is server-only; callers must invoke it from a Server Component
 * or a Route Handler. The returned CDN URL contains the client ID
 * embedded by Brandfetch and is safe to ship to the browser.
 */
const API = "https://api.brandfetch.io/v2";

type LogoType = "logo" | "icon" | "symbol" | "other";
type LogoTheme = "light" | "dark";

type LogoFormat = {
  src: string;
  format: "svg" | "png" | "jpeg" | "webp";
  height?: number;
  width?: number;
  size?: number;
};

type LogoVariant = {
  type: LogoType;
  theme?: LogoTheme;
  formats: LogoFormat[];
};

type BrandResponse = {
  id?: string;
  name?: string;
  logos?: LogoVariant[];
};

const FORMAT_ORDER: LogoFormat["format"][] = ["svg", "png", "webp", "jpeg"];

/**
 * Resolves a domain to its best logo URL. Priority:
 *   1. `type=logo` (horizontal lockup with brand text)
 *   2. `type=icon` (square mark) as fallback
 *   3. `type=symbol` last resort
 *
 *   Theme: prefer `theme=dark` — Brandfetch's convention is that
 *   `theme=dark` = dark-colored asset (for use on LIGHT backgrounds
 *   like our cream); `theme=light` = light/white asset (for dark
 *   backgrounds). Picking the wrong one produces invisible logos.
 *
 *   Format priority: SVG > PNG > WebP > JPEG.
 *
 * Returns `null` when the API key is missing, the brand isn't in
 * Brandfetch's index, or the response shape is unexpected — callers
 * fall back to plain text.
 */
export async function fetchBrandLogoUrl(domain: string): Promise<string | null> {
  const key = process.env.BRANDFETCH_API_KEY;
  if (!key) return null;

  let data: BrandResponse;
  try {
    const res = await fetch(`${API}/brands/${encodeURIComponent(domain)}`, {
      headers: { Authorization: `Bearer ${key}` },
      // Brand assets change roughly never; 7 days keeps us well under any
      // free-tier rate limit even with frequent rebuilds.
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    data = (await res.json()) as BrandResponse;
  } catch {
    return null;
  }

  const logos = data.logos ?? [];
  if (logos.length === 0) return null;

  const pickBestVariant = (type: LogoType): LogoVariant | undefined => {
    const candidates = logos.filter((l) => l.type === type);
    return candidates.find((l) => l.theme === "dark") ?? candidates[0];
  };

  const variant =
    pickBestVariant("logo") ??
    pickBestVariant("icon") ??
    pickBestVariant("symbol") ??
    logos[0];

  if (!variant?.formats?.length) return null;

  for (const format of FORMAT_ORDER) {
    const match = variant.formats.find((f) => f.format === format);
    if (match) return match.src;
  }
  return variant.formats[0].src ?? null;
}
