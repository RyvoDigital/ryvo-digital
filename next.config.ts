import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Never show the Next.js "N" badge, not even in development.
  devIndicators: false,
  // First-time visitors from LinkedIn and email: styles arrive with the HTML, no render-blocking request.
  experimental: { inlineCss: true, globalNotFound: true },
  // The old single-language legal pages redirect to the visitor's language in
  // src/proxy.ts (config redirects cannot read Accept-Language).
  async headers() {
    return [
      {
        // Every response: no MIME sniffing, the origin alone as referrer to
        // other sites, no camera, microphone or location, and no framing by
        // other sites. No full CSP: inline styles and scripts are by design.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
