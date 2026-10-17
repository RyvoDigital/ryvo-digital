"use client";

import { useEffect, useRef } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import s from "./palette.module.css";

// The five automation icons, 24-unit line drawings at the nav icons' weight.
// The approach (RESEARCH.md §4): inline SVG, each stroke drawn in with GSAP
// (stroke-dashoffset, like DrawSVG) once on scroll-in, and one small gesture per
// icon on hover or focus. Paths tagged data-a are the accent the gesture replays.
// No Lottie, no icon library at runtime. Reduced motion: drawn, still.
const ICONS: { name: string; turn?: boolean; paths: React.ReactNode }[] = [
  {
    name: "Inbound concierge",
    paths: (
      <>
        <path d="M5.5 4h13A2.5 2.5 0 0 1 21 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5V16h-.5A2.5 2.5 0 0 1 3 13.5v-7A2.5 2.5 0 0 1 5.5 4Z" />
        <path data-a data-dot d="M8.5 10h.01" />
        <path data-a data-dot d="M12 10h.01" />
        <path data-a data-dot d="M15.5 10h.01" />
      </>
    ),
  },
  {
    name: "Contact reactivation",
    turn: true,
    paths: (
      <g data-turn>
        <path d="M20 11a8 8 0 0 0-14.3-4.7" />
        <path data-a d="M5 3v3.8h3.8" />
        <path d="M4 13a8 8 0 0 0 14.3 4.7" />
        <path data-a d="M19 21v-3.8h-3.8" />
      </g>
    ),
  },
  {
    name: "Buyer follow-up",
    paths: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle data-a data-pulse cx="12" cy="12" r="4.6" />
        <path d="M12 12h.01" />
        <path d="M18 6l-3.6 3.6" />
      </>
    ),
  },
  {
    name: "Listing launch",
    paths: (
      <>
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M5.8 9.4V20h12.4V9.4" />
        <path data-a d="M9.4 13.2h5.2" />
        <path data-a d="M9.4 16.4h3.4" />
      </>
    ),
  },
  {
    name: "After the deed",
    paths: (
      <>
        <circle cx="8" cy="16" r="3.6" />
        <path d="M10.6 13.4 19.5 4.5" />
        <path d="m16.4 7.6 2.2 2.2M14.2 9.8l1.5 1.5" />
        <path data-a d="m6.2 2.8.75 1.6 1.75.22-1.3 1.2.34 1.74L6.2 6.7l-1.54.86.34-1.74-1.3-1.2 1.75-.22Z" />
      </>
    ),
  },
];

type Geo = SVGGeometryElement;

export function AutomationIcons() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;
    return withMotion(({ gsap, ScrollTrigger }) => {
      const strokes = Array.from(node.querySelectorAll<Geo>("path, circle"));
      const len = (el: Geo) => Math.max(1, el.getTotalLength?.() ?? 40);
      strokes.forEach((el) => { const l = len(el); gsap.set(el, { strokeDasharray: l, strokeDashoffset: l }); });
      const tiles = Array.from(node.querySelectorAll<HTMLElement>("[data-tile]"));
      const draw = ScrollTrigger.create({
        trigger: node,
        start: "top 80%",
        once: true,
        onEnter: () => tiles.forEach((tile, i) => {
          gsap.to(tile.querySelectorAll("path, circle"), { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", stagger: 0.12, delay: i * 0.12 });
        }),
      });
      const offs = tiles.map((tile) => {
        const accent = Array.from(tile.querySelectorAll<Geo>("[data-a]"));
        const turn = tile.querySelector("[data-turn]");
        const pulse = tile.querySelector("[data-pulse]");
        const play = () => {
          gsap.killTweensOf(accent);
          if (tile.querySelector("[data-dot]")) {
            // Typing: the three dots dim and return, one after another.
            gsap.fromTo(accent, { opacity: 0.15 }, { opacity: 1, duration: 0.5, stagger: { each: 0.16, repeat: 1, yoyo: true }, ease: "sine.inOut", overwrite: true });
            return;
          }
          if (turn) gsap.fromTo(turn, { rotation: 0 }, { rotation: 180, svgOrigin: "12 12", duration: 1, ease: "expo.out" });
          if (pulse) gsap.fromTo(pulse, { scale: 0.6, opacity: 0.2, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.9, ease: "expo.out" });
          accent.forEach((el) => { const l = len(el); gsap.fromTo(el, { strokeDashoffset: l }, { strokeDashoffset: 0, duration: 0.8, ease: "expo.out" }); });
        };
        tile.addEventListener("pointerenter", play);
        tile.addEventListener("focusin", play);
        return () => { tile.removeEventListener("pointerenter", play); tile.removeEventListener("focusin", play); };
      });
      return () => { draw.kill(); offs.forEach((o) => o()); };
    });
  }, []);
  return (
    <div ref={root} className={s.icons}>
      {ICONS.map((ic, i) => (
        <a key={ic.name} href="#icons" data-tile className={s.iconTile}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ic.paths}
          </svg>
          <span className="mono-label">0{i + 1}</span>
          <span className={s.iconName}>{ic.name}</span>
        </a>
      ))}
    </div>
  );
}
