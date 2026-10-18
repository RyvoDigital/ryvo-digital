"use client";

// The page's one animation loop. Lenis is driven from gsap.ticker (autoRaf off):
// each tick runs lenis.raf(time) and then ScrollTrigger.update(), in that order,
// and everything else that moves (the WebGL stages, quickTo tweens, scrubs)
// rides the same tick. No second requestAnimationFrame loop exists on the page.
import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";
import type { SplitText as SPLIT } from "gsap/SplitText";
import type Lenis from "lenis";

export type ProofMotion = {
  gsap: typeof GSAP;
  ScrollTrigger: typeof ST;
  SplitText: typeof SPLIT;
  lenis: Lenis | null;
  reduced: boolean;
};

let started: Promise<ProofMotion> | null = null;

export const isReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The page's one easing family: a soft expo-out. Nothing bounces.
export const EASE = "expo.out";

export function startMotion(): Promise<ProofMotion> {
  started ??= (async () => {
    const reduced = isReduced();
    const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: LenisCtor }] = await Promise.all([
      import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText"), import("lenis"),
    ]);
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.defaults({ ease: EASE, duration: 0.9 });
    gsap.ticker.lagSmoothing(0);
    // The phone's address bar resizing must not re-measure the page mid-scroll.
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis: Lenis | null = null;
    if (!reduced) {
      // Wheel and trackpad are smoothed; touch keeps the phone's own native
      // scroll (syncTouch off), which is already smooth and never fights a finger.
      lenis = new LenisCtor({ autoRaf: false, lerp: 0.11, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
      gsap.ticker.add((time) => {
        lenis!.raf(time * 1000);
        ScrollTrigger.update();
      });
      // In-page links glide.
      document.addEventListener("click", (e) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!a) return;
        const target = document.querySelector(a.getAttribute("href")!);
        if (!target) return;
        e.preventDefault();
        lenis!.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4, easing: (k) => 1 - Math.pow(2, -10 * k) });
      });
    }
    return { gsap, ScrollTrigger, SplitText, lenis, reduced };
  })();
  return started;
}

// Re-measure once fonts and images have settled, never during a scroll.
export function refreshWhenSettled(m: ProofMotion) {
  let t: ReturnType<typeof setTimeout> | undefined;
  const go = () => { clearTimeout(t); t = setTimeout(() => m.ScrollTrigger.refresh(), 120); };
  document.fonts?.ready.then(go);
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}
