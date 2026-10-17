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
// A silver rail fills with the scroll (scrubbed); each step lights as the fill
// reaches it. Without script, or with reduced motion: full rail, every step lit.
const STEPS = [
  ["A short call", "We show you the system working, learn how your agency works, and tell you honestly whether it fits."],
  ["Proposal within 24 hours", "One page: what we would set up, the monthly price and the go-live plan."],
  ["Contract and data processing agreement", "No data of yours enters our systems before both are signed."],
  ["One setup form", "Agency details, AMI licence, WhatsApp number, calendar and hours, areas, languages, tone."],
  ["WhatsApp and Meta", "We take you through Meta’s business verification and get the message templates approved."],
  ["Testing", "At least twenty test conversations against your setup, including the awkward ones."],
  ["Careful go-live", "We switch on in stages and read every conversation in the first days."],
  ["Every month", "A check-in on what the reports show and what to adjust."],
];

export function Timeline() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;
    const nodes = Array.from(node.querySelectorAll<HTMLElement>("[data-node]"));
    nodes.forEach((n) => (n.dataset.on = "false"));
    fill.current?.style.setProperty("--p", "0");
    return withMotion(({ ScrollTrigger }) => {
      const st = ScrollTrigger.create({
        trigger: node,
        start: "top 62%",
        end: "bottom 62%",
        scrub: 0.6,
        onUpdate: (self) => {
          fill.current?.style.setProperty("--p", String(self.progress));
          const railTop = node.getBoundingClientRect().top;
          const h = node.offsetHeight;
          nodes.forEach((n) => { n.dataset.on = String((n.getBoundingClientRect().top - railTop) / h <= self.progress + 0.01); });
        },
      });
      return () => st.kill();
    });
  }, []);
  return (
    <div ref={root} className={s.timeline}>
      <span className={s.rail} aria-hidden="true" />
      <span ref={fill} className={s.railFill} aria-hidden="true" />
      {STEPS.map(([t, b], i) => (
        <div key={t} className={s.node} data-node data-on="true">
          <span className={s.nodeNum}>STEP 0{i + 1}</span>
          <h3 className={s.nodeTitle}>{t}</h3>
          <p className={s.nodeText}>{b}</p>
        </div>
      ))}
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

// ── 12 Two cities ───────────────────────────────────────────────────────────
// Lisbon and Madrid as coordinates and one arc that draws with the scroll; a
// small light travels it. 503 km is the straight-line distance between them.
export function CitiesArc() {
  const root = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGPathElement>(null);
  useEffect(() => {
    const node = root.current;
    const p = arc.current;
    if (!node || !p || prefersReducedMotion()) return;
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L}`;
    p.style.strokeDashoffset = `${L}`;
    return withMotion(({ gsap }) => {
      const tw = gsap.to(p, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: node, start: "top 80%", end: "center 45%", scrub: 0.8 } });
      return () => { tw.scrollTrigger?.kill(); tw.kill(); };
    });
  }, []);
  const d = "M150 262 Q500 40 850 200";
  return (
    <div ref={root} className={`${s.stage} ${s.cities}`}>
      <svg viewBox="0 0 1000 360" role="img" aria-label="Lisbon and Madrid, 503 km apart">
        <defs>
          <linearGradient id="arcG" x1="0" x2="1"><stop offset="0" stopColor="#8e939b" /><stop offset=".5" stopColor="#fafbfc" /><stop offset="1" stopColor="#a9aeb6" /></linearGradient>
          <radialGradient id="dotG"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        <path d={d} fill="none" stroke="rgba(205,209,217,.12)" strokeWidth="1" strokeDasharray="2 6" />
        <path ref={arc} d={d} fill="none" stroke="url(#arcG)" strokeWidth="1.5" strokeLinecap="round" />
        <circle r="10" fill="url(#dotG)">
          <animateMotion dur="5s" repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
        </circle>
        {[[150, 262, "LISBON", "38.72°N · 9.14°W", "start"], [850, 200, "MADRID", "40.42°N · 3.70°W", "end"]].map(([x, y, n, c, a]) => (
          <g key={n as string}>
            <circle cx={x as number} cy={y as number} r="5" fill="#f1f2f4" />
            <circle cx={x as number} cy={y as number} r="16" fill="none" stroke="rgba(205,209,217,.35)" />
            <text className={s.cityName} x={x as number} y={(y as number) + 56} fontSize="40" textAnchor={a as "start" | "end"}>{n === "LISBON" ? "Lisbon" : "Madrid"}</text>
            <text className={s.cityLabel} x={x as number} y={(y as number) + 84} textAnchor={a as "start" | "end"}>{c}</text>
          </g>
        ))}
        <text className={s.cityLabel} x="500" y="120" textAnchor="middle">503 KM</text>
      </svg>
    </div>
  );
}
