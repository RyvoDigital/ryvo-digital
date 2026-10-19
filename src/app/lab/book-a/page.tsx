import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { labBookProps } from "@/components/lab/book/lab-props";
import SmoothScroll from "@/components/motion/SmoothScroll";
import BookA from "@/components/lab/book/BookA";

// /book, direction A (the instrument). Dev only: 404 in production, never indexed.
// ?lang=pt|es · ?kind=websites · ?state=loading|error|empty|form|done
export const metadata: Metadata = { title: "Book · A · Ryvo lab", robots: { index: false, follow: false } };

export default async function BookLabA({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const props = labBookProps(await searchParams);
  return (<><SmoothScroll /><BookA {...props} /></>);
}
