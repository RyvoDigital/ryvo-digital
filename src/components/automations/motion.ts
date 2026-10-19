"use client";

// The page's motion: GSAP, ScrollTrigger and SplitText, loaded at once. The
// smooth scroll is the site's own (SmoothScroll, in the [lang] layout: Lenis on
// gsap.ticker, ScrollTrigger updated on every Lenis scroll), so everything that
// moves here (the WebGL stages, quickTo tweens, scrubs) rides that same tick.
// No second requestAnimationFrame loop and no second Lenis exist on the page.
import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import type { SplitText as SPLIT } from "gsap/SplitText";

export type PageMotion = {
  gsap: typeof GSAP;
  ScrollTrigger: typeof ST;
  SplitText: typeof SPLIT;
  reduced: boolean;
};

let started: Promise<PageMotion> | null = null;

export const isReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The page's one easing family: a soft expo-out. Nothing bounces.
export const EASE = "expo.out";

export function startMotion(): Promise<PageMotion> {
  started ??= (async () => {
    const reduced = isReduced();
    const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
      import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText"),
    ]);
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: EASE, duration: 0.9 });
    gsap.ticker.lagSmoothing(0);
    // The phone's address bar resizing must not re-measure the page mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });
    return { gsap, ScrollTrigger, SplitText, reduced };
  })();
  return started;
}

// Re-measure once fonts and images have settled, never during a scroll.
export function refreshWhenSettled(m: PageMotion) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const go = () => { clearTimeout(t); t = setTimeout(() => m.ScrollTrigger.refresh(), 120); };
  document.fonts?.ready.then(go);
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}
