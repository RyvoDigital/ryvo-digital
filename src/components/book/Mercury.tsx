"use client";

import { useEffect, useId, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/gsap";

// The footer's mercury horizon, made small: one line of liquid metal that
// fills as the booking advances. Each step sends a small ripple along it;
// when the call is booked the ripples die away and the line settles dead flat
// and polished, with one slow sheen. Drawn from gsap.ticker only while on
// screen; under reduced motion it is a still line that simply fills.
// The gradients are in user space: a dead-flat (settled) path has a
// zero-height bounding box, and a bounding-box gradient on it draws nothing.
const W = 1000, H = 28, N = 80;

function wave(t: number, amp: number) {
  let d = "";
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.sin(u * Math.PI);
    const y = H / 2 + amp * env * (3.4 * Math.sin(u * 7.1 + t * 0.6) + 2 * Math.sin(u * 15.3 - t * 0.9) + 0.9 * Math.sin(u * 31 + t * 1.7));
    d += `${i ? " L" : "M"}${(u * W).toFixed(1)} ${y.toFixed(2)}`;
  }
  return d;
}

export function MercuryLine({ progress, settled = false, className = "" }: { progress: number; settled?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const live = useRef({ p: progress, a: settled ? 0 : 1, settled });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const paths = Array.from(el.querySelectorAll<SVGPathElement>("[data-wave]"));
    const clip = el.querySelector<SVGRectElement>("[data-clip]")!;
    const head = el.querySelector<HTMLElement>("[data-head]")!;
    const sheen = el.querySelector<SVGLinearGradientElement>("[data-sheen]")!;
    const draw = (time: number) => {
      const d = wave(time, live.current.a);
      paths.forEach((p) => p.setAttribute("d", d));
      clip.setAttribute("width", String(live.current.p * W));
      head.style.transform = `translate3d(${(live.current.p - 1) * 100}%, 0, 0)`;
      sheen.setAttribute("gradientTransform", `translate(${(((time * 0.05) % 1.6 - 0.8) * W).toFixed(1)} 0)`);
    };
    draw(0);
    if (prefersReducedMotion()) return;
    let cancelled = false, cleanup: (() => void) | undefined;
    loadMotion().then(({ gsap }) => {
      if (cancelled) return;
      const tick = (time: number) => draw(time);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)));
      io.observe(el);
      cleanup = () => { io.disconnect(); gsap.ticker.remove(tick); };
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  // Progress and settling are tweens on the same object the ticker reads.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const v = live.current;
    if (prefersReducedMotion()) {
      v.p = progress; v.a = 0;
      el.querySelector<SVGRectElement>("[data-clip]")!.setAttribute("width", String(progress * W));
      el.querySelector<HTMLElement>("[data-head]")!.style.transform = `translate3d(${(progress - 1) * 100}%, 0, 0)`;
      return;
    }
    loadMotion().then(({ gsap }) => {
      gsap.to(v, { p: progress, duration: 1.4, ease: "expo.out", overwrite: "auto" });
      if (settled) gsap.to(v, { a: 0, duration: 2.4, ease: "expo.out", overwrite: "auto" });
      else gsap.fromTo(v, { a: 1.9 }, { a: 1, duration: 2.2, ease: "expo.out", overwrite: "auto" });
    });
    el.dataset.settled = String(settled);
  }, [progress, settled]);

  return (
    <div ref={root} className={className} data-mercury aria-hidden="true" style={{ position: "relative", height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`m-${id}`} gradientUnits="userSpaceOnUse" x1="0" x2={W} y1="0" y2="0">
            <stop offset="0" stopColor="#8e939b" />
            <stop offset="0.38" stopColor="#f4f5f7" />
            <stop offset="0.58" stopColor="#a9aeb6" />
            <stop offset="1" stopColor="#eef0f2" />
          </linearGradient>
          <linearGradient id={`s-${id}`} data-sheen gradientUnits="userSpaceOnUse" x1="0" x2={W} y1="0" y2="0">
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`c-${id}`}><rect data-clip x="0" y="-20" width="0" height={H + 40} /></clipPath>
        </defs>
        <path data-wave fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <g clipPath={`url(#c-${id})`}>
          <path data-wave fill="none" stroke={`url(#m-${id})`} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path data-wave fill="none" stroke={`url(#s-${id})`} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ mixBlendMode: "screen" }} />
        </g>
      </svg>
      {/* The bead at the head of the fill: a soft point of light. */}
      <div data-head style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: "translate3d(-100%,0,0)" }}>
        <span style={{ position: "absolute", right: -5, top: H / 2 - 5, width: 10, height: 10, borderRadius: "50%", background: "radial-gradient(circle, #fff 0 30%, rgba(238,240,242,0.5) 50%, transparent 72%)", opacity: progress > 0 && progress < 1 ? 1 : 0, transition: "opacity 0.6s" }} />
      </div>
    </div>
  );
}

// The confirmation mark: a chrome ring that closes, then the tick draws
// inside it. Stroke drawing on a 64 px SVG; under reduced motion it is drawn.
export function DoneMark({ size = 64 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" data-done-mark>
      <defs>
        <linearGradient id={`d-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fafbfc" />
          <stop offset="0.38" stopColor="#a9aeb6" />
          <stop offset="0.58" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#8e939b" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <circle cx="32" cy="32" r="29" fill="none" stroke={`url(#d-${id})`} strokeWidth="2.4" strokeLinecap="round" pathLength="1" className="dm-ring" transform="rotate(-90 32 32)" />
      <path d="M21 33.5l7.5 7.5L44 24.5" fill="none" stroke="#f1f2f4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="dm-tick" />
      <style>{`
        .dm-ring{stroke-dasharray:1;stroke-dashoffset:1;animation:dm-draw 1.5s cubic-bezier(.16,1,.3,1) .15s forwards}
        .dm-tick{stroke-dasharray:1;stroke-dashoffset:1;animation:dm-draw .9s cubic-bezier(.16,1,.3,1) .95s forwards}
        @keyframes dm-draw{to{stroke-dashoffset:0}}
        @media (prefers-reduced-motion: reduce){.dm-ring,.dm-tick{animation:none;stroke-dashoffset:0}}
      `}</style>
    </svg>
  );
}
