import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// next-intl handles three things here:
//   1. Redirects the bare root `/` (and any unprefixed path) to a locale
//      prefix based on the visitor's Accept-Language header.
//   2. Falls back to `routing.defaultLocale` (en) when Accept-Language
//      doesn't match any supported locale.
//   3. Sets a NEXT_LOCALE cookie so manual locale switches stick across
//      visits.
export default createMiddleware(routing);

export const config = {
  // Match every path EXCEPT:
  //   - /api/*           (server endpoints)
  //   - /_next/*         (Next.js internals)
  //   - /_vercel/*       (Vercel infra)
  //   - any path containing a dot (static files like /robots.txt,
  //     /sitemap.xml, images served from /public)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
