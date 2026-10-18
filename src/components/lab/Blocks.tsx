"use client";

import { useEffect, useRef, useState } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import { monthly, setup, ADD_ON, BASE_MONTHLY } from "@/lib/pricing";
import DigitRoll from "@/components/chrome/DigitRoll";
import { Glass, SwitchRow } from "./Glass";
import s from "./palette.module.css";

const AUTOMATIONS = [
  { n: "01", name: "Inbound concierge", obj: "01-concierge", line: "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked." },
  { n: "02", name: "Contact reactivation", obj: "02-reactivation", line: "Get back in touch with the people who already know you." },
  { n: "03", name: "Buyer follow-up", obj: "03-follow-up", line: "Keep close the buyers who are not ready yet." },
  { n: "04", name: "Listing launch", obj: "04-launch", line: "One listing, four languages, the legal lines in place." },
  { n: "05", name: "After the deed", obj: "05-deed", line: "A thank-you and a review request, to every client." },
];

/** Children of the root settle in one after another as it scrolls into view. */
function useStagger<T extends HTMLElement>(selector: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    const items = Array.from(node.querySelectorAll<HTMLElement>(selector));
    return withMotion(({ gsap }) => {
      const tw = gsap.from(items, { y: 28, opacity: 0, filter: "blur(6px)", duration: 1, stagger: 0.08, ease: "expo.out", clearProps: "filter", scrollTrigger: { trigger: node, start: "top 82%", once: true } });
      return () => { tw.scrollTrigger?.kill(); tw.kill(); };
    });
  }, [selector]);
  return ref;
}

// ── 05 Bento ────────────────────────────────────────────────────────────────
export function Bento() {
  const ref = useStagger<HTMLDivElement>("[data-tile]");
  const cls = [s.tileBig, s.tileWide, "", "", s.tileWide];
  return (
    <div className={s.stage}>
      <div ref={ref} className={s.bento}>
        {AUTOMATIONS.map((a, i) => (
          <Glass key={a.n} as="article" className={`${s.tile} ${cls[i]}`} data-tile>
            <img className={s.tileObj} src={`/media/objects/${a.obj}-480.webp`} alt="" loading="lazy" />
            <span className={s.tileNum}>[{a.n}]</span>
            <h3 className={s.tileName}>{a.name}</h3>
            {(i === 0 || i === 1 || i === 4) && <p className={s.tileLine}>{a.line}</p>}
          </Glass>
        ))}
        <Glass as="article" className={`${s.tile} ${s.tileWide} ${s.tileReport}`} data-tile>
          <span className={s.tileNum}>ALSO INCLUDED</span>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h3 className={s.tileName}>A report, every week.</h3>
            <div className={s.reportLines} aria-hidden="true"><span /><span /><span /></div>
          </div>
        </Glass>
      </div>
    </div>
  );
}

// ── 06 Object frame ─────────────────────────────────────────────────────────
// The object tilts toward a fine pointer (GSAP quickTo, expo) and floats slowly.
export function ObjectFrame() {
  const [cur, setCur] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = frame.current, o = img.current;
    if (!f || !o || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    return withMotion(({ gsap }) => {
      const rx = gsap.quickTo(o, "rotationX", { duration: 1, ease: "expo.out" });
      const ry = gsap.quickTo(o, "rotationY", { duration: 1, ease: "expo.out" });
      const move = (e: PointerEvent) => { const r = f.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 18); rx(-((e.clientY - r.top) / r.height - 0.5) * 14); };
      const leave = () => { rx(0); ry(0); };
      f.addEventListener("pointermove", move);
      f.addEventListener("pointerleave", leave);
      return () => { f.removeEventListener("pointermove", move); f.removeEventListener("pointerleave", leave); };
    });
  }, []);
  const a = AUTOMATIONS[cur];
  return (
    <div className={s.objWrap}>
      <div ref={frame} className={s.objFrame}>
        <span className={s.objHalo} aria-hidden="true" />
        <div ref={img} className={s.objImg}>
          <img key={a.obj} src={`/media/objects/${a.obj}-800.webp`} alt={`${a.name}: chrome object`} className={s.objIn} />
        </div>
        <span className="mono-label" style={{ position: "absolute", left: 20, bottom: 16 }}>[{a.n}] {a.name.toUpperCase()}</span>
      </div>
      <div className={s.objList}>
        {AUTOMATIONS.map((x, i) => (
          <button key={x.n} className={s.objBtn} aria-pressed={cur === i} onClick={() => setCur(i)} onPointerEnter={() => setCur(i)}>
            <img src={`/media/objects/${x.obj}-480.webp`} alt="" />
            {x.name}
          </button>
        ))}
        <p className={s.note} style={{ marginTop: 10 }}>Today: the five stills from the homepage build. Each direction below says which new Kie renders it would need.</p>
      </div>
    </div>
  );
}

