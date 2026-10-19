import type { Metadata } from "next";
import { HREFLANG, LOCALES, SITE_URL, type Locale } from "@/i18n/config";

// Title, description, canonical, hreflang alternates (each language and
// x-default, which is English) and the share card of a page. The share image
// itself comes from the route's opengraph-image (lib/og.tsx).
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}${path}`,
      languages: { ...Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], `${SITE_URL}/${l}${path}`])), "x-default": `${SITE_URL}/en${path}` },
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}${path}`, siteName: "Ryvo Digital", type: "website", locale: HREFLANG[lang].replace("-", "_") },
    twitter: { card: "summary_large_image", title, description },
  };
}
