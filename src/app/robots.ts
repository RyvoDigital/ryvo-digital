import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/config";

// Everything may be crawled except the booking API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
