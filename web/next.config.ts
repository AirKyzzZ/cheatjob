import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // Silence "multiple lockfiles" warning — pin the workspace root to this
  // package, not a higher-up directory's package-lock.json.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // .fr → .com migration. Note: Vercel's domain config ALREADY 307s
      // cheatjob.com → www.cheatjob.com at the platform layer. Don't add a
      // www.cheatjob.com → cheatjob.com rule here — it creates a redirect
      // loop. If you want apex (no www) as canonical, change the primary
      // domain in Vercel dashboard instead, then rewrite the targets here.
      {
        source: "/:path*",
        has: [{ type: "host", value: "cheatjob.fr" }],
        destination: "https://www.cheatjob.com/fr/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.cheatjob.fr" }],
        destination: "https://www.cheatjob.com/fr/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
