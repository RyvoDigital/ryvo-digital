"use client";

import { useEffect, useRef, useState } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import { Glass } from "./Glass";
import s from "./palette.module.css";

// ── 07 Sticky scroll story ───────────────────────────────────────────────────
// The visual stays pinned (CSS sticky, so it works before GSAP and with Lenis)
// while three beats scroll past; the beat nearest the middle of the screen
// lights up and its panel settles in from a soft blur.
const BEATS = [
  ["23:47. A buyer writes.", "Every enquiry answered in a few seconds, in the buyer’s language. Day and night."],
  ["It answers, and books.", "Free times from your Google Calendar, within your working hours. The buyer picks one."],
  ["Price comes up. Your team takes over.", "A handover card on WhatsApp goes to the right consultant. Price and negotiation always stay with your team."],
];

export function StickyStory() {
  const [on, setOn] = useState(0);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setOn(steps.current.indexOf(e.target as HTMLDivElement)); }), { rootMargin: "-48% 0px -48% 0px" });
    steps.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, []);
  return (
    <div className={s.story}>
      <div className={`${s.stage} ${s.storyVisual}`}>
        <span className="mono-label" style={{ position: "absolute", top: 18, left: 22, zIndex: 3 }}>SIMULATED CONVERSATION</span>
        <div className={s.storyPanel} data-on={on === 0}>
          <div style={{ display: "grid", gap: 10, width: "min(340px,100%)" }}>
            <div className={`${s.bubble} ${s.bubbleIn}`}>Hi, is the 3-bedroom in Estrela still available? We could visit this week.</div>
            <div className={`${s.bubble} ${s.bubbleOut}`}>Hello, I&rsquo;m Casa Exemplo&rsquo;s AI assistant, not a person. Yes, it is available.</div>
          </div>
        </div>
        <div className={s.storyPanel} data-on={on === 1}>
          <Glass className={s.miniCard}>
            <span className="mono-label" style={{ position: "relative", zIndex: 2 }}>THU 22 OCT · FREE TIMES</span>
            <div className={s.miniRow}><span>10:00</span><span style={{ textDecoration: "line-through", color: "var(--color-steel)" }}>unavailable</span></div>
            <div className={s.miniRow}><b>11:00</b><b className="chrome-text">Viewing booked ✓</b></div>
            <div className={s.miniRow}><span>12:30</span><span>free</span></div>
          </Glass>
        </div>
        <div className={s.storyPanel} data-on={on === 2}>
          <Glass className={s.miniCard}>
            <span className="mono-label" style={{ position: "relative", zIndex: 2 }}>HANDOVER · WHATSAPP</span>
            <div className={s.miniRow}><span>Language</span><b>English</b></div>
            <div className={s.miniRow}><span>Looking for</span><b>T3, Estrela</b></div>
            <div className={s.miniRow}><span>Reason</span><b>Price negotiation</b></div>
          </Glass>
        </div>
      </div>
      <div className={s.storySteps}>
        {BEATS.map(([h, p], i) => (
          <div key={h} ref={(n) => { steps.current[i] = n; }} className={s.storyStep} data-on={on === i}>
            <span className="mono-label">0{i + 1} / 03</span>
            <h3>{h}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 08 Feature timeline ──────────────────────────────────────────────────────
// A mercury rail with a soft light travelling down it, scrubbed to the scroll.
// Each step's glass chip draws its icon as the light reaches it; the active
// step lifts into a glass card over a glow (pinned beside the rail on desktop,
// in place on phones), with a mono counter. Passed steps stay lit but quieter;
// upcoming ones dim. Reduced motion: every step shown lit, nothing pinned.
const STEPS: { t: string; b: string; icon: React.ReactNode }[] = [
  { t: "A short call", b: "We show you the system working, learn how your agency works, and tell you honestly whether it fits.",
    icon: <><path className="draw" pathLength={1} d="M3 8.5A2.5 2.5 0 0 1 5.5 6h8A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 15.5Z" /><path className="draw" pathLength={1} d="m16 10.5 5-3v9l-5-3" /></> },
  { t: "Proposal within 24 hours", b: "One page: what we would set up, the monthly price and the go-live plan.",
    icon: <><path className="draw" pathLength={1} d="M11 21H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3H14l4 4v3" /><path className="draw" pathLength={1} d="M17 13a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" /><path className="draw" pathLength={1} d="M17 15.2V17l1.3 1" /></> },
  { t: "Contract and data processing agreement", b: "No data of yours enters our systems before both are signed.",
    icon: <><path className="draw" pathLength={1} d="M6.5 3h8L19 7.5v12a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3Z" /><path className="draw" pathLength={1} d="M8 8h5M8 11h7" /><path className="draw" pathLength={1} d="M8 17c1.2-2 2-2 2.6-.4.5 1.3 1.2 1.3 2-.2.6-1 1.3-1 2 .2" /></> },
  { t: "One setup form", b: "Agency details, AMI licence, WhatsApp number, calendar and hours, areas, languages, tone.",
    icon: <><path className="draw" pathLength={1} d="M6.5 4h11A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4Z" /><path className="draw" pathLength={1} d="m8 9 1.3 1.3L11.5 8M13.5 9.5H16" /><path className="draw" pathLength={1} d="m8 15 1.3 1.3 2.2-2.3M13.5 15.5H16" /></> },
  { t: "WhatsApp and Meta", b: "We take you through Meta\u2019s business verification and get the message templates approved.",
    icon: <><path className="draw" pathLength={1} d="m12 3 2.2 1.6 2.7-.1.8 2.6 2.2 1.6-.9 2.5.9 2.5-2.2 1.6-.8 2.6-2.7-.1L12 21l-2.2-1.6-2.7.1-.8-2.6-2.2-1.6.9-2.5-.9-2.5 2.2-1.6.8-2.6 2.7.1Z" /><path className="draw" pathLength={1} d="m8.8 12.2 2.2 2.2 4.2-4.6" /></> },
  { t: "Testing", b: "At least twenty test conversations against your setup, including the awkward ones.",
    icon: <><path className="draw" pathLength={1} d="M9.5 3h5M10.5 3v5.5l-5.2 9.1A2.3 2.3 0 0 0 7.3 21h9.4a2.3 2.3 0 0 0 2-3.4l-5.2-9.1V3" /><path className="draw" pathLength={1} d="M7.4 14.5h9.2" /></> },
  { t: "Careful go-live", b: "We switch on in stages and read every conversation in the first days.",
    icon: <><path className="draw" pathLength={1} d="M4 19h4v-4h4v-4h4V7h4" /><path className="draw" pathLength={1} d="M17 4h3v3" /></> },
  { t: "Every month", b: "A check-in on what the reports show and what to adjust.",
    icon: <><path className="draw" pathLength={1} d="M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z" /><path className="draw" pathLength={1} d="M4 9.5h16M8.5 3v4M15.5 3v4" /><path className="draw" pathLength={1} d="m9.5 15 1.8 1.8 3.4-3.6" /></> },
];

const Icon = ({ i, className }: { i: number; className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <g className="ghost">{STEPS[i].icon}</g>
    {STEPS[i].icon}
  </svg>
);

export function Timeline() {
  const list = useRef<HTMLDivElement>(null);
  // Before script (and with reduced motion) every step is lit: -1 means "all".
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const node = list.current;
    if (!node || prefersReducedMotion()) return;
    const items = Array.from(node.querySelectorAll<HTMLElement>("[data-step]"));
    node.style.setProperty("--p", "0");
    const frame = () => setActive(0);
    const id = requestAnimationFrame(frame);
    const stop = withMotion(({ ScrollTrigger }) => {
      const st = ScrollTrigger.create({
        trigger: node,
        start: "top 55%",
        end: "bottom 55%",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          node.style.setProperty("--p", String(p));
          node.style.setProperty("--lo", String(Math.min(1, p * 12, (1 - p) * 12 + 0.25)));
          // The light's position along the rail, against each chip's centre.
          const r = node.getBoundingClientRect(), top = r.top + 28, h = r.height - 56;
          let a = 0;
          items.forEach((it, i) => { const ir = it.getBoundingClientRect(); if ((ir.top + ir.height / 2 - top) / h <= p + 0.004) a = i; });
          setActive(a);
        },
      });
      return () => st.kill();
    });
    return () => { cancelAnimationFrame(id); stop(); };
  }, []);
  const shown = active < 0 ? 0 : active;
  const state = (i: number) => (active < 0 ? "past" : i < active ? "past" : i === active ? "active" : "next");
  return (
    <div className={s.tl}>
      <div className={`${s.stage} ${s.tlStage}`} aria-hidden="true">
        <Glass key={shown} className={`${s.tlCard} ${s.tlCardIn}`}>
          <span className={s.tlCount}><b>{String(shown + 1).padStart(2, "0")}</b> / {String(STEPS.length).padStart(2, "0")}</span>
          <Icon i={shown} className={`${s.tlBig} ${s.tlIcon}`} />
          <h3 className={s.tlCardTitle}>{STEPS[shown].t}</h3>
          <p className={s.tlCardText}>{STEPS[shown].b}</p>
        </Glass>
      </div>
      <div ref={list} className={s.tlList}>
        <span className={s.tlTrack} aria-hidden="true" />
        <span className={s.tlFill} aria-hidden="true" />
        <span className={s.tlLight} aria-hidden="true" />
        <ol className={s.tlOl}>
        {STEPS.map((st, i) => (
          <li key={st.t} className={s.tlItem} data-step data-state={state(i)} aria-current={active === i ? "step" : undefined}>
            <Glass className={s.tlChip}><Icon i={i} className={s.tlIcon} /></Glass>
            <span className={s.tlNum}>{String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span>
            <h3 className={s.tlTitle}>{st.t}</h3>
            <p className={s.tlText}>{st.b}</p>
          </li>
        ))}
        </ol>
      </div>
    </div>
  );
}

// ── 10 Proof ─────────────────────────────────────────────────────────────────
// True figures only (claims register): the regression record of 15 Oct 2026.
const PROOF: [number, string, string][] = [
  [3600, "+", "automated tests on every change, before it reaches your clients"],
  [5, "", "automations, from the first contact until after the deed"],
  [2, "", "cities we work from: Lisbon and Madrid"],
];

export function ProofStats() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;
    const nums = Array.from(node.querySelectorAll<HTMLElement>("[data-n]"));
    return withMotion(({ gsap, ScrollTrigger }) => {
      const fmt = new Intl.NumberFormat("en");
      const st = ScrollTrigger.create({
        trigger: node,
        start: "top 75%",
        once: true,
        onEnter: () => nums.forEach((el, i) => {
          const o = { v: 0 };
          const to = Number(el.dataset.n);
          gsap.to(o, { v: to, duration: 1.6, delay: i * 0.12, ease: "expo.out", onUpdate: () => { el.firstChild!.textContent = fmt.format(Math.round(o.v)); } });
        }),
      });
      nums.forEach((el) => (el.firstChild!.textContent = "0"));
      return () => st.kill();
    });
  }, []);
  return (
    <div ref={root} className={s.proof}>
      {PROOF.map(([n, suf, label]) => (
        <div key={label} className={s.proofRow}>
          <span className={`${s.proofNum} tnum`} data-n={n}>
            <span className="chrome-text">{new Intl.NumberFormat("en").format(n)}</span>
            <span className="chrome-text">{suf}</span>
          </span>
          <p className={s.proofLabel}>{label}</p>
        </div>
      ))}
    </div>
  );
}
