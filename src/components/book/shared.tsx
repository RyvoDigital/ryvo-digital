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
// starts wherever the gap between two starts is more than 30 minutes.
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

// A time's column in a grid laid out by the clock: one column per quarter
// (:00, :15, :30, :45), so the same minutes line up down the grid. Four columns
// hold one hour a row; eight hold two (the hour's parity, counted from the
// run's first time). In the visitor's zone: every zone's offset is a multiple
// of 15 minutes, so the quarters hold everywhere.
export function quarterCol(iso: string, first: string, tz: string, perRow: 4 | 8) {
  const hm = (x: string) => {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(x));
    const get = (t: string) => Number(p.find((q) => q.type === t)!.value);
    return [get("hour"), get("minute")] as const;
  };
  const [h, m] = hm(iso), [h0] = hm(first);
  return (perRow === 8 ? ((h - h0 + 24) % 2) * 4 : 0) + Math.floor(m / 15) + 1;
}

// The visitor's zone in plain words: Lisbon and Madrid by their local names,
// any other zone by its own city ("America/New_York" → "New York").
export function zoneCity(tz: string, [lisbon, madrid]: readonly [string, string] | string[]) {
  return tz === "Europe/Lisbon" ? lisbon : tz === "Europe/Madrid" ? madrid : (tz.split("/").pop() ?? tz).replace(/_/g, " ");
}
