"use client";

import type { Dictionary } from "@/i18n";
import type { Pages } from "@/i18n/pages";
import r from "./report.module.css";

// "Also included": the weekly report, as a landscape card on desks (a column
// on phones). Silver, plus one accent used only here: Champagne (#D9C7A6), for
// the key figures, the language bars and the dividers between the parts. Its
// motion (figures counting up, bars growing, dividers drawing) lives in
// ProofPage's single ScrollTrigger setup. The figures are the homepage's own
// example, labelled "Illustrative figures, not a real agency"; no weekday.
type Rep = Dictionary["how"]["report"];

export default function Report({ p, rep }: { p: Pages["automations"]; rep: Rep }) {
  const sections = rep.sections as unknown as [string, [string, string][]][];
  const langs = rep.languages as unknown as [string, number][];
  return (
    <section className={r.section} aria-labelledby="report-title" data-section="report" data-report>
      <div className={r.text}>
        <span className="mono-label" data-reveal>{p.report.label}</span>
        <h2 id="report-title" className={`display ${r.h2}`} data-reveal>{p.report.title[0]} <span className={r.dim}>{p.report.title[1]}</span></h2>
        <p className={r.lead} data-reveal>{p.report.body}</p>
      </div>

      <article className={r.card} aria-label={rep.title} data-report-card>
        <header className={r.head}>
          <span className={r.tag}>{rep.tag}</span>
          <h3 className={r.title}>{rep.title}</h3>
        </header>

        <div className={r.grid}>
          <div className={r.part}>
            {rep.top.map(([v, k]) => {
              const m = v.match(/^(\d+)(.*)$/);
              return (
                <div key={k} className={r.stat}>
                  <span className={r.big}>
                    <span data-count={m ? m[1] : undefined}>{m ? m[1] : v}</span>{m ? m[2] : ""}
                  </span>
                  <span className={r.small}>{k}</span>
                </div>
              );
            })}
          </div>

          <span className={r.rule} data-draw aria-hidden="true" />

          <div className={r.part}>
            <span className={r.partTitle}>{rep.languagesLabel}</span>
            <ul className={r.bars}>
              {langs.map(([l, pct]) => (
                <li key={l} className={r.barRow}>
                  <span className={r.barLang}>{l}</span>
                  <span className={r.barTrack}><span className={r.barFill} data-bar style={{ width: `${pct}%` }} /></span>
                  <span className={r.barPct}><span data-count={pct}>{pct}</span>%</span>
                </li>
              ))}
            </ul>
          </div>

          <span className={r.rule} data-draw aria-hidden="true" />

          <div className={r.part}>
            {sections.map(([title, rows]) => (
              <div key={title} className={r.sec}>
                <span className={r.partTitle}>{title}</span>
                {rows.map(([k, v]) => {
                  const m = v.match(/^(\d+)(.*)$/);
                  return (
                    <div key={k} className={r.row}>
                      <span>{k}</span>
                      <span className="tnum">{m ? <><span data-count={m[1]}>{m[1]}</span>{m[2]}</> : v}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className={r.note}>{rep.note}</p>
      </article>
    </section>
  );
}
