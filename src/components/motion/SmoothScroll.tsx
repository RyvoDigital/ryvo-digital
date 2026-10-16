"use client";

import { useEffect } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/gsap";

// Lenis on fine pointers only: on touch, native scrolling is already smooth and
// Lenis fights it. With reduced motion there is no smoothing at all. Both Lenis
// and GSAP load after the first paint.
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadMotion().then((m) => Promise.all([import("lenis"), m])).then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(2, -10 * t) });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // In-page anchors glide instead of jumping.
      const onClick = (event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!link) return;
        const target = document.querySelector(link.getAttribute("href")!);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -12 });
        history.replaceState(null, "", link.getAttribute("href"));
      };
      document.addEventListener("click", onClick);

      cleanup = () => {
        document.removeEventListener("click", onClick);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
