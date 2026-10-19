import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import ProofPage from "@/components/lab/proof/ProofPage";

// The /automations proof: a museum vitrine in the hero, mercury at the close.
// One version (round 5: Manuel's picks, no switches). Dev only: 404 in production, never indexed, linked from nowhere. The real
// /automations is untouched.
export const metadata: Metadata = {
  title: "Automations proof · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Round 8, dev only: ?light=haze|clean compares the vitrine's two lights. The
// page is a 404 in production, and the flag is read only outside production.
type Q = Promise<{ light?: string }>;

export default async function AutomationsProof({ searchParams }: { searchParams: Q }) {
  if (process.env.NODE_ENV === "production") notFound();
  const q = await searchParams;
  const light = q.light === "haze" || q.light === "clean" ? q.light : undefined;
  const pages = getPages("en");
  return <ProofPage t={getDictionary("en")} p={pages.automations} ctaLabel={pages.ctaLabel} place={pages.about.title[1].replace(/\.$/, "")} light={light} />;
}
