"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

// Words go from grey to their final colour one by one as the block scrolls
// through the viewport (scrubbed). Each word is a [data-word] span; it gets
// data-lit once lit. With reduced motion every word is lit.
export function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) ? part : <span key={i} data-word className={className}>{part}</span>,
      )}
    </>
  );
}

export default function WordReveal({ as: Tag = "div", className = "", children, start = 0.88, end = 0.42, ...rest }: {
  as?: "div" | "p" | "h2"; className?: string; children: ReactNode; start?: number; end?: number; [k: string]: unknown;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    if (prefersReducedMotion()) { words.forEach((w) => w.setAttribute("data-lit", "")); return; }
    el.setAttribute("data-reveal-words", "");
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      // 0 when the block's top is at `start` of the viewport, 1 when it reaches `end`.
      const p = Math.min(1, Math.max(0, (vh * start - r.top) / (vh * (start - end))));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => (i < lit ? w.setAttribute("data-lit", "") : w.removeAttribute("data-lit")));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [start, end]);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  );
}