// ── 09 Pricing ──────────────────────────────────────────────────────────────
// Same model and formula as the locked homepage picker (lib/pricing.ts).
export function PricingModule() {
  const [chosen, setChosen] = useState([0, 1]);
  const setOn = (i: number, on: boolean) => setChosen((c) => (on ? [...new Set([...c, i])].sort() : c.filter((x) => x !== i)));
  const m = chosen.length ? monthly(chosen) : 0;
  const u = chosen.length ? setup(chosen) : 0;
  // The automation with the highest add-on carries the €350 base; the others add on.
  const lead = chosen.length ? chosen.reduce((a, b) => (ADD_ON[b] > ADD_ON[a] ? b : a)) : -1;
  const eur = (n: number) => new Intl.NumberFormat("en").format(n);
  return (
    <div className={s.stage}>
      <div className={s.pricing}>
        <div className={s.chips}>
          {AUTOMATIONS.map((a, i) => (
            <SwitchRow key={a.n} id={`pr-${i}`} on={chosen.includes(i)} onChange={(v) => setOn(i, v)}>
              <span className="mono-label">{a.n}</span>
              {a.name}
            </SwitchRow>
          ))}
        </div>
        <Glass className={s.receipt}>
          <span className="mono-label" style={{ position: "relative", zIndex: 2 }}>LAUNCH PRICING · EXCL. VAT</span>
          {/* Every automation stays listed; an unticked one fades and its price strikes through. */}
          <div className={s.receiptRows}>
            {AUTOMATIONS.map((a, c) => (
              <div key={a.n} className={s.receiptRow} data-on={chosen.includes(c)}>
                <span>{a.n} {a.name}</span>
                <span className="tnum">{c === lead ? `€${BASE_MONTHLY}` : `+€${ADD_ON[c]}`}</span>
              </div>
            ))}
          </div>
          <div className={s.total} aria-live="polite">
            <span className="mono-label">FROM</span>
            <span className={`${s.totalNum} chrome-text`}>€<DigitRoll value={eur(m)} /></span>
            <span className="mono-label">/ MONTH</span>
          </div>
          <p className={s.fine}>Setup from €{eur(u)}, half at signing, half at go-live. For agencies up to 8 consultants and one office; larger teams get a quote.</p>
        </Glass>
      </div>
    </div>
  );
}

// ── 11 Principles ───────────────────────────────────────────────────────────
// Each row is a true trade-off from the claims register.
const PRINCIPLES = [
  ["A chatbot that guesses.", "When it would have to guess, it hands the conversation to a person."],
  ["Hiding that it is an AI.", "Its first message says so, in the buyer’s language. It cannot be switched off."],
  ["Cold outreach.", "Only contacts whose origin is documented. Objections are never contacted."],
  ["A new dashboard to learn.", "Nothing new for your team: WhatsApp and Google Calendar, as today."],
  ["A template.", "A website designed for your brand, built by the people you speak to."],
];

export function Principles() {
  const ref = useStagger<HTMLDivElement>("[data-row]");
  return (
    <div ref={ref} className={s.principles}>
      {PRINCIPLES.map(([no, yes]) => (
        <div key={no} className={s.pRow} data-row>
          <p className={s.pInstead}><span className="mono-label" style={{ textDecoration: "none", display: "inline-block", marginRight: 12 }}>INSTEAD OF</span>{no}</p>
          <p className={s.pWe}>{yes}</p>
        </div>
      ))}
    </div>
  );
}

// ── 13 FAQ ──────────────────────────────────────────────────────────────────
const FAQ = [
  ["Do buyers know they are talking to an AI?", "Yes, always. The first message says so in the buyer’s language, and it is repeated when a buyer returns after 30 days. The EU AI Act requires it, and we enforce it in the software, not in a setting."],
  ["Who handles price and negotiation?", "Your team, always. The moment price or negotiation comes up, the assistant hands over to your consultant with a card on WhatsApp."],
  ["Which calendar does it use?", "Google Calendar. Outlook is not supported today."],
  ["Do we need a CRM?", "No. If you use one, tell us which on the call."],
];

export function GlassFaq() {
  const [open, setOpen] = useState(0);
  return (
    <div className={s.stage}>
      <div className={s.faq}>
        {FAQ.map(([q, a], i) => (
          <Glass key={q} className={s.faqItem} data-open={open === i}>
            <button className={s.faqQ} aria-expanded={open === i} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
              {q}
              <span className={s.faqPlus} aria-hidden="true" />
            </button>
            <div className={s.faqA} id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} inert={open !== i}>
              <div><p>{a}</p></div>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── 14 CTA band ─────────────────────────────────────────────────────────────
export function CtaBand() {
  const ref = useStagger<HTMLDivElement>("[data-line]");
  return (
    <div ref={ref} id="cta" className={s.ctaStage}>
      <img className={s.ctaObj} src="/media/objects/02-reactivation-800.webp" alt="" loading="lazy" />
      <Glass className={s.cta}>
        <h2 className={`display ${s.ctaTitle}`}>
          <span data-line style={{ display: "block" }}>See it working,</span>
          <span data-line className="chrome-text" style={{ display: "block" }}>then decide.</span>
        </h2>
        <div data-line>
          <p className={s.ctaBody}>A short call: we show you the system working, learn how your agency works and adapt it to you. If it is not the right moment, just say so.</p>
          <a className="btn" href="#cta">
            Book a call
            <span className="btn-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </span>
          </a>
        </div>
      </Glass>
    </div>
  );
}
