"use client";

import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

// GSAP and ScrollTrigger load on demand, after the first paint, so they never
// sit between the visitor and the hero (they are ~70 KB of script).
export type Motion = { gsap: typeof GSAP; ScrollTrigger: typeof ST };

let loading: Promise<Motion> | null = null;

// Nothing above the fold needs GSAP (the hero intro is CSS), so fetch it only
// after the page has loaded and gone idle — or at the first scroll, if sooner.
function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scroll", go);
      window.removeEventListener("wheel", go);
      window.removeEventListener("touchstart", go);
      resolve();
    };
    const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 300));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    window.addEventListener("scroll", go, { passive: true, once: true });
    window.addEventListener("wheel", go, { passive: true, once: true });
    window.addEventListener("touchstart", go, { passive: true, once: true });
  });
}

export function loadMotion(): Promise<Motion> {
  loading ??= afterFirstPaint().then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")])).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    g.gsap.defaults({ ease: "expo.out", duration: 0.9 });
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return loading;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Run a motion setup once GSAP has loaded; returns a cleanup that also cancels a pending load. */
export function withMotion(setup: (m: Motion) => void | (() => void)) {
  let cleanup: void | (() => void);
  let cancelled = false;
  loadMotion().then((m) => {
    if (!cancelled) cleanup = setup(m);
  });
  return () => {
    cancelled = true;
    cleanup?.();
  };
}
