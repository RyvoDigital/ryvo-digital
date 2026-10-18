import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import ProofPage from "@/components/lab/proof/ProofPage";

// The /automations proof: one page, built once, to decide the signature.
// ?sig=crystal (default) or ?sig=chrome; everything else is identical. Dev
// only: 404 in production, never indexed, linked from nowhere. The real
// /automations is untouched.
export const metadata: Metadata = {
  title: "Automations proof · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function AutomationsProof({ searchParams }: { searchParams: Promise<{ sig?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { sig } = await searchParams;
  const pages = getPages("en");
  return <ProofPage sig={sig === "chrome" ? "chrome" : "crystal"} t={getDictionary("en")} p={pages.automations} ctaLabel={pages.ctaLabel} />;
}
