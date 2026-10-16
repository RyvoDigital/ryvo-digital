import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Never show the Next.js "N" badge, not even in development.
  devIndicators: false,
  // First-time visitors from LinkedIn and email: styles arrive with the HTML, no render-blocking request.
  experimental: { inlineCss: true, globalNotFound: true },
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
