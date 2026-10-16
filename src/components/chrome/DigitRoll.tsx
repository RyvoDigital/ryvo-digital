"use client";

import { useEffect, useState } from "react";

// Rolling digits with tabular figures: each digit is a 0–9 strip that slides to
// its value, so a number changes without ever jumping width. New digits roll up
// from 0. Screen readers get the plain value.
function Column({ digit }: { digit: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(digit));
    return () => cancelAnimationFrame(id);
  }, [digit]);
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top">
      <span
        className="flex flex-col transition-transform duration-[900ms] ease-[var(--ease-out-expo)] motion-reduce:transition-none"
        style={{ transform: `translateY(${-shown}em)` }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="block h-[1em] leading-[1em]">{d}</span>
        ))}
      </span>
    </span>
  );
}

export default function DigitRoll({ value, className = "" }: { value: string; className?: string }) {
  const chars = value.split("");
  return (
    <span className={`relative inline-flex tnum leading-[1em] ${className}`}>
      <span className="sr-only" aria-live="polite">{value}</span>
      <span aria-hidden="true" className="inline-flex whitespace-pre">
        {chars.map((c, i) => {
          const key = chars.length - i; // keyed from the right so units stay put
          return /\d/.test(c) ? <Column key={key} digit={Number(c)} /> : <span key={`s${key}${c}`} className="inline-block h-[1em] leading-[1em]">{c}</span>;
        })}
      </span>
    </span>
  );
}
