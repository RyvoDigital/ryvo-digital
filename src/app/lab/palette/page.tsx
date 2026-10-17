import { notFound } from "next/navigation";
import s from "@/components/lab/palette.module.css";
import { GlassCard, GlassSegmented, GlassToggle, GlassDock, RefractFilter } from "@/components/lab/Glass";
import { StickyStory, Timeline, ProofStats, CitiesArc } from "@/components/lab/Scroll";
import { Bento, PricingModule, GlassFaq, CtaBand, ObjectFrame, Principles } from "@/components/lab/Blocks";
import { AutomationIcons } from "@/components/lab/AnimatedIcons";

// Step 1 of the page redesign: the pieces the four pages (/automations,
// /websites, /about, /book) will be built from, live with their motion, in the
// locked tokens. Dev only.
export default function PalettePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const pieces: { id: string; n: string; name: string; use: string; node: React.ReactNode }[] = [
    { id: "glass-card", n: "01", name: "Liquid-glass card", use: "Base surface for every card, plan, panel and modal. Six layers: frost body, refracting rim (Chromium), chrome rim light, pointer specular, bottom shade, drop shadow.", node: <GlassCard /> },
    { id: "segmented", n: "02", name: "Glass tab switch", use: "Automations | Websites switch on /book and /how-we-work; any two- or three-way choice.", node: <GlassSegmented /> },
    { id: "toggle", n: "03", name: "Glass toggle", use: "The pricing picker's module switches; any on/off.", node: <GlassToggle /> },
    { id: "icons", n: "04", name: "Animated icon set", use: "The five automations, drawn on scroll-in, a small gesture each on hover. Inline SVG + GSAP stroke drawing.", node: <AutomationIcons /> },
    { id: "bento", n: "05", name: "Bento grid", use: "The five automations at a glance on /automations; the services on /websites.", node: <Bento /> },
    { id: "object", n: "06", name: "Object frame", use: "A chrome object (Kie render) on a ring of light, floating, tilting toward the pointer.", node: <ObjectFrame /> },
    { id: "story", n: "07", name: "Sticky scroll story", use: "One automation, or one project, told in three beats while the visual stays pinned.", node: <StickyStory /> },
    { id: "timeline", n: "08", name: "Feature timeline", use: "From the first call to go-live (/automations), how a project runs (/websites), what happens after you book (/book).", node: <Timeline /> },
    { id: "pricing", n: "09", name: "Pricing module", use: "Tick automations; a glass receipt itemises them and rolls the monthly and setup totals.", node: <PricingModule /> },
    { id: "proof", n: "10", name: "Stat / proof block", use: "True figures only, as giant type that counts up once.", node: <ProofStats /> },
    { id: "principles", n: "11", name: "Principles rows", use: "Trust without testimonials: “Instead of …, we …”, each a true trade-off.", node: <Principles /> },
    { id: "cities", n: "12", name: "Two cities", use: "Lisbon and Madrid as coordinates and one arc, drawn on scroll. No faces needed.", node: <CitiesArc /> },
    { id: "faq", n: "13", name: "Glass FAQ accordion", use: "Questions on /automations, /websites and /book.", node: <GlassFaq /> },
    { id: "cta", n: "14", name: "CTA band", use: "The closing ask on every page, in glass over a mercury glow.", node: <CtaBand /> },
    { id: "dock", n: "15", name: "Glass section dock", use: "A floating pill that follows a long page: section index, progress, one-tap Book. (Live at the bottom of this page.)", node: <p className={s.note}>The dock is floating at the bottom of the screen. It tracks the section in view.</p> },
  ];

  return (
    <div className={s.page}>
      <RefractFilter />
      <header className={s.top}>
        <span className="mono-label">RYVO LAB · DEV ONLY · NOINDEX</span>
        <h1 className={`display ${s.h1}`}>Component palette</h1>
        <p className={s.lead}>Fifteen pieces for /automations, /websites, /about and /book, in Obsidian &amp; Mercury. Every piece respects reduced motion: it simply appears.</p>
      </header>
      {pieces.map((p) => (
        <section key={p.id} id={p.id} className={s.piece} data-piece={p.n}>
          <div className={s.meta}>
            <span className="mono-label">[{p.n}]</span>
            <h2 className={s.h2}>{p.name}</h2>
            <p className={s.use}>{p.use}</p>
          </div>
          <div className={s.demo}>{p.node}</div>
        </section>
      ))}
      <GlassDock items={pieces.map((p) => ({ id: p.id, n: p.n, name: p.name }))} />
    </div>
  );
}
