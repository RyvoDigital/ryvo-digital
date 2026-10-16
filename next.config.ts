import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    // Keep links to the old single-language legal pages working.
    return [
      { source: "/privacy-policy", destination: "/en/privacy-policy", permanent: true },
      { source: "/terms-of-service", destination: "/en/terms-of-service", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
