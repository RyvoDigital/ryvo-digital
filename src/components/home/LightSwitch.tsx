"use client";

import { useEffect } from "react";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";

// The dark → light → dark transition around Websites follows the scroll: each
// section's layer is a gradient whose stops slide with --p (0 → 1). Without JS
// or with reduced motion, --p stays 1: the design's static gradients.
export default function LightSwitch() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    return withMotion(({ gsap }) => {
      const ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-switch]").forEach((section) => {
          const layer = section.querySelector<HTMLElement>("[data-switch-layer]");
          if (!layer) return;
          const toLight = section.dataset.switch === "to-light";
          gsap.fromTo(
            layer,
            { "--p": 0 },
            {
              "--p": 1,
              ease: "none",
              scrollTrigger: toLight
                ? { trigger: section, start: "top 100%", end: "top 45%", scrub: true }
                : { trigger: section, start: "top 100%", end: "top 55%", scrub: true },
            },
          );
        });
      });
      return () => ctx.revert();
    });
  }, []);

  return null;
}
