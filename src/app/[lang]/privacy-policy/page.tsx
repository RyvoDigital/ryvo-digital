import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";
import { LEGAL_UPDATED, PRIVACY } from "@/components/legal/content";
import { isLocale } from "@/i18n/config";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = PRIVACY[lang];
  return pageMeta(lang, "/privacy-policy", d.metaTitle, d.metaDescription);
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = PRIVACY[lang];
  return (
    <LegalPage lang={lang} path="/privacy-policy" title={d.title} lastUpdated={LEGAL_UPDATED[lang]}>
      {d.sections.map((s) => <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>)}
    </LegalPage>
  );
}
