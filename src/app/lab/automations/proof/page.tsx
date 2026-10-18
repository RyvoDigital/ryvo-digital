import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import ProofPage from "@/components/lab/proof/ProofPage";

// The /automations proof, round 2: one version. Crystal in the hero, mercury at
// the close. Dev only: 404 in production, never indexed, linked from nowhere.
// The real /automations is untouched.
export const metadata: Metadata = {
  title: "Automations proof · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AutomationsProof() {
  if (process.env.NODE_ENV === "production") notFound();
  const pages = getPages("en");
  return <ProofPage t={getDictionary("en")} p={pages.automations} ctaLabel={pages.ctaLabel} place={pages.about.title[1].replace(/\.$/, "")} />;
}
