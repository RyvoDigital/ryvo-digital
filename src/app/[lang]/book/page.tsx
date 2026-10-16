import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import PageHero from "@/components/pages/PageHero";
import PageFrame from "@/components/pages/PageFrame";
import Book from "@/components/home/Book";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).book;
  return pageMeta(lang, "/book", p.metaTitle, p.metaDescription);
}

// The full booking UI, both call types (?kind=websites opens on the websites call).
export default async function BookPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { kind } = await searchParams;
  const t = getDictionary(lang);
  const p = getPages(lang).book;

  return (
    <PageFrame lang={lang} t={t} bookHref="#book">
      <PageHero
        lang={lang} t={t} path="/book" label={p.label} title={p.title} compact
        sub={<p className="m-0">{p.sub} <a href="mailto:hello@ryvodigital.com">hello@ryvodigital.com</a>.</p>}
      />
      <main>
        <Book lang={lang} t={{ ...t.book, label: p.label }} initial={kind === "websites" ? 1 : 0} />
      </main>
    </PageFrame>
  );
}
