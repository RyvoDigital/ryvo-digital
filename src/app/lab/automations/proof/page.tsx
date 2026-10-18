import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import ProofPage, { type Variants } from "@/components/lab/proof/ProofPage";

// The /automations proof. Crystal in the hero, mercury at the close; round 4
// adds two finished variants of three things, chosen by URL:
//   ?crystal=a|b  the hero crystal: the tall slab, or a thick rounded cube
//   ?spread=a|b   the points: a three-column grid, or an editorial list
//   ?footer=a|b   the footer: the crystal wordmark, or the mercury horizon
// Dev only: 404 in production, never indexed, linked from nowhere. The real
// /automations is untouched.
export const metadata: Metadata = {
  title: "Automations proof · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

type Q = Promise<{ crystal?: string; spread?: string; footer?: string }>;
const ab = (x?: string) => (x === "b" ? "b" : "a");

export default async function AutomationsProof({ searchParams }: { searchParams: Q }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const v: Variants = { crystal: ab(q.crystal), spread: ab(q.spread), footer: ab(q.footer) };
  const pages = getPages("en");
  return <ProofPage t={getDictionary("en")} p={pages.automations} ctaLabel={pages.ctaLabel} place={pages.about.title[1].replace(/\.$/, "")} v={v} />;
}
