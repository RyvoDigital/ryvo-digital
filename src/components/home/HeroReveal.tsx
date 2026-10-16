"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Hero entrance: the wordmark rises from a soft blur, the phone eases up out of
// the glow, the headline arrives line by line. The phone (the LCP element) only
// moves, it never fades, so the largest paint is not delayed.
export default function HeroReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-hero]");
    if (!root) return;
    if (prefersReducedMotion()) {
      root.classList.add("is-in");
      return;
    }
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onStart: () => root.classList.add("is-in") });
    tl.fromTo(q("[data-wordmark]"), { y: 70, opacity: 0, filter: "blur(18px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.6 }, 0)
      .fromTo(q("[data-hero-visual]"), { y: 90 }, { y: 0, duration: 1.5 }, 0.05)
      .fromTo(q("[data-reveal-line]"), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.09 }, 0.15)
      .fromTo(q("[data-reveal]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.06 }, 0.35);
    return () => { tl.kill(); };
  }, []);

  return null;
}
