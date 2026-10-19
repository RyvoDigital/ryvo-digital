"use client";

import type { ReactNode, TransitionEvent } from "react";
import s from "./Expander.module.css";

// The site's one expand/collapse: FAQ answers, the "+" texts on /automations,
// the bios on /about. The height opens on a 0fr → 1fr grid row (no measuring),
// the content fades and rises a little, about 400 ms on the calm ease, the
// same both ways; with reduced motion it simply switches. Closed, the content
// is inert and hidden from assistive tech; the trigger carries aria-expanded
// and aria-controls={id}. Once it settles, ScrollTrigger re-measures, so
// everything below that is tied to the scroll stays true.
export default function Expander({ open, id, labelledBy, className = "", children }: {
  open: boolean; id: string; labelledBy?: string; className?: string; children: ReactNode;
}) {
  const settled = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "grid-template-rows") return;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  };
  return (
    <div
      id={id}
      role={labelledBy ? "region" : undefined}
      aria-labelledby={labelledBy}
      className={`${s.root} ${className}`}
      data-open={open}
      inert={!open}
      onTransitionEnd={settled}
    >
      <div className={s.clip}>
        <div className={s.content}>{children}</div>
      </div>
    </div>
  );
}

// The "+" that turns into "×" as its expander opens (the same 400 ms).
export function PlusMark({ open, className = "" }: { open: boolean; className?: string }) {
  return <span aria-hidden="true" className={`${s.plus} ${className}`} data-open={open} />;
}
