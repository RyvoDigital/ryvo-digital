"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import s from "./palette.module.css";

// The SVG that bends the glass rim. A low-frequency, smoothed noise so the rim
// bends calmly (scale 9), never wobbles. Turned on only where backdrop-filter
// accepts an SVG url (Chromium), by setting html[data-refract].
export function RefractFilter() {
  useEffect(() => {
    try {
      if (CSS.supports("backdrop-filter", "url(#lab-refract) blur(1px)")) document.documentElement.dataset.refract = "";
    } catch {}
  }, []);
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <filter id="lab-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.011 0.014" numOctaves="2" seed="7" result="n" />
        <feGaussianBlur in="n" stdDeviation="3" result="nb" />
        <feDisplacementMap in="SourceGraphic" in2="nb" scale="9" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/** The liquid-glass surface. The specular follows a fine pointer, eased (expo, 0.6 s). */
export function Glass({ as: Tag = "div", className = "", children, ...rest }: { as?: "div" | "article" | "section" | "nav" | "button" | "aside"; className?: string; children: ReactNode } & Record<string, unknown>) {
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    return withMotion(({ gsap }) => {
      // A plain proxy, eased, written to the two custom properties.
      const p = { x: 30, y: -10 };
      const paint = () => { node.style.setProperty("--mx", `${p.x}%`); node.style.setProperty("--my", `${p.y}%`); };
      const x = gsap.quickTo(p, "x", { duration: 0.6, ease: "expo.out", onUpdate: paint });
      const y = gsap.quickTo(p, "y", { duration: 0.6, ease: "expo.out", onUpdate: paint });
      const move = (e: PointerEvent) => {
        const r = node.getBoundingClientRect();
        x(((e.clientX - r.left) / r.width) * 100);
        y(((e.clientY - r.top) / r.height) * 100);
      };
      const leave = () => { x(30); y(-10); };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => { node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", leave); };
    });
  }, []);
  const T = Tag as "div";
  return (
    <T ref={el as React.Ref<HTMLDivElement>} className={`${s.glass} ${className}`} {...rest}>
      <span className={s.rim} aria-hidden="true" />
      {children}
    </T>
  );
}

export function GlassCard() {
  const cards = [
    ["Answers in seconds", "Every enquiry answered in a few seconds, in the buyer’s language, and the viewing booked."],
    ["Price stays with you", "The moment price or negotiation comes up, your consultant gets a card on WhatsApp."],
    ["Always disclosed", "Its first message says plainly that it is your agency’s AI assistant, not a person."],
  ];
  return (
    <div className={s.stage}>
      <span className={s.stageRing} aria-hidden="true" />
      <img className={s.stageObject} src="/media/objects/01-concierge-480.webp" alt="" />
      <div className={s.cardRow}>
        {cards.map(([t, b], i) => (
          <Glass key={t} as="article" className={s.card}>
            <span className={`mono-label ${s.glassBody}`}>[0{i + 1}]</span>
            <div className={s.glassBody}>
              <h3 className={s.cardTitle}>{t}</h3>
              <p className={s.cardText}>{b}</p>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// A glass track with a solid off-white thumb that glides to the chosen tab.
export function GlassSegmented() {
  const tabs = [
    ["Automations", "A short call with Manuel or Martim. We show you the system working."],
    ["Websites", "A short call with Manuel or Phil, about your website."],
    ["Not sure yet", "Pick either; we will point you to the right one."],
  ];
  const [on, setOn] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const b = btns.current[on];
    if (b) setThumb({ x: b.offsetLeft, w: b.offsetWidth });
  }, [on]);
  return (
    <div className={s.stage}>
      <Glass className={s.seg} role="tablist" aria-label="Call type">
        <span className={s.segThumb} style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }} aria-hidden="true" />
        {tabs.map(([t], i) => (
          <button key={t} ref={(n) => { btns.current[i] = n; }} role="tab" aria-selected={on === i} className={s.segBtn} onClick={() => setOn(i)}
            onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length; setOn(n); btns.current[n]?.focus(); } }}
            tabIndex={on === i ? 0 : -1}>
            {t}
          </button>
        ))}
      </Glass>
      <p className={s.segPanel} role="tabpanel">{tabs[on][1]}</p>
    </div>
  );
}

export function GlassToggle() {
  const names = ["Inbound concierge", "Contact reactivation", "Buyer follow-up"];
  const [on, setOn] = useState([true, true, false]);
  return (
    <div className={s.stage}>
      <div className={s.toggles}>
        {names.map((n, i) => (
          <Glass key={n} as="button" className={s.toggleRow} role="switch" aria-checked={on[i]} onClick={() => setOn((v) => v.map((x, j) => (j === i ? !x : x)))}>
            <span>{n}</span>
            <span className={s.switch} aria-hidden="true" />
          </Glass>
        ))}
      </div>
    </div>
  );
}

// The floating section dock: which section is in view, how far through the
// page, previous / next, all in one small glass pill.
export function GlassDock({ items }: { items: { id: string; n: string; name: string }[] }) {
  const [cur, setCur] = useState(0);
  const [p, setP] = useState(0);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCur(els.indexOf(e.target as HTMLElement)); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    els.forEach((e) => io.observe(e));
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const h = document.documentElement; setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [items]);
  const go = (d: number) => {
    const i = Math.min(items.length - 1, Math.max(0, cur + d));
    document.getElementById(items[i].id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };
  const C = 2 * Math.PI * 11;
  return (
    <Glass as="nav" className={s.dock} aria-label="Palette sections">
      <span className={s.dockIdx} aria-live="polite">
        <svg className={s.dockRing} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(205,209,217,.18)" strokeWidth="2" />
          <circle cx="14" cy="14" r="11" fill="none" stroke="#f1f2f4" strokeWidth="2" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
        </svg>
        <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", color: "var(--color-steel)" }}>{items[cur]?.n}</span>
        <span className={s.dockName}>{items[cur]?.name}</span>
      </span>
      <span className={s.dockNav}>
        <button className={s.dockBtn} onClick={() => go(-1)} aria-label="Previous section">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
        </button>
        <button className={s.dockBtn} onClick={() => go(1)} aria-label="Next section">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </span>
      <a href="#cta" className="btn" style={{ position: "relative", zIndex: 2, minHeight: 40 }}>
        Book a call
        <span className="btn-arrow" aria-hidden="true" style={{ width: 32, height: 32 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
        </span>
      </a>
    </Glass>
  );
}
