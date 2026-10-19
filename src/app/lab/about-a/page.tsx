import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SmoothScroll from "@/components/motion/SmoothScroll";
import AboutA from "@/components/lab/about/AboutA";
import { aboutContent } from "@/components/lab/about/content";

// /about, direction A (step 2, round 1). Dev only: 404 in production, never
// indexed, linked from nowhere. ?lang=pt or ?lang=es reads the page in PT/ES.
// The real /about is untouched.
export const metadata: Metadata = {
  title: "About · direction A · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function AboutLabA({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { lang } = await searchParams;
  return (
    <>
      <SmoothScroll />
      <AboutA c={aboutContent(lang)} />
    </>
  );
}
