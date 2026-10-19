import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import AboutPage from "@/components/about/AboutPage";
import { aboutContent } from "@/components/about/content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).about;
  return pageMeta(lang, "/about", p.metaTitle, p.metaDescription);
}

// The route opens (direction B, approved 19 Oct 2026): the Lisbon–Madrid globe
// as the hero, then the figure, the statement, the team as a ledger of people
// by side (Martim on the automations side only, Phil on the websites side
// only, Manuel on both: plan §3.7 rule), and the two cities.
export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <AboutPage c={aboutContent(lang)} />;
}
