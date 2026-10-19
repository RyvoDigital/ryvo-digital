"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Pages } from "@/i18n/pages";
import { ArrowUpRight } from "@/components/chrome/Icons";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";
import { FALLBACK_LINKS } from "@/lib/booking/config";
import { objectSrc } from "@/components/automations/objects";
import { useBooking, useCityClock, useSubmit, type Force } from "./useBooking";
import { MercuryLine, DoneMark } from "./Mercury";
import { AutoHeight, Chevron, WriteLine, runs } from "./shared";
import type { BookLabels } from "./labels";
import s from "./BookA.module.css";

// Direction A · The instrument. Two calm panes: on the left, what the call is
// and what happens after it; on the right, one glass instrument that holds the
// whole booking (call, day, time, details) over a chrome speech bubble. The
// mercury line runs along the instrument's top edge as its progress, and when
// the call is booked it settles flat and polished.
export default function BookA({ lang, t, p, L, initial, force }: { lang: Locale; t: Dictionary; p: Pages["book"]; L: BookLabels; initial: 0 | 1; force: Force }) {
  const bk = t.book;
  const panel = useRef<HTMLElement>(null);
  const b = useBooking(lang, initial, panel, force);
  const { stage } = b;
  const clock = useCityClock(b.locale);

  // The first day with a free time opens by itself: one tap to a time.
  const firstOpen = b.days.find((k) => b.byDay.get(k)?.some((x) => x.free)) ?? null;
  const { toggleDay, openDay } = b;
  useEffect(() => {
    if (stage.s === "pick" && !openDay && firstOpen) toggleDay(firstOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.s, firstOpen]);

  const step = stage.s === "done" ? 3 : stage.s === "form" ? 2 : 1;
  const progress = stage.s === "done" ? 1 : stage.s === "form" ? 0.68 : b.openDay ? 0.5 : 0.34;

  const fallback = (
    <a href={FALLBACK_LINKS[b.kind]} target="_blank" rel="noopener noreferrer" className="btn">
      {bk.fallback}
      <span className="btn-arrow"><ArrowUpRight /></span>
    </a>
  );

  return (
    <div className={s.page}>
      <header className={s.top}>
        <SiteNav lang={lang} t={t} bookHref="#book" path="/book" />
      </header>

      <main id="book" className={s.main}>
        <div className={s.grid}>
          {/* ── Left pane: what the call is ───────────────────────────────── */}
          <div className={s.head}>
            <span className={`mono-label ${s.rise}`} style={{ ["--d" as string]: 0 }}>{p.label}</span>
            <h1 className={`display ${s.h1} ${s.rise}`} style={{ ["--d" as string]: 1 }}>{p.title[0]}</h1>
            <p className={`${s.sub} ${s.rise}`} style={{ ["--d" as string]: 2 }}>
              {p.sub} <a href="mailto:hello@ryvodigital.com">hello@ryvodigital.com</a>.
            </p>
            <div className={`${s.spec} ${s.rise}`} style={{ ["--d" as string]: 3 }}>
              <span className={s.specItem}><Dot />{L.duration}</span>
              <span className={s.specItem}><Dot />{L.where}</span>
              <span className={s.specItem}>
                <Dot />{L.lisbon} <b className="tnum">{clock.lisbon}</b>
                <span className={s.specSep}>·</span>
                {L.madrid} <b className="tnum">{clock.madrid}</b>
              </span>
            </div>
          </div>

          {/* ── Right pane: the instrument ────────────────────────────────── */}
          <div className={s.stageCol}>
            <div className={s.backdrop} aria-hidden="true">
              <div className={s.glow} />
              <picture className={s.obj}>
                <source type="image/avif" srcSet={`${objectSrc(0, 800, "avif")} 800w, ${objectSrc(0, 1200, "avif")} 1200w`} sizes="(min-width: 1024px) 520px, 80vw" />
                <img src={objectSrc(0, 800, "webp")} srcSet={`${objectSrc(0, 800, "webp")} 800w, ${objectSrc(0, 1200, "webp")} 1200w`} sizes="(min-width: 1024px) 520px, 80vw" width={1200} height={1200} alt="" decoding="async" fetchPriority="high" />
              </picture>
            </div>

            <section ref={panel} className={s.card} aria-label={p.label} data-step={step}>
              <span className={s.rim} aria-hidden="true" />
              <div className={s.cardTop}>
                <MercuryLine progress={progress} settled={stage.s === "done"} className={s.mercury} />
                <ol className={s.steps}>
                  {L.steps.map((name, i) => (
                    <li key={name} data-state={i + 1 < step || step === 3 ? "done" : i + 1 === step ? "on" : "off"}>
                      <span className="tnum">0{i + 1}</span> {name}
                    </li>
                  ))}
                </ol>
              </div>

              {/* The call: two tiles, a pearl marks the chosen one. */}
              <div role="radiogroup" aria-label={L.stepQs[0]} className={s.kinds} data-locked={stage.s === "done"}>
                {bk.kinds.map((k, i) => (
                  <button
                    key={k} type="button" role="radio" aria-checked={b.kindIdx === i}
                    disabled={stage.s === "done"}
                    onClick={() => { if (b.kindIdx !== i) b.setKindIdx(i as 0 | 1); else if (stage.s === "form") b.setStage({ s: "pick" }); }}
                    className={s.kind}
                  >
                    <span className={s.pearl} aria-hidden="true" />
                    <span className={s.kindName}>{k}</span>
                    <span className={s.kindWith}>{L.with[i]}</span>
                  </button>
                ))}
              </div>

              <AutoHeight className={s.auto}>
                <div className={s.stage} aria-live="polite">
                  {stage.s === "loading" && (
                    <div className={s.skeleton} aria-busy="true">
                      <span className="sr-only">{bk.loading}</span>
                      <div className={s.skRow}>{Array.from({ length: 6 }, (_, i) => <span key={i} className={s.skDay} style={{ ["--i" as string]: i }} />)}</div>
                      <div className={s.skRow}>{Array.from({ length: 8 }, (_, i) => <span key={i} className={s.skPill} style={{ ["--i" as string]: i + 3 }} />)}</div>
                    </div>
                  )}

                  {stage.s === "error" && (
                    <div className={`${s.center} ${s.enter}`}>
                      <span className={s.stateIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 7.5v5.5M12 16.5v.01" /><circle cx="12" cy="12" r="9.2" /></svg></span>
                      <p className={s.stateText}>{bk.errors.unavailable}</p>
                      {fallback}
                    </div>
                  )}

                  {stage.s === "pick" && (b.days.length === 0 ? (
                    <div className={`${s.center} ${s.enter}`}>
                      <span className={s.stateIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg></span>
                      <p className={s.stateText}>{bk.empty}</p>
                      {fallback}
                    </div>
                  ) : (
                    <div className={s.enter}>
                      <div className={s.weekHead}>
                        <span className={s.weekTitle}>
                          <span>{bk.pickTime}</span>
                          <span className={s.tz}>{bk.timesIn} {b.tz.replace(/_/g, " ")}</span>
                        </span>
                        <span className={s.weekNav}>
                          <button type="button" className={s.arrow} aria-label={bk.prevWeek} disabled={b.pageIdx === 0} onClick={() => b.goWeek(b.pageIdx - 1)}><Chevron dir="left" /></button>
                          <span className={s.weekLabel} aria-live="polite">{b.pages[b.pageIdx] && b.fmtRange(b.pages[b.pageIdx])}</span>
                          <button type="button" className={s.arrow} aria-label={bk.nextWeek} disabled={b.pageIdx >= b.pages.length - 1} onClick={() => b.goWeek(b.pageIdx + 1)}><Chevron dir="right" /></button>
                        </span>
                      </div>
                      <div className={s.weekRow} role="group" aria-label={bk.pickTime}>
                        <div key={b.pages[b.pageIdx]?.[0]} className={s.weekPage} data-dir={b.weekDir} style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
                          {(b.pages[b.pageIdx] ?? []).map((k) => {
                            const f = b.fmtDay(k);
                            const any = b.byDay.get(k)?.some((x) => x.free);
                            return (
                              <button key={k} type="button" aria-pressed={k === b.openDay} data-full={!any} onClick={() => b.toggleDay(k)} className={s.day}>
                                <span className={s.dayWd} aria-hidden="true">{f.wd}</span>
                                <span className={`${s.dayN} tnum`} aria-hidden="true">{f.n}</span>
                                <span className="sr-only">{any ? f.full : `${f.full}, ${bk.unavailable}`}</span>
                                {k === b.todayKey && <span className={s.today} aria-hidden="true" />}
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
                                      <button key={iso} type="button" onClick={() => b.setStage({ s: "form", slot: iso })} className={s.time} style={{ ["--i" as string]: k }}>
                                        {b.fmtTime(iso)}
                                      </button>
                                    ) : (
                                      <button key={iso} type="button" disabled aria-label={`${b.fmtTime(iso)}, ${bk.unavailable}`} className={`${s.time} ${s.taken}`} style={{ ["--i" as string]: k }}>
                                        {b.fmtTime(iso)}
                                      </button>
                                    )
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stage.s === "form" && (
                    <div className={s.enter}>
                      <FormA
                        t={bk} L={L} lang={lang} kind={b.kind} tz={b.tz} slot={stage.slot}
                        label={b.fmtFull(stage.slot)} lisbon={b.fmtTime(stage.slot, "Europe/Lisbon")} madrid={b.fmtTime(stage.slot, "Europe/Madrid")}
                        onBack={() => b.setStage({ s: "pick" })}
                        onDone={(email, test) => b.setStage({ s: "done", slot: stage.slot, email, test })}
                        onTaken={() => b.load(b.kind)}
                        onUnavailable={() => b.setStage({ s: "error" })}
                      />
                    </div>
                  )}

                  {stage.s === "done" && (
                    <div className={`${s.done} ${s.enter}`}>
                      <DoneMark size={68} />
                      <p className={`display ${s.doneTitle}`}>{bk.doneTitle}</p>
                      <p className={s.doneWhen}>{b.fmtFull(stage.slot)}</p>
                      <p className={s.doneCities}>
                        {L.lisbon} <b className="tnum">{b.fmtTime(stage.slot, "Europe/Lisbon")}</b><span className={s.specSep}>·</span>{L.madrid} <b className="tnum">{b.fmtTime(stage.slot, "Europe/Madrid")}</b>
                      </p>
                      <p className={s.doneBody}>{bk.doneBody.replace("{email}", stage.email)}</p>
                      {stage.test && <p className={s.test}>{bk.testMode}</p>}
                      <button type="button" className="btn-ghost" onClick={() => b.load(b.kind)}>{bk.another}</button>
                    </div>
                  )}
                </div>
              </AutoHeight>

              <WriteLine lead={L.write} copy={L.copy} copied={L.copied} className={s.write} btnClassName={s.copy} />
            </section>
          </div>

          {/* ── Left pane, below: what happens next ───────────────────────── */}
          <aside className={s.next} aria-labelledby="next-title" data-done={stage.s === "done"}>
            <span id="next-title" className="mono-label">{L.next}</span>
            <ol className={s.rail}>
              <span className={s.railTrack} aria-hidden="true"><span className={s.railFill} /></span>
              {L.nextSteps.map((line, i) => (
                <li key={i} className={s.railItem} data-state={stage.s === "done" ? (i === 0 ? "done" : i === 1 ? "on" : "off") : i === 0 ? "on" : "off"}>
                  <span className={s.railDot} aria-hidden="true" />
                  <span className={`${s.railNum} tnum`}>0{i + 1}</span>
                  <span className={s.railText}>{line}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} bookHref="#book" />
    </div>
  );
}

function Dot() {
  return <span className={s.dot} aria-hidden="true" />;
}

function FormA({ t, L, lang, kind, tz, slot, label, lisbon, madrid, onBack, onDone, onTaken, onUnavailable }: {
  t: Dictionary["book"]; L: BookLabels; lang: Locale; kind: "automations" | "websites"; tz: string; slot: string; label: string; lisbon: string; madrid: string;
  onBack: () => void; onDone: (email: string, test: boolean) => void; onTaken: () => void; onUnavailable: () => void;
}) {
  const { submit, sending, error, bad } = useSubmit({ t, lang, kind, tz, slot, onDone, onTaken, onUnavailable });
  const field = (name: string, labelText: string, type = "text", required = false, auto?: string) => (
    <label className={s.field} data-bad={bad === name}>
      <input name={name} type={type} required={required} autoComplete={auto} maxLength={name === "agency" ? 160 : 200} placeholder=" " />
      <span>{labelText}</span>
    </label>
  );
  return (
    <form className={s.form} onSubmit={submit}>
      <div className={s.chosen}>
        <span className={s.chosenWhen}>
          <span className={s.chosenLabel}>{label}</span>
          <span className={s.chosenCities}>{L.lisbon} <b className="tnum">{lisbon}</b><span className={s.specSep}>·</span>{L.madrid} <b className="tnum">{madrid}</b></span>
        </span>
        <button type="button" onClick={onBack} className={s.change}>{t.change}</button>
      </div>
      <div className={s.fields}>
        {field("name", t.fields.name, "text", true, "name")}
        {field("email", t.fields.email, "email", true, "email")}
        {field("agency", t.fields.agency, "text", true, "organization")}
        {field("whatsapp", t.fields.whatsapp, "tel", false, "tel")}
        <div className={s.wide}>{kind === "automations" ? field("extra", t.fields.enquiries, "text") : field("extra", t.fields.website, "url", false, "url")}</div>
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
        <p className={s.privacy}>
          {t.privacy} <Link href={`/${lang}/privacy-policy`}>{t.privacyLink}</Link>
        </p>
      </div>
    </form>
  );
}
