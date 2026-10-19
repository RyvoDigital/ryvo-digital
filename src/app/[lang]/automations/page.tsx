import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import AutomationsPage from "@/components/automations/AutomationsPage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).automations;
  return pageMeta(lang, "/automations", p.metaTitle, p.metaDescription);
}

// The automations side: a museum vitrine in the hero, the brand film, five
// editorial spreads, the weekly report, pricing, questions, mercury at the
// close (approved as the /lab proof, round 8, ac046ad).
export default async function Automations({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const pages = getPages(lang);
  return <AutomationsPage lang={lang} t={getDictionary(lang)} p={pages.automations} ctaLabel={pages.ctaLabel} />;
}
