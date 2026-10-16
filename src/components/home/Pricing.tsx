"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import DigitRoll from "@/components/chrome/DigitRoll";
import { BookButton } from "@/components/chrome/Icons";
import { euros } from "@/lib/numbers";
import styles from "./Pricing.module.css";

export default function Pricing({ lang, t, names }: { lang: Locale; t: Dictionary["pricing"]; names: string[] }) {
  const [tier, setTier] = useState(1); // Core, as in the approved design
  const [seen, setSeen] = useState(false);
  const priceRef = useRef<HTMLSpanElement>(null);
  const current = t.tiers[tier];

  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="pricing" className={styles.section} aria-labelledby="pricing-label">
      <div className={styles.card}>
        <div className={styles.left}>
          <span id="pricing-label" className="mono-label">{t.label}</span>
          <div role="radiogroup" aria-label={t.choose} className={styles.control} style={{ ["--i" as string]: tier }}>
            <span aria-hidden="true" className={styles.thumb} />
            {t.tiers.map((x, i) => (
              <button
                key={x.name}
                type="button"
                role="radio"
                aria-checked={i === tier}
                tabIndex={i === tier ? 0 : -1}
                onClick={() => setTier(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setTier((tier + 1) % 3); (e.currentTarget.parentElement!.children[((tier + 1) % 3) + 1] as HTMLElement).focus(); }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setTier((tier + 2) % 3); (e.currentTarget.parentElement!.children[((tier + 2) % 3) + 1] as HTMLElement).focus(); }
                }}
                className={styles.option}
              >
                {x.name}
              </button>
            ))}
          </div>
          <span className={styles.priceRow}>
            <span className={styles.unit}>{t.from}</span>
            <span ref={priceRef} className={styles.price}>
              <DigitRoll value={euros(seen ? current.price : 0, lang)} />
            </span>
            <span className={styles.unit}>{t.perMonth}</span>
          </span>
          <p className={styles.blurb} aria-live="polite">{current.blurb}</p>
          <span className={styles.cta}>
            <BookButton href="#book" label={t.cta} />
            <span className="max-w-[260px] text-[13px] leading-[1.5] text-steel">{t.note}</span>
          </span>
        </div>
        <div className={styles.right}>
          <span className="mono-label mb-[14px]">{t.included}</span>
          <ul className="m-0 list-none p-0">
            {names.map((name, i) => {
              const on = i < current.count;
              return (
                <li key={name} className={styles.item} data-on={on} style={{ transitionDelay: `${on ? i * 70 : 0}ms` }}>
                  <span className={styles.tick} aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  </span>
                  <span className="font-mono text-[12px] text-silver">0{i + 1}</span>
                  <span className={styles.itemName}>{name}</span>
                  <span className="sr-only">{on ? "✓" : "—"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
