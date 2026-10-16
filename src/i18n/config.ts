export const LOCALES = ["en", "pt", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const HREFLANG: Record<Locale, string> = { en: "en", pt: "pt-PT", es: "es-ES" };
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", pt: "pt-PT", es: "es-ES" };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const SITE_URL = "https://ryvodigital.com";
