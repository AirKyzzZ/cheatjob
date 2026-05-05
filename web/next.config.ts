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
      {
        source: "/:path*",
        has: [{ type: "host", value: "cheatjob.fr" }],
        destination: "https://cheatjob.com/fr/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.cheatjob.fr" }],
        destination: "https://cheatjob.com/fr/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.cheatjob.com" }],
        destination: "https://cheatjob.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
