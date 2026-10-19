import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";
import { LEGAL_UPDATED, terms } from "@/components/legal/content";
import { isLocale } from "@/i18n/config";
import { pageMeta } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = terms(lang);
  return pageMeta(lang, "/terms-of-service", d.metaTitle, d.metaDescription);
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = terms(lang);
  return (
    <LegalPage lang={lang} path="/terms-of-service" title={d.title} lastUpdated={LEGAL_UPDATED[lang]}>
      {d.sections.map((s) => <LegalSection key={s.title} title={s.title}>{s.body}</LegalSection>)}
    </LegalPage>
  );
}
