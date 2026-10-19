import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import SmoothScroll from "@/components/motion/SmoothScroll";
import DirectionA from "@/components/websites/lab/DirectionA";

// /websites, direction A (step 2, round 1). Dev only: 404 in production, never
// indexed, linked from nowhere. The real /websites is untouched.
export const metadata: Metadata = {
  title: "Websites A · Ryvo lab",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function WebsitesLabA() {
  if (process.env.NODE_ENV === "production") notFound();
  const pages = getPages("en");
  return (
    <>
      {/* the light page's ground under the overscroll, as on the real page */}
      <style>{"html,body{background:#eef0f2}"}</style>
      <SmoothScroll />
      <DirectionA t={getDictionary("en")} p={pages.websites} pg={pages} />
    </>
  );
}
