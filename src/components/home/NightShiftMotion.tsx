"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// The headline arrives line by line; on desktop the arrow travels along the pill
// row, revealing Answer and Qualify as it passes, and Book appears as it lands.
export default function NightShiftMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-night]");
    if (!root || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    const ctx = gsap.context(() => {
      gsap.from(q("[data-line]"), {
        yPercent: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        scrollTrigger: { trigger: q("h2")[0], start: "top 80%" },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const row = q("[data-pills]")[0] as HTMLElement;
        const arrow = q("[data-pill-arrow]")[0] as HTMLElement;
        const travel = arrow.offsetLeft;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: row, start: "top 92%", end: "top 64%", scrub: 0.8 },
        });
        tl.fromTo(arrow, { x: -travel }, { x: 0, duration: 1 }, 0)
          .from(q('[data-pill="0"]'), { opacity: 0, x: -24, duration: 0.25 }, 0.05)
          .from(q('[data-pill="1"]'), { opacity: 0, x: -24, duration: 0.3 }, 0.4)
          .from(q('[data-pill="3"]'), { opacity: 0, x: -24, duration: 0.25 }, 0.85);
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.from(q("[data-pills] > *"), {
          opacity: 0,
          y: 16,
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: { trigger: q("[data-pills]")[0], start: "top 90%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return null;
}
