"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { loadMotion, prefersReducedMotion } from "@/lib/gsap";

// Lenis on fine pointers only: on touch, native scrolling is already smooth and
// Lenis fights it. With reduced motion there is no smoothing at all. Both Lenis
// and GSAP load after the first paint. Lenis rides gsap.ticker, the site's one
// ticker. On every page change (links, back and forward, the language switch)
// the new page starts at its top, or at its #section, and ScrollTrigger
// measures the new page once it is in.
export default function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadMotion().then((m) => Promise.all([import("lenis"), m])).then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
      if (cancelled) return;
      const l = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(2, -10 * t) });
      lenis.current = l;
      l.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // In-page anchors glide instead of jumping.
      const onClick = (event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        if (!link) return;
        const target = document.querySelector(link.getAttribute("href")!);
        if (!target) return;
        event.preventDefault();
        l.scrollTo(target as HTMLElement, { offset: -12 });
        history.replaceState(history.state, "", link.getAttribute("href"));
      };
      document.addEventListener("click", onClick);

      cleanup = () => {
        document.removeEventListener("click", onClick);
        gsap.ticker.remove(tick);
        l.destroy();
        lenis.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // A new page: to its top (or its #section) at once, then re-measure.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const l = lenis.current;
    if (l) {
      l.resize();
      l.scrollTo(target ?? 0, { immediate: true, force: true, offset: target ? -12 : 0 });
    } else if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
