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
  images: {
    // Pexels-hosted assets (editorial hero photography). Provisional —
    // designer's custom shoot replaces these later. Photographer credits
    // live in code comments next to each Image src.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  async headers() {
    // Static video + poster assets are content-addressed (filename baked
    // into commit). Cache them forever at the edge — saves bandwidth and
    // makes repeat visits + nav back-forward instant.
    return [
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
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
