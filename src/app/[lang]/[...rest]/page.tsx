import { notFound } from "next/navigation";

// Any unknown path under a language: that language's 404 ([lang]/not-found.tsx),
// served with status 404.
export const dynamicParams = true;

export default function UnknownPage() {
  notFound();
}
