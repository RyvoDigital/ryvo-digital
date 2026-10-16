"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

// The thread: one silver hairline that draws itself as you scroll. It starts at
// the 23:47 marker, runs down the right gutter, crosses to the left gutter in the
// gap before Automations, becomes the loop (one lap of the orbit), then the demo
// timeline, and ends where the How-we-work rail takes over. Desktop only; it
// always travels through gutters and gaps, never across text.

type Pt = { x: number; y: number; v: number };

const rectOf = (sel: string) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY, width: r.width, height: r.height };
};

function build(): Pt[] | null {
  const start = rectOf("[data-thread-start]");
  const card = rectOf("[data-hero] section");
  const calc = rectOf("[data-calc]");
  const orbit = rectOf("[data-thread-orbit]");
  const timeline = rectOf("[data-thread-timeline]");
  const rail = rectOf("[data-thread-rail]");
  if (!start || !card || !calc || !orbit || !timeline || !rail) return null;

  const width = document.documentElement.clientWidth;
  const contentLeft = timeline.left;
  const gR = Math.min(card.right + 12, width - 8);
  const gL = Math.max(10, contentLeft - 30);
  const pts: Pt[] = [];
  let v = 0;
  const push = (x: number, y: number, vy = y) => { v = Math.max(v, vy); pts.push({ x, y, v }); };

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8));
    for (let i = 1; i <= n; i++) push(x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n);
  };
  // Cubic with vertical tangents at both ends: a calm S between two verticals.
  const bend = (x1: number, y1: number, x2: number, y2: number) => {
    const dy = y2 - y1;
    const c1 = { x: x1, y: y1 + dy * 0.55 };
    const c2 = { x: x2, y: y2 - dy * 0.55 };
    const n = 48;
    for (let i = 1; i <= n; i++) {
      const t = i / n, m = 1 - t;
      push(
        m * m * m * x1 + 3 * m * m * t * c1.x + 3 * m * t * t * c2.x + t * t * t * x2,
        m * m * m * y1 + 3 * m * m * t * c1.y + 3 * m * t * t * c2.y + t * t * t * y2,
      );
    }
  };

  const sx = start.left + start.width / 2;
  push(sx, start.bottom);
  bend(sx, start.bottom, gR, start.bottom + 90);
  line(gR, start.bottom + 90, gR, calc.bottom + 16);
  bend(gR, calc.bottom + 16, gL, calc.bottom + 96);

  // Into the orbit and one full lap, drawn over the lower half of the loop.
  const ox = orbit.left + orbit.width / 2, oy = orbit.top + orbit.height / 2;
  const rx = orbit.width / 2, ry = orbit.height / 2;
  line(gL, calc.bottom + 96, gL, oy - 60);
  bend(gL, oy - 60, ox - rx, oy);
  const laps = 120;
  for (let i = 1; i <= laps; i++) {
    const a = Math.PI + (i / laps) * Math.PI * 2; // from the left point, over the top, round again
    push(ox + rx * Math.cos(a), oy - ry * Math.sin(a), oy + (i / laps) * ry);
  }

  // Back out to the gutter, down into the demo timeline, then to the rail.
  const tlX = timeline.left + 4.5, tlTop = timeline.top + 10, tlBottom = timeline.bottom - 10;
  bend(ox - rx, oy, gL, oy + ry + 80);
  line(gL, oy + ry + 80, gL, tlTop - 70);
  bend(gL, tlTop - 70, tlX, tlTop);
  line(tlX, tlTop, tlX, tlBottom);
  const rX = rail.left + 0.5;
  bend(tlX, tlBottom, gL, tlBottom + 90);
  line(gL, tlBottom + 90, gL, rail.top - 70);
  bend(gL, rail.top - 70, rX, rail.top);
  return pts;
}

export default function Thread() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    let pts: Pt[] = [];
    let lens: number[] = [];
    let total = 0;
    let raf = 0;
    const reduced = prefersReducedMotion();

    const layout = () => {
      if (!mq.matches || !svg.current || !path.current) return;
      const built = build();
      if (!built) return;
      pts = built;
      lens = [0];
      for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      total = lens[lens.length - 1];
      const doc = document.documentElement;
      svg.current.setAttribute("width", String(doc.clientWidth));
      svg.current.setAttribute("height", String(doc.scrollHeight));
      path.current.setAttribute("d", "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L"));
      path.current.style.strokeDasharray = `${total}`;
      draw();
    };

    const draw = () => {
      raf = 0;
      if (!pts.length || !path.current || !head.current) return;
      let i = pts.length - 1;
      if (!reduced) {
        const target = scrollY + innerHeight * 0.62;
        let lo = 0, hi = pts.length - 1;
        while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (pts[mid].v <= target) lo = mid; else hi = mid - 1; }
        i = lo;
      }
      path.current.style.strokeDashoffset = `${total - lens[i]}`;
      head.current.setAttribute("cx", String(pts[i].x));
      head.current.setAttribute("cy", String(pts[i].y));
      head.current.style.opacity = i > 0 && i < pts.length - 1 ? "1" : "0";
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const ro = new ResizeObserver(() => requestAnimationFrame(layout));
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", layout);
    document.fonts?.ready.then(layout);
    layout();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", layout);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[3] hidden overflow-visible lg:block" width="0" height="0">
      <defs>
        <linearGradient id="thread-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1F2F4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#A9AEB6" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="thread-head">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.4" stopColor="#F1F2F4" stopOpacity="0.8" />
          <stop offset="1" stopColor="#F1F2F4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path ref={path} fill="none" stroke="url(#thread-fade)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <circle ref={head} r="5" fill="url(#thread-head)" style={{ opacity: 0, transition: "opacity .4s" }} />
    </svg>
  );
}
