"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { startMotion } from "@/components/automations/motion";
import { CITIES } from "./globe-shared";
import type { Framing, RouteGlobe as Scene } from "./route-scene";
import s from "./RouteGlobe.module.css";

// The Lisbon–Madrid globe as a scroll piece. Nothing loads until the stage is
// near (three.js and the dot set are one dynamic import). Once it is seen, the
// globe turns in on its own and settles on Iberia; from then on the scroll
// draws the route: `range` is the stretch of page, on `track`, over which the
// arc draws from Lisbon to Madrid. It renders on the site's GSAP ticker (the
// same tick as Lenis and ScrollTrigger), only while on screen. Reduced motion:
// one still frame, route drawn. No WebGL: the stage keeps its CSS halo and
// the city names, so nothing is missing from the page.

// Large and low under the headline, the limb across the bottom of the screen;
// as the route draws it rises and the camera closes on Iberia.
const FRAMES: Record<"hero", Framing> = {
  hero: (a) => a >= 1.1
    ? { far: { dist: 3.3, ox: -0.25, oy: 0.78 }, near: { dist: 2.1, ox: -0.3, oy: 0.06 } }
    : { far: { dist: 3.5, ox: 0, oy: 0.62 }, near: { dist: 2.2, ox: 0, oy: 0.02 } },
};

export default function RouteGlobe({
  track, range = ["top 70%", "bottom 80%"], framing = "hero", names, km, label, className = "", eager = false, tags: showTags = true, onArc,
}: {
  /** Show the city names and the distance on the globe itself. */
  tags?: boolean;
  /** Each frame, how far the arc has drawn (0–1), for the page's own echo of it. */
  onArc?: (arc: number) => void;
  track: RefObject<HTMLElement | null>;
  range?: [string, string];
  framing?: keyof typeof FRAMES;
  /** The two city names as the page writes them (Lisbon, Madrid; Lisboa, Madrid). */
  names: [string, string];
  km: string;
  label: string;
  className?: string;
  /** Load as soon as the page is idle (the globe is above the fold), not when near. */
  eager?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const kmTag = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    let globe: Scene | null = null;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const place = (labels: { x: number; y: number; on: boolean }[], arc: number) => {
      labels.forEach((l, i) => {
        const t = tags.current[i];
        if (!t) return;
        t.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
        t.dataset.on = String(l.on);
      });
      if (kmTag.current) {
        kmTag.current.style.transform = `translate3d(${((labels[0].x + labels[1].x) / 2).toFixed(1)}px, ${(Math.max(labels[0].y, labels[1].y) + 22).toFixed(1)}px, 0)`;
        kmTag.current.dataset.on = String(arc >= 1 && labels[1].on);
      }
      const state = arc >= 1 ? "drawn" : arc > 0 ? "drawing" : "none";
      if (el.dataset.arc !== state) el.dataset.arc = state;
      onArc?.(arc);
    };

    const load = async () => {
      try {
        const [{ createRouteGlobe, TURN }, m] = await Promise.all([import("./route-scene"), startMotion()]);
        if (disposed) return;
        const { gsap, ScrollTrigger, reduced } = m;
        globe = createRouteGlobe(canvas, FRAMES[framing], place);
        setReady(true);
        if (reduced) { globe.set(1); return; }
        globe.set(0);

        // The turn plays once, on its own; the scroll owns the arc.
        const state = { intro: 0, scroll: 0 };
        const aim = () => globe?.target(Math.max(state.intro, state.scroll));
        let turned = false;
        const turn = () => { if (turned) return; turned = true; gsap.to(state, { intro: TURN, duration: 3.6, ease: "power2.inOut", onUpdate: aim }); };

        const tick = (_t: number, dtMs: number) => globe?.render(dtMs / 1000);
        let on = false;
        const run = (v: boolean) => {
          if (v === on) return;
          on = v;
          if (v) { gsap.ticker.add(tick); turn(); } else gsap.ticker.remove(tick);
        };
        const seen = new IntersectionObserver(([e]) => run(e.isIntersecting && document.visibilityState === "visible"));
        seen.observe(el);
        const vis = () => run(document.visibilityState === "visible" && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < innerHeight);
        document.addEventListener("visibilitychange", vis);

        const st = track.current ? ScrollTrigger.create({
          trigger: track.current, start: range[0], end: range[1],
          onUpdate: (self) => { state.scroll = self.progress > 0 ? TURN + self.progress * (1 - TURN) : 0; aim(); },
        }) : null;

        cleanup = () => { seen.disconnect(); document.removeEventListener("visibilitychange", vis); gsap.ticker.remove(tick); st?.kill(); gsap.killTweensOf(state); };
      } catch {
        // No WebGL: the halo and the names stay; the stage reads as a still.
        if (!disposed) { el.dataset.fallback = "true"; onArc?.(1); }
      }
    };

    let near: IntersectionObserver | undefined;
    let idle: number | undefined;
    if (eager) {
      const go = () => load();
      if (document.readyState === "complete") idle = window.setTimeout(go, 200);
      else window.addEventListener("load", go, { once: true });
    } else {
      near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near?.disconnect(); load(); } }, { rootMargin: "800px 0px" });
      near.observe(el);
    }
    const ro = new ResizeObserver(() => globe?.resize());
    ro.observe(el);

    return () => {
      disposed = true;
      near?.disconnect(); ro.disconnect(); clearTimeout(idle);
      cleanup?.();
      globe?.dispose();
    };
    // Set up once: the props are fixed for the page's life, and a re-run would
    // rebuild the scene (setReady re-renders, and `range` is a fresh array).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={box} className={`${s.stage} ${className}`} data-ready={ready} data-arc="none">
      <div className={s.halo} aria-hidden="true" />
      <canvas ref={cv} className={s.canvas} role="img" aria-label={label} />
      {showTags && CITIES.map((c, i) => (
        <div key={c.key} ref={(n) => { tags.current[i] = n; }} className={s.tag} data-side={i === 0 ? "left" : "right"} data-on="false" aria-hidden="true">
          <span className={s.name}>{names[i]}</span>
          <span className="mono-label">{c.coords}</span>
        </div>
      ))}
      {showTags && <div ref={kmTag} className={s.km} data-on="false" aria-hidden="true"><span className="mono-label">{km}</span></div>}
    </div>
  );
}
