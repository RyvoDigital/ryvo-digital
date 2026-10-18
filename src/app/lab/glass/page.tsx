import type { Metadata } from "next";
import { notFound } from "next/navigation";
import s from "@/components/lab/specimens.module.css";
import { Specimens } from "@/components/lab/Specimens";

// Glass round 3: three borderless specimens for Manuel to choose from, before
// the chosen one is rolled out to every palette piece. Dev only.
export const metadata: Metadata = { title: "Glass specimens · Ryvo lab", robots: { index: false, follow: false } };

export default function GlassPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className={s.page}>
      <header className={s.top}>
        <span className="mono-label">RYVO LAB · GLASS · DEV ONLY · NOINDEX</span>
        <h1 className={`display ${s.h1}`}>Three glasses</h1>
        <p className={s.lead}>No borders, no bevels, no fringes. One light from above, one hairline, shadows you only see when you look. The same card, tab switch, switch and chip in each, over three backdrops.</p>
      </header>
      <Specimens />
    </div>
  );
}
