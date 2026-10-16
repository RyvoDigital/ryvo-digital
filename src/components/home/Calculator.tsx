"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import DigitRoll from "@/components/chrome/DigitRoll";
import styles from "./Calculator.module.css";

type Key = "enq" | "after" | "unans" | "close" | "comm";

// Example figures from the approved design; the visitor types their own.
const START: Record<Key, string> = { enq: "120", after: "35", unans: "30", close: "2", comm: "12000" };
const LIMIT: Record<Key, number> = { enq: 99999, after: 100, unans: 100, close: 100, comm: 9999999 };
const WIDTH: Record<Key, string> = { enq: "2.3em", after: "1.6em", unans: "1.6em", close: "1.6em", comm: "4.4em" };

function parse(v: string, key: Key) {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), LIMIT[key]) : 0;
}

export default function Calculator({ lang, t }: { lang: Locale; t: Dictionary["calc"] }) {
  const [vals, setVals] = useState(START);
  const [inView, setInView] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const risk = useMemo(() => {
    const n = (k: Key) => parse(vals[k], k);
    return n("enq") * (n("after") / 100) * (n("unans") / 100) * (n("close") / 100) * n("comm");
  }, [vals]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(INTL_LOCALE[lang], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
    [lang],
  );

  return (
    <section className={styles.section} aria-labelledby="calc-label">
      <div className={styles.card}>
        <span id="calc-label" className="mono-label">
          <span className="hidden md:inline">{t.label}</span>
          <span className="md:hidden">{t.labelShort}</span>
        </span>
        <p className={styles.sentence}>
          {t.sentence.map((tok, i) =>
            tok.t === "text" ? (
              <span key={i} className={tok.strong ? "text-text" : undefined}>{tok.v}</span>
            ) : (
              <span key={i} className="whitespace-nowrap">
                <label htmlFor={`calc-${tok.key}`} className="sr-only">{tok.label}</label>
                <input
                  id={`calc-${tok.key}`}
                  className={styles.input}
                  style={{ width: WIDTH[tok.key], textAlign: tok.key === "enq" || tok.key === "comm" ? "center" : "right" }}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={vals[tok.key]}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d.,]/g, "").slice(0, 8);
                    setVals((p) => ({ ...p, [tok.key]: v }));
                  }}
                  onBlur={(e) => setVals((p) => ({ ...p, [tok.key]: String(parse(e.target.value, tok.key)) }))}
                />
              </span>
            ),
          )}
        </p>
        <div className={styles.result} ref={resultRef}>
          <span className="flex flex-col gap-[10px]">
            <span className="mono-label">{t.resultLabel}</span>
            <span className={styles.figure}>
              <DigitRoll value={fmt.format(inView ? Math.round(risk) : 0)} />
            </span>
          </span>
          <span className={styles.note}>{t.note}</span>
        </div>
      </div>
    </section>
  );
}
