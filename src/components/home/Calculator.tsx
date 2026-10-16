"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import DigitRoll from "@/components/chrome/DigitRoll";
import { euros, group, readNumber } from "@/lib/numbers";
import styles from "./Calculator.module.css";

type Key = "enq" | "after" | "unans" | "close" | "comm";

// Example figures from the approved design; the visitor types their own.
const START: Record<Key, number> = { enq: 120, after: 35, unans: 30, close: 2, comm: 12000 };
const LIMIT: Record<Key, number> = { enq: 99999, after: 100, unans: 100, close: 100, comm: 9999999 };
const WIDTH: Record<Key, string> = { enq: "2.3em", after: "1.6em", unans: "1.6em", close: "1.6em", comm: "4.7em" };
const clamp = (n: number, k: Key) => Math.min(Math.max(n, 0), LIMIT[k]);

export default function Calculator({ lang, t }: { lang: Locale; t: Dictionary["calc"] }) {
  const [vals, setVals] = useState(START);
  const [editing, setEditing] = useState<{ key: Key; raw: string } | null>(null);
  const [inView, setInView] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const risk = useMemo(
    () => vals.enq * (vals.after / 100) * (vals.unans / 100) * (vals.close / 100) * vals.comm,
    [vals],
  );

  return (
    <section className={styles.section} aria-labelledby="calc-label" data-calc>
      <div className={styles.card}>
        <span id="calc-label" className="mono-label">
          <span className="hidden md:inline">{t.label}</span>
          <span className="md:hidden">{t.labelShort}</span>
        </span>
        <p className={styles.sentence}>
          {t.sentence.map((tok, i) => {
            // A "%" belongs to the input before it: render the pair as one unbreakable unit.
            const glued = (k: number) => {
              const n = t.sentence[k];
              return n?.t === "text" && /^\u00A0?%$/.test(n.v);
            };
            if (tok.t === "text") {
              if (glued(i) && t.sentence[i - 1]?.t === "input") return null;
              return <span key={i} className={tok.strong ? "text-text" : undefined}>{tok.v}</span>;
            }
            return (
              <span key={i} className="whitespace-nowrap">
                <label htmlFor={`calc-${tok.key}`} className="sr-only">{tok.label}</label>
                <input
                  id={`calc-${tok.key}`}
                  className={styles.input}
                  style={{ width: WIDTH[tok.key], textAlign: tok.key === "enq" || tok.key === "comm" ? "center" : "right" }}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={editing?.key === tok.key ? editing.raw : group(vals[tok.key], lang)}
                  onFocus={() => setEditing({ key: tok.key, raw: String(vals[tok.key]).replace(".", lang === "en" ? "." : ",") })}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.,\s\u00A0]/g, "").slice(0, 10);
                    setEditing({ key: tok.key, raw });
                    setVals((p) => ({ ...p, [tok.key]: clamp(readNumber(raw, lang), tok.key) }));
                  }}
                  onBlur={() => setEditing(null)}
                />
                {glued(i + 1) && <span className="text-text">{(t.sentence[i + 1] as { v: string }).v}</span>}
              </span>
            );
          })}
        </p>
        <div className={styles.result} ref={resultRef}>
          <span className="flex flex-col gap-[10px]">
            <span className="mono-label">{t.resultLabel}</span>
            <span className={styles.figure}>
              <DigitRoll value={euros(inView ? risk : 0, lang)} />
            </span>
          </span>
          <span className={styles.note}>{t.note}</span>
        </div>
      </div>
    </section>
  );
}
