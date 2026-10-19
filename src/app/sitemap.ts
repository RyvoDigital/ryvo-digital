import type { MetadataRoute } from "next";
import { HREFLANG, LOCALES, SITE_URL } from "@/i18n/config";

// Every page in every language, each with its alternates (and x-default:
// English), for search engines.
const PATHS = ["", "/automations", "/websites", "/about", "/book", "/privacy-policy", "/terms-of-service"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-19");
  return PATHS.flatMap((path) => {
    const languages = { ...Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], `${SITE_URL}/${l}${path}`])), "x-default": `${SITE_URL}/en${path}` };
    return LOCALES.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified,
      changeFrequency: path.includes("policy") || path.includes("terms") ? ("yearly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/privacy-policy" || path === "/terms-of-service" ? 0.3 : 0.8,
      alternates: { languages },
    }));
  });
}
