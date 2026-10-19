"use client";

import { useEffect, useRef, useState } from "react";

// Small pieces both directions use, styled by the caller.

// The email as a quiet alternative: the address, and a one-tap copy.
export function WriteLine({ lead, copy, copied, className = "", btnClassName = "" }: { lead: string; copy: string; copied: string; className?: string; btnClassName?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText("hello@ryvodigital.com");
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1800);
    } catch { /* the link still works */ }
  };
  return (
    <p className={className}>
      <span>{lead}</span>{" "}
      <a href="mailto:hello@ryvodigital.com">hello@ryvodigital.com</a>
      <button type="button" className={btnClassName} onClick={onCopy} aria-live="polite">{done ? copied : copy}</button>
    </p>
  );
}

// The panel follows its content's height smoothly, so it never holds empty space.
export function AutoHeight({ children, className }: { children: React.ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={className} style={{ height: h }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

export function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

// Times in two runs (the morning hours and the evening hours): a new run
// starts wherever the gap between two starts is more than one step.
export function runs<T extends { iso: string }>(list: T[]) {
  const out: T[][] = [];
  let prev = 0;
  for (const s of list) {
    const t = new Date(s.iso).getTime();
    if (!out.length || t - prev > 30 * 60_000) out.push([]);
    out[out.length - 1].push(s);
    prev = t;
  }
  return out;
}
