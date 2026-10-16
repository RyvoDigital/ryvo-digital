import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Archivo, Geist_Mono } from "next/font/google";
import "../globals.css";
import { LOCALES, HREFLANG, SITE_URL, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Grain from "@/components/chrome/Grain";

// Latin covers every PT and ES character (ã ç é ñ ¿ º); latin-ext would add
// ~100 KB on the critical path for nothing.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  // Not preloaded: Chrome holds the first frame for a preloaded font, and this
  // one (90 KB, the width axis) can land late on a phone, which held the first
  // paint to ~2.7 s on some loads. Text paints at once in the size-matched
  // fallback and swaps in.
  preload: false,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false, // small labels only; never worth competing with the hero image
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#07080A",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const languages = Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], `${SITE_URL}/${l}`]));
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: { ...languages, "x-default": `${SITE_URL}/en` },
    },
    openGraph: {
      type: "website",
      siteName: "Ryvo Digital",
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      url: `${SITE_URL}/${lang}`,
      locale: HREFLANG[lang].replace("-", "_"),
    },
    twitter: { card: "summary_large_image", title: t.meta.homeTitle, description: t.meta.homeDescription },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={HREFLANG[lang]} className={`${archivo.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');try{var q=new URLSearchParams(location.search).get('intro');if(q==='1'||(q!=='0'&&!matchMedia('(prefers-reduced-motion: reduce)').matches))d.classList.add('intro')}catch(e){}",
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        {children}
        <Grain />
      </body>
    </html>
  );
}
