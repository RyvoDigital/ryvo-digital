"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import DigitRoll from "@/components/chrome/DigitRoll";
import { BookButton } from "@/components/chrome/Icons";
import { euros } from "@/lib/numbers";
import { ADD_ON, BASE_MONTHLY, monthly, setup } from "@/lib/pricing";
import styles from "./Pricing.module.css";

// Tick any automations: the monthly and the one-time setup roll to their new
// values together. Default: 01 + 02 (the approved design's Core).
// addOns (off by default, so the homepage is unchanged): each row also shows
// what it adds. Of the chosen, the one with the highest add-on carries the
// €350 base; every other row shows its +€ add-on.
export default function Pricing({ lang, t, names, bookHref = "#book", addOns = false }: { lang: Locale; t: Dictionary["pricing"]; names: string[]; bookHref?: string; addOns?: boolean }) {
  const [chosen, setChosen] = useState<number[]>([0, 1]);
  const [seen, setSeen] = useState(false);
  const priceRef = useRef<HTMLSpanElement>(null);
  const none = chosen.length === 0;

  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const lead = none ? -1 : chosen.reduce((a, b) => (ADD_ON[b] > ADD_ON[a] ? b : a));
  const toggle = (i: number) => setChosen((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i].sort()));

  return (
    <section id="pricing" className={styles.section} aria-labelledby="pricing-label">
      <div className={styles.card}>
        <div className={styles.left}>
          <span id="pricing-label" className="mono-label">{t.label}</span>
          <div aria-live="polite" className="flex flex-col gap-[18px] lg:gap-[22px]">
            <span className={styles.priceRow}>
              <span className={styles.unit}>{t.from}</span>
              <span ref={priceRef} className={styles.price} data-none={none}>
                {none ? <span className={styles.noneText}>{t.none}</span> : <DigitRoll value={euros(seen ? monthly(chosen) : 0, lang)} />}
              </span>
              {!none && <span className={styles.unit}>{t.perMonth} · {t.exVat}</span>}
            </span>
            {!none && (
              <span className={styles.setup}>
                <span className="text-steel">{t.setupLabel}</span>
                <span className={styles.setupFigure}>
                  <DigitRoll value={euros(seen ? setup(chosen) : 0, lang)} />
                </span>
                <span className="text-steel">{t.exVat}</span>
                <span className="basis-full text-[13px] text-steel">{t.setupNote}</span>
              </span>
            )}
          </div>
          <span className={styles.cta}>
            <BookButton href={bookHref} label={t.cta} />
          </span>
          <ul className={styles.fine}>
            {t.fine.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <div className={styles.right}>
          <span className="mono-label mb-[14px]">{t.choose}</span>
          <div role="group" aria-label={t.choose}><ul className="m-0 list-none p-0">
            {names.map((name, i) => {
              const on = chosen.includes(i);
              return (
                <li key={name}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(i)} className={styles.item} data-on={on}>
                    <span className={styles.tick} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                    </span>
                    <span className="font-mono text-[12px] text-silver">0{i + 1}</span>
                    <span className={styles.itemName}>{name}</span>
                    {addOns && <span className={styles.itemPrice}>{i === lead ? euros(BASE_MONTHLY, lang) : `+${euros(ADD_ON[i], lang)}`}</span>}
                  </button>
                </li>
              );
            })}
          </ul></div>
        </div>
      </div>
    </section>
  );
}
