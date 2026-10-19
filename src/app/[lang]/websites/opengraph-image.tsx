import { isLocale, LOCALES, type Locale } from "@/i18n/config";
import { OG_SIZE, OG_TYPE, ogAlt, ogImage } from "@/lib/og";

// The share image (WhatsApp, LinkedIn, X…): lib/og.tsx.
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// (generateImageMetadata receives its params synchronously; the image, a Promise)
export function generateImageMetadata({ params }: { params: { lang: string } }) {
  const { lang } = params;
  return [{ id: "share", alt: ogAlt((isLocale(lang) ? lang : "en") as Locale, "websites"), size: OG_SIZE, contentType: OG_TYPE }];
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return ogImage((isLocale(lang) ? lang : "en") as Locale, "websites");
}
