"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Pages } from "@/i18n/pages";
import { ArrowUpRight } from "@/components/chrome/Icons";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";
import { FALLBACK_LINKS } from "@/lib/booking/config";
import { useBooking, useCityClock, useSubmit, type Force } from "./useBooking";
import { DoneMark, MercuryLine } from "./Mercury";
import { Chevron, WriteLine, runs } from "./shared";
import type { BookLabels } from "./labels";
import s from "./BookB.module.css";

// Direction B · The concierge. One centred column in large type, the booking
// as three questions asked one at a time: which call, when, who. A finished
// question folds into one line you can reopen. A vertical mercury rail runs
// beside them and a bead of light moves down it as you answer; at the end the
// page's one piece of glass appears, the booking as a ticket, and the
// mercury line under it settles flat.
export default function BookB({ lang, t, p, L, initial, force }: { lang: Locale; t: Dictionary; p: Pages["book"]; L: BookLabels; initial: 0 | 1; force: Force }) {
  const bk = t.book;
  const panel = useRef<HTMLElement>(null);
  const b = useBooking(lang, initial, panel, force);
  const { stage } = b;
  const clock = useCityClock(b.locale);
  // ?kind=websites arrives with the call already chosen.
  const [choosing, setChoosing] = useState(initial === 0 && !force);
  const done = stage.s === "done";
  const open = done ? 3 : stage.s === "form" ? 2 : choosing ? 0 : 1;
  const progress = [0.12, 0.45, 0.78, 1][open];

  const firstOpen = b.days.find((k) => b.byDay.get(k)?.some((x) => x.free)) ?? null;
  const { toggleDay, openDay } = b;
  useEffect(() => {
    if (stage.s === "pick" && !openDay && firstOpen) toggleDay(firstOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.s, firstOpen]);

  // Keep the open question in view when the one above folds away.
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === open) return;
    prevOpen.current = open;
    // Measured once the question above has folded shut (0.75 s).
    const id = window.setTimeout(() => {
      const el = open === 3 ? document.getElementById("ticket") : stepRefs.current[open];
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 72 || r.top > window.innerHeight * 0.6) {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + r.top - 96, behavior: reduce ? "auto" : "smooth" });
      }
    }, 520);
    return () => clearTimeout(id);
  }, [open]);

  const chooseKind = (i: 0 | 1) => { b.setKindIdx(i); setChoosing(false); };
  const reopenKind = () => { if (stage.s === "form") b.setStage({ s: "pick" }); setChoosing(true); };

  const fallback = (
    <a href={FALLBACK_LINKS[b.kind]} target="_blank" rel="noopener noreferrer" className="btn">
      {bk.fallback}
      <span className="btn-arrow"><ArrowUpRight /></span>
    </a>
  );

  const stepState = (i: number) => (done || i < open ? "done" : i === open ? "open" : "later");

  return (
    <div className={s.page}>
      <header className={s.top}>
        <SiteNav lang={lang} t={t} bookHref="#book" path="/book" />
      </header>

      <main id="book" className={s.main}>
        <header className={s.hero}>
          <span className={`mono-label ${s.rise}`} style={{ ["--d" as string]: 0 }}>{p.label}</span>
          <h1 className={`display ${s.h1}`}><span className={s.mask}><span className={s.lineUp}>{p.title[0]}</span></span></h1>
          <p className={`${s.sub} ${s.rise}`} style={{ ["--d" as string]: 3 }}>{p.sub} <a href="mailto:hello@ryvodigital.com">hello@ryvodigital.com</a>.</p>
          <p className={`${s.meta} ${s.rise}`} style={{ ["--d" as string]: 4 }}>
            <span>{bk.panelTag}</span>
            <span className={s.metaSep} aria-hidden="true" />
            <span>{L.lisbon} <b className="tnum">{clock.lisbon}</b></span>
            <span>{L.madrid} <b className="tnum">{clock.madrid}</b></span>
          </p>
        </header>

        <div ref={panel as React.RefObject<HTMLDivElement>} className={s.flow} data-done={done}>
          {/* The rail: a hairline, the mercury filling it, a bead at its head. */}
          <span className={s.rail} aria-hidden="true">
            <span className={s.railFill} style={{ transform: `scaleY(${progress})` }} />
            <span className={s.railHead} style={{ transform: `translate3d(0, ${(progress - 1) * 100}%, 0)` }}><span /></span>
          </span>

          {/* 01 · Which call? */}
          <section ref={(el) => { stepRefs.current[0] = el; }} className={s.step} data-state={stepState(0)} aria-labelledby="q1">
            <StepHead n={1} L={L} id="q1" q={L.stepQs[0]} state={stepState(0)} summary={<>{bk.kinds[b.kindIdx]}<span className={s.sumDim}> · {L.with[b.kindIdx]}</span></>} onChange={done ? undefined : reopenKind} change={bk.change.split(" ")[0]} />
            <Fold open={open === 0}>
              <div role="radiogroup" aria-labelledby="q1" className={s.kinds}>
                {bk.kinds.map((k, i) => (
                  <button key={k} type="button" role="radio" aria-checked={b.kindIdx === i} onClick={() => chooseKind(i as 0 | 1)} className={s.kind}>
                    <span className={`display ${s.kindName}`}>{k}</span>
                    <span className={s.kindWith}>{L.with[i]} · {L.duration}</span>
                    <span className={s.kindGo} aria-hidden="true"><ArrowUpRight /></span>
                  </button>
                ))}
              </div>
            </Fold>
          </section>

          {/* 02 · When? */}
          <section ref={(el) => { stepRefs.current[1] = el; }} className={s.step} data-state={stepState(1)} aria-labelledby="q2">
            <StepHead
              n={2} L={L} id="q2" q={L.stepQs[1]} state={stepState(1)}
              summary={stage.s === "form" || stage.s === "done" ? <span className={s.cap}>{b.fmtFull(stage.slot)}</span> : null}
              onChange={stage.s === "form" ? () => b.setStage({ s: "pick" }) : undefined} change={bk.change.split(" ")[0]}
            />
            <Fold open={open === 1}>
              <div className={s.when} aria-live="polite">
                {stage.s === "loading" && (
                  <div className={s.skeleton} aria-busy="true">
                    <span className="sr-only">{bk.loading}</span>
                    <div className={s.skDays}>{Array.from({ length: 6 }, (_, i) => <span key={i} style={{ ["--i" as string]: i }} />)}</div>
                    <div className={s.skPills}>{Array.from({ length: 6 }, (_, i) => <span key={i} style={{ ["--i" as string]: i + 3 }} />)}</div>
                  </div>
                )}
                {stage.s === "error" && (
                  <div className={s.state}>
                    <p className={s.stateText}>{bk.errors.unavailable}</p>
                    {fallback}
                  </div>
                )}
                {(stage.s === "pick" || stage.s === "form" || stage.s === "done") && b.days.length === 0 && (
                  <div className={s.state}>
                    <p className={s.stateText}>{bk.empty}</p>
                    {fallback}
                  </div>
                )}
                {(stage.s === "pick" || stage.s === "form" || stage.s === "done") && b.days.length > 0 && (
                  <>
                    <div className={s.weekBar}>
                      <span className={s.tz}>{bk.timesIn} {b.tz.replace(/_/g, " ")}</span>
                      <span className={s.weekNav}>
                        <button type="button" className={s.arrow} aria-label={bk.prevWeek} disabled={b.pageIdx === 0} onClick={() => b.goWeek(b.pageIdx - 1)}><Chevron dir="left" /></button>
                        <span className={s.weekLabel} aria-live="polite">{b.pages[b.pageIdx] && b.fmtRange(b.pages[b.pageIdx])}</span>
                        <button type="button" className={s.arrow} aria-label={bk.nextWeek} disabled={b.pageIdx >= b.pages.length - 1} onClick={() => b.goWeek(b.pageIdx + 1)}><Chevron dir="right" /></button>
                      </span>
                    </div>
                    {/* The days as a ruler: big numerals, the chosen one in chrome over a mercury tick. */}
                    <div className={s.ruler} role="group" aria-label={bk.pickTime}>
                      <div key={b.pages[b.pageIdx]?.[0]} className={s.rulerPage} data-dir={b.weekDir} style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
                        {(b.pages[b.pageIdx] ?? []).map((k) => {
                          const f = b.fmtDay(k);
                          const any = b.byDay.get(k)?.some((x) => x.free);
                          return (
                            <button key={k} type="button" aria-pressed={k === b.openDay} data-full={!any} onClick={() => b.toggleDay(k)} className={s.day}>
                              <span className={s.dayWd} aria-hidden="true">{f.wd}{k === b.todayKey ? " ·" : ""}</span>
                              <span className={`${s.dayN} tnum`} aria-hidden="true">{f.n}</span>
                              <span className={s.tick} aria-hidden="true" />
                              <span className="sr-only">{any ? f.full : `${f.full}, ${bk.unavailable}`}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className={s.expand} data-open={Boolean(b.openDay)}>
                      <div className={s.expandInner}>
                        {b.shownDay && (
                          <div className={s.runs} key={b.shownDay} inert={!b.openDay}>
                            {runs(b.byDay.get(b.shownDay) ?? []).map((run) => (
                              <div key={run[0].iso} className={s.times}>
                                {run.map(({ iso, free }, k) => (
                                  free ? (
                                    <button key={iso} type="button" onClick={() => b.setStage({ s: "form", slot: iso })} className={s.time} style={{ ["--i" as string]: k }}>{b.fmtTime(iso)}</button>
                                  ) : (
                                    <button key={iso} type="button" disabled aria-label={`${b.fmtTime(iso)}, ${bk.unavailable}`} className={`${s.time} ${s.taken}`} style={{ ["--i" as string]: k }}>{b.fmtTime(iso)}</button>
                                  )
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Fold>
          </section>

          {/* 03 · Who are we meeting? */}
          <section ref={(el) => { stepRefs.current[2] = el; }} className={s.step} data-state={stepState(2)} aria-labelledby="q3">
            <StepHead n={3} L={L} id="q3" q={L.stepQs[2]} state={stepState(2)} summary={done && stage.s === "done" ? stage.email : null} />
            <Fold open={open === 2}>
              {stage.s === "form" && (
                <FormB
                  t={bk} L={L} lang={lang} kind={b.kind} tz={b.tz} slot={stage.slot}
                  lisbon={b.fmtTime(stage.slot, "Europe/Lisbon")} madrid={b.fmtTime(stage.slot, "Europe/Madrid")}
                  onDone={(email, test) => b.setStage({ s: "done", slot: stage.slot, email, test })}
                  onTaken={() => b.load(b.kind)}
                  onUnavailable={() => b.setStage({ s: "error" })}
                />
              )}
            </Fold>
          </section>

          {/* The end of the rail: the ticket. */}
          <span className={s.endNode} aria-hidden="true" />
          {stage.s === "done" && (
            <div id="ticket" className={s.ticketWrap}>
              <div className={s.ticketGlow} aria-hidden="true" />
              <section className={s.ticket} aria-live="polite" aria-labelledby="ticket-title">
                <span className={s.rim} aria-hidden="true" />
                <div className={s.ticketHead}>
                  <DoneMark size={56} />
                  <span className="mono-label">{bk.kinds[b.kindIdx]} · {bk.panelTag}</span>
                </div>
                <h2 id="ticket-title" className={`display ${s.ticketTitle}`}>{bk.doneTitle}</h2>
                <p className={`display ${s.ticketWhen}`}>{b.fmtFull(stage.slot)}</p>
                <MercuryLine progress={1} settled className={s.ticketLine} />
                <p className={s.ticketCities}>{L.lisbon} <b className="tnum">{b.fmtTime(stage.slot, "Europe/Lisbon")}</b><span>·</span>{L.madrid} <b className="tnum">{b.fmtTime(stage.slot, "Europe/Madrid")}</b></p>
                <p className={s.ticketBody}>{bk.doneBody.replace("{email}", stage.email)}</p>
                {stage.test && <p className={s.test}>{bk.testMode}</p>}
                <button type="button" className="btn-ghost" onClick={() => { setChoosing(false); b.load(b.kind); }}>{bk.another}</button>
              </section>
            </div>
          )}
        </div>

        {/* What happens next: three quiet columns under the flow. */}
        <aside className={s.next} aria-labelledby="next-b" data-done={done}>
          <span id="next-b" className="mono-label">{L.next}</span>
          <ol className={s.nextList}>
            {L.nextSteps.map((line, i) => (
              <li key={i} data-state={done ? (i === 0 ? "done" : i === 1 ? "on" : "off") : i === 0 ? "on" : "off"}>
                <span className={`${s.nextNum} tnum`}>0{i + 1}</span>
                <span className={s.nextText}>{line}</span>
              </li>
            ))}
          </ol>
          <WriteLine lead={L.write} copy={L.copy} copied={L.copied} className={s.write} btnClassName={s.copy} />
        </aside>
      </main>

      <SiteFooter lang={lang} t={t} bookHref="#book" />
    </div>
  );
}

function StepHead({ n, L, id, q, state, summary, onChange, change }: { n: number; L: BookLabels; id: string; q: string; state: string; summary?: React.ReactNode; onChange?: () => void; change?: string }) {
  return (
    <div className={s.head}>
      <span className={s.node} aria-hidden="true" />
      <span className={`${s.num} tnum`}>0{n} <span className={s.numOf}>{L.stepOf} 03</span></span>
      <h2 id={id} className={`display ${s.q}`}>{q}</h2>
      {state === "done" && summary && (
        <span className={s.summary}>
          <span className={s.sumText}>{summary}</span>
          {onChange && <button type="button" className={s.change} onClick={onChange}>{change}</button>}
        </span>
      )}
    </div>
  );
}

// A question's body folds open and shut: a height change with no measuring.
function Fold({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className={s.fold} data-open={open}>
      <div className={s.foldInner} inert={!open}>{children}</div>
    </div>
  );
}

function FormB({ t, L, lang, kind, tz, slot, lisbon, madrid, onDone, onTaken, onUnavailable }: {
  t: Dictionary["book"]; L: BookLabels; lang: Locale; kind: "automations" | "websites"; tz: string; slot: string; lisbon: string; madrid: string;
  onDone: (email: string, test: boolean) => void; onTaken: () => void; onUnavailable: () => void;
}) {
  const { submit, sending, error, bad } = useSubmit({ t, lang, kind, tz, slot, onDone, onTaken, onUnavailable });
  const field = (name: string, labelText: string, type = "text", required = false, auto?: string) => (
    <label className={s.field} data-bad={bad === name}>
      <span className={s.fieldLabel}>{labelText}</span>
      <input name={name} type={type} required={required} autoComplete={auto} maxLength={name === "agency" ? 160 : 200} />
      <span className={s.fieldLine} aria-hidden="true" />
    </label>
  );
  return (
    <form className={s.form} onSubmit={submit}>
      <p className={s.formCities}>{L.lisbon} <b className="tnum">{lisbon}</b><span>·</span>{L.madrid} <b className="tnum">{madrid}</b></p>
      <div className={s.fields}>
        {field("name", t.fields.name, "text", true, "name")}
        {field("email", t.fields.email, "email", true, "email")}
        {field("agency", t.fields.agency, "text", true, "organization")}
        {field("whatsapp", t.fields.whatsapp, "tel", false, "tel")}
        {kind === "automations" ? field("extra", t.fields.enquiries, "text") : field("extra", t.fields.website, "url", false, "url")}
      </div>
      <label aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        Company URL <input name="company_url" tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p className={s.error} role="alert">{error}</p>}
      <div className={s.submitRow}>
        <button type="submit" className="btn" disabled={sending}>
          {sending ? t.sending : t.submit}
          <span className="btn-arrow"><ArrowUpRight /></span>
        </button>
        <p className={s.privacy}>{t.privacy} <Link href={`/${lang}/privacy-policy`}>{t.privacyLink}</Link></p>
      </div>
    </form>
  );
}
