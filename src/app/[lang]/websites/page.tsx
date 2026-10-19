import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import WebsitesPage from "@/components/websites/WebsitesPage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).websites;
  return pageMeta(lang, "/websites", p.metaTitle, p.metaDescription);
}

// The websites side: the light page. The anatomy of a website in the hero,
// then what we do, how a project runs, Manuel and Phil, the client work (small),
// prices, questions and the close (step 2, round 2).
export default async function Websites({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const pages = getPages(lang);
  return <WebsitesPage lang={lang} t={getDictionary(lang)} p={pages.websites} ctaLabel={pages.ctaLabel} />;
}
