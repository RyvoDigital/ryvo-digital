"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { withMotion } from "@/lib/gsap";

// Words light from very dark to their final colour one by one, scrubbed to the
// scroll position (GSAP ScrollTrigger) over a long distance, so the progress is
// plain to see. Each word is a [data-word] span whose --lit goes 0 → 1; the
// colour blend lives in globals.css. Words stay in their final colour until the
// block is just below the screen, and only then go dark, so nobody sees a jump
// and the page passes contrast checks as loaded. It is a colour change, not
// movement, so it also runs with reduced motion on.
export function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) ? part : <span key={i} data-word className={className}>{part}</span>,
      )}
    </>
  );
}

export default function WordReveal({ as: Tag = "div", className = "", children, start = "top 92%", end = "bottom 25%", ...rest }: {
  as?: "div" | "p" | "h2"; className?: string; children: ReactNode; start?: string; end?: string; [k: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-reveal-words", "");
    return withMotion(({ gsap, ScrollTrigger }) => {
      // Only the words shown at this width (a heading may carry a short variant).
      const words = [...el.querySelectorAll<HTMLElement>("[data-word]")].filter((w) => w.getClientRects().length > 0);
      const ctx = gsap.context(() => {
        const tween = gsap.fromTo(words, { "--lit": 0 }, { "--lit": 1, ease: "none", duration: 0.6, stagger: 0.15, immediateRender: false });
        // Go dark while still just below the screen.
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom+=10%",
          onEnter: () => { if (tween.progress() === 0) gsap.set(words, { "--lit": 0 }); },
        });
        ScrollTrigger.create({ trigger: el, start, end, scrub: 0.6, animation: tween });
      }, el);
      return () => ctx.revert();
    });
  }, [start, end]);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  );
}
