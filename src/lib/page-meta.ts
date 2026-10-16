import type { Metadata } from "next";
import { HREFLANG, LOCALES, SITE_URL, type Locale } from "@/i18n/config";

// Title, description, canonical and hreflang alternates for an inner page.
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}${path}`,
      languages: Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], `${SITE_URL}/${l}${path}`])),
    },
    openGraph: { title, description, url: `${SITE_URL}/${lang}${path}`, siteName: "Ryvo Digital", type: "website" },
  };
}
