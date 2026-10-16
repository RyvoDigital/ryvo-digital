"use client";

import { useEffect } from "react";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";

// The dark → light → dark transition around Websites follows the scroll. Each
// section carries a full-bleed layer of the other colour whose opacity is
// scrubbed; without JS (or with reduced motion) the CSS gradients stand in.
export default function LightSwitch() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    return withMotion(({ gsap }) => {
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-switch]").forEach((section) => {
          const layer = section.querySelector<HTMLElement>("[data-switch-layer]");
          if (!layer) return;
          section.dataset.scrub = "true";
          gsap.fromTo(
            layer,
            { opacity: 1 },
            {
              opacity: 0,
              ease: "none",
              scrollTrigger: section.dataset.switch === "to-light"
                ? { trigger: section, start: "top 80%", end: "top 25%", scrub: true }
                : { trigger: section, start: "top 92%", end: "top 40%", scrub: true },
            },
          );
        });
      });
      return () => ctx.revert();
    });
  }, []);

  return null;
}
