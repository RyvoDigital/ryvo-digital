import type { Metadata } from "next";
import { notFound } from "next/navigation";
import s from "@/components/lab/specimens.module.css";
import { Specimens } from "@/components/lab/Specimens";
import { CrystalRound } from "@/components/lab/Crystal";

// Glass round 3: three borderless specimens for Manuel to choose from, before
// the chosen one is rolled out to every palette piece. Dev only.
export const metadata: Metadata = { title: "Glass specimens · Ryvo lab", robots: { index: false, follow: false } };

export default function GlassPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className={s.page}>
      <header className={s.top}>
        <span className="mono-label">RYVO LAB · GLASS · DEV ONLY · NOINDEX</span>
        <h1 className={`display ${s.h1}`}>Crystal</h1>
        <p className={s.lead}>Round 4. Manuel picked Crystal. The old B beside two crystals: C1, the CSS crystal for every UI piece, and C2, a real three.js slab for stages where we own the backdrop. Over a chrome object first, then the mercury glow, then the light room.</p>
      </header>
      <CrystalRound />
      <header className={s.top} style={{ paddingTop: 120 }}>
        <span className="mono-label">ROUND 3 · KEPT FOR REFERENCE</span>
        <h2 className={`display ${s.h1}`} style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>Three glasses</h2>
        <p className={s.lead}>No borders, no bevels, no fringes. One light from above, one hairline, shadows you only see when you look.</p>
      </header>
      <Specimens />
    </div>
  );
}
