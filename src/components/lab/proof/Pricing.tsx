"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n";
import DigitRoll from "@/components/chrome/DigitRoll";
import { BookButton } from "@/components/chrome/Icons";
import { euros } from "@/lib/numbers";
import { ADD_ON, BASE_MONTHLY, monthly, setup } from "@/lib/pricing";
import s from "./proof.module.css";

// The picker and its receipt, on the locked homepage formula (lib/pricing.ts):
// 01 + 02 = €650 a month, €1,500 setup. Every automation stays on the receipt;
// switched off, its row dims and its price fades and strikes through while the
// total rolls. Calm solid surfaces, no glass.
export default function Pricing({ t, names, label, bookHref }: { t: Dictionary["pricing"]; names: string[]; label: string; bookHref: string }) {
  const [chosen, setChosen] = useState<number[]>([0, 1]);
  const toggle = (i: number) => setChosen((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i].sort()));
  const none = chosen.length === 0;
  // The automation with the highest add-on carries the €350 base; the others add on.
  const lead = none ? -1 : chosen.reduce((a, b) => (ADD_ON[b] > ADD_ON[a] ? b : a));
  const priceOf = (i: number) => (i === lead ? euros(BASE_MONTHLY, "en") : `+${euros(ADD_ON[i], "en")}`);

  return (
    <section id="pricing" className={s.pricing} aria-labelledby="pricing-title" data-section="pricing">
      <div className={s.pricingHead}>
        <span className="mono-label" data-reveal>{label}</span>
        <h2 id="pricing-title" className={`display ${s.h2}`} data-reveal>{t.choose}</h2>
      </div>
      <div className={s.pricingGrid}>
        <ul className={s.switchList} role="group" aria-label={t.choose}>
          {names.map((name, i) => {
            const on = chosen.includes(i);
            return (
              <li key={name}>
                <button type="button" role="switch" aria-checked={on} onClick={() => toggle(i)} className={s.switchRow} data-on={on}>
                  <span className={s.switchIdx}>0{i + 1}</span>
                  <span className={s.switchName}>{name}</span>
                  <span className={s.switch} aria-hidden="true"><span className={s.knob} /></span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={s.receipt} data-reveal>
          <span className="mono-label">{label} · {t.exVat}</span>
          <ul className={s.receiptRows}>
            {names.map((name, i) => {
              const on = chosen.includes(i);
              return (
                <li key={name} className={s.receiptRow} data-on={on}>
                  <span>0{i + 1} · {name}</span>
                  <span className={s.receiptPrice}>
                    <span className="tnum">{on ? priceOf(i) : `+${euros(ADD_ON[i], "en")}`}</span>
                    <span className={s.strike} aria-hidden="true" />
                  </span>
                </li>
              );
            })}
          </ul>
          <div className={s.total} aria-live="polite">
            {none ? (
              <span className={s.noneText}>{t.none}</span>
            ) : (
              <>
                <span className={s.totalFrom}>{t.from}</span>
                <span className={s.totalNum}><DigitRoll value={euros(monthly(chosen), "en")} /></span>
                <span className={s.totalUnit}>{t.perMonth} · {t.exVat}</span>
              </>
            )}
          </div>
          <div className={s.setupLine} data-none={none}>
            <span>{t.setupLabel}</span>
            <span className={s.setupFig}><DigitRoll value={euros(none ? 0 : setup(chosen), "en")} /></span>
            <span>{t.exVat}</span>
          </div>
          <p className={s.setupNote}>{t.setupNote}</p>
          <BookButton href={bookHref} label={t.cta} className={s.receiptCta} />
          <ul className={s.fine}>
            {t.fine.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
