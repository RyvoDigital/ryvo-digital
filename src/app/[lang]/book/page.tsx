import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import BookPage from "@/components/book/BookPage";
import type { Force } from "@/components/book/useBooking";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).book;
  return pageMeta(lang, "/book", p.metaTitle, p.metaDescription);
}

const STATES: Force[] = ["loading", "error", "empty", "form", "done"];

// The booking page, both call types (?kind=websites opens on the websites
// call). In development only, ?state= pins a state for review.
export default async function Book({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ kind?: string; state?: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { kind, state } = await searchParams;
  const force = process.env.NODE_ENV !== "production" && STATES.includes(state as Force) ? (state as Force) : null;
  return <BookPage lang={lang} t={getDictionary(lang)} p={getPages(lang).book} initial={kind === "websites" ? 1 : 0} force={force} />;
}
