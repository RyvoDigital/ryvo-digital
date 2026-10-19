"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Pages } from "@/i18n/pages";
import { ArrowUpRight } from "@/components/chrome/Icons";
import NavFrame from "@/components/chrome/NavFrame";
import HeroCard from "@/components/chrome/HeroCard";
import SiteFooter from "@/components/chrome/SiteFooter";
import FloatingNav from "@/components/chrome/FloatingNav";
import { FALLBACK_LINKS } from "@/lib/booking/config";
import { useBooking, useCityClock, useSubmit, type Force } from "./useBooking";
import { MercuryLine, DoneMark } from "./Mercury";
import { AutoHeight, Chevron, WriteLine, runs, quarterCol } from "./shared";
import s from "./BookPage.module.css";

type P = Pages["book"];

// /book (Manuel's round-2 pick, 19 Oct 2026): direction A's structure with
// direction B's look. Two panes: on the left the large "Let's talk.", the
// facts of the call and what happens next; on the right one glass card that
// holds the whole booking at once (call, week, days, times; the form in
// place), so at 1440×900 the picker fits one screen. The days are a ruler of
// light numerals, the chosen one in chrome over a mercury tick. The mercury
// line on the card's top edge is the progress; when the call is booked the
// card becomes the ticket and the line settles dead flat.
export default function BookPage({ lang, t, p, initial, force }: { lang: Locale; t: Dictionary; p: P; initial: 0 | 1; force: Force }) {
  const bk = t.book;
  const panel = useRef<HTMLElement>(null);
  const b = useBooking(lang, initial, panel, force);
  const { stage } = b;
  const clock = useCityClock(b.locale);
  const [lisbon, madrid] = p.cities;
  const bookHref = "#book";
  // The visitor's zone in plain words: Lisbon and Madrid by their local names,
  // any other zone by its own city ("America/New_York" → "New York").
  const zoneCity = b.tz === "Europe/Lisbon" ? lisbon : b.tz === "Europe/Madrid" ? madrid : (b.tz.split("/").pop() ?? b.tz).replace(/_/g, " ");

  // The first day with a free time opens by itself: one tap to a time.
  const firstOpen = b.days.find((k) => b.byDay.get(k)?.some((x) => x.free)) ?? null;
  const { toggleDay, openDay } = b;
  useEffect(() => {
    if (stage.s === "pick" && !openDay && firstOpen) toggleDay(firstOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.s, firstOpen]);

  const step = stage.s === "done" ? 3 : stage.s === "form" ? 2 : 1;
  const progress = stage.s === "done" ? 1 : stage.s === "form" ? 0.68 : b.openDay ? 0.5 : 0.34;
  const cities = (iso: string) => (
    <>{lisbon} <b className="tnum">{b.fmtTime(iso, "Europe/Lisbon")}</b><span className={s.sep} aria-hidden="true">·</span>{madrid} <b className="tnum">{b.fmtTime(iso, "Europe/Madrid")}</b></>
  );

  const fallback = (
    <a href={FALLBACK_LINKS[b.kind]} target="_blank" rel="noopener noreferrer" className="btn">
      {bk.fallback}
      <span className="btn-arrow"><ArrowUpRight /></span>
    </a>
  );

  return (
    <>
      <div className={s.page}>
        <NavFrame lang={lang} t={t} bookHref={bookHref} />

        <HeroCard>
          <main id="book" className={s.main} data-hero>
            <div className={s.glow} aria-hidden="true" />
            <div className={s.grid}>
              {/* ── The intro ───────────────────────────────────────────────── */}
              <div className={s.head}>
                <span className={`mono-label ${s.rise}`} style={{ ["--d" as string]: 0 }}>{p.label}</span>
                <h1 className={`display ${s.h1}`}><span className={s.mask}><span className={s.lineUp}>{p.title[0]}</span></span></h1>
                <p className={`${s.sub} ${s.rise}`} style={{ ["--d" as string]: 3 }}>
                  {p.sub} <a href="mailto:hello@ryvodigital.com">hello@ryvodigital.com</a>.
                </p>
                <p className={`${s.meta} ${s.rise}`} style={{ ["--d" as string]: 4 }}>
                  <span>{p.duration} · {p.where}</span>
                  <span className={s.metaSep} aria-hidden="true" />
                  <span>{lisbon} <b className="tnum">{clock.lisbon}</b></span>
                  <span>{madrid} <b className="tnum">{clock.madrid}</b></span>
                </p>
              </div>

              {/* ── The card ────────────────────────────────────────────────── */}
              <div className={s.stageCol}>
                <section ref={panel} className={s.card} aria-label={p.label} data-step={step}>
                  <span className={s.rim} aria-hidden="true" />
                  <div className={s.cardTop}>
                    <MercuryLine progress={progress} settled={stage.s === "done"} className={s.mercury} />
                    <ol className={s.steps}>
                      {p.steps.map((name, i) => (
                        <li key={name} data-state={i + 1 < step || step === 3 ? "done" : i + 1 === step ? "on" : "off"}>
                          <span className="tnum">0{i + 1}</span> {name}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <AutoHeight className={s.auto}>
                    {stage.s === "done" ? (
                      // ── Booked: the card becomes the ticket ──────────────────
                      <div className={s.ticket} aria-live="polite">
                        <div className={s.ticketHead}>
                          <DoneMark size={56} />
                          <span className="mono-label">{bk.kinds[b.kindIdx]} · {bk.panelTag}</span>
                        </div>
                        <h2 className={`display ${s.ticketTitle}`}>{bk.doneTitle}</h2>
                        <p className={`display ${s.ticketWhen}`}>{b.fmtFull(stage.slot)}</p>
                        <p className={s.cities}>{cities(stage.slot)}</p>
                        <p className={s.ticketBody}>{bk.doneBody.replace("{email}", stage.email)}</p>
                        {stage.test && <p className={s.test}>{bk.testMode}</p>}
                        <button type="button" className="btn-ghost" onClick={() => b.load(b.kind)}>{bk.another}</button>
                      </div>
                    ) : (
                      <div className={s.body}>
                        {/* The call: two tiles, a pearl marks the chosen one. */}
                        <div role="radiogroup" aria-label={p.steps[0]} className={s.kinds}>
                          {bk.kinds.map((k, i) => (
                            <button
                              key={k} type="button" role="radio" aria-checked={b.kindIdx === i}
                              onClick={() => { if (b.kindIdx !== i) b.setKindIdx(i as 0 | 1); else if (stage.s === "form") b.setStage({ s: "pick" }); }}
                              className={s.kind}
                            >
                              <span className={s.pearl} aria-hidden="true" />
                              <span className={s.kindName}>{k}</span>
                              <span className={s.kindWith}>{p.with[i]}</span>
                            </button>
                          ))}
                        </div>

                        <div className={s.stage} aria-live="polite">
                          {stage.s === "loading" && (
                            <div className={s.skeleton} aria-busy="true">
                              <span className="sr-only">{bk.loading}</span>
                              <div className={s.skDays}>{Array.from({ length: 6 }, (_, i) => <span key={i} style={{ ["--i" as string]: i }} />)}</div>
                              <div className={s.skPills}>{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ ["--i" as string]: i + 3 }} />)}</div>
                              <div className={s.skPills}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ ["--i" as string]: i + 6 }} />)}</div>
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
                                  <span className={s.tz}>{p.zone.replace("{city}", zoneCity)}</span>
                                </span>
                                <span className={s.weekNav}>
                                  <button type="button" className={s.arrow} aria-label={bk.prevWeek} disabled={b.pageIdx === 0} onClick={() => b.goWeek(b.pageIdx - 1)}><Chevron dir="left" /></button>
                                  <span className={s.weekLabel} aria-live="polite">{b.pages[b.pageIdx] && b.fmtRange(b.pages[b.pageIdx])}</span>
                                  <button type="button" className={s.arrow} aria-label={bk.nextWeek} disabled={b.pageIdx >= b.pages.length - 1} onClick={() => b.goWeek(b.pageIdx + 1)}><Chevron dir="right" /></button>
                                </span>
                              </div>
                              {/* The days as a ruler: light numerals, the chosen one in chrome over a mercury tick. */}
                              <div className={s.ruler} role="group" aria-label={bk.pickTime}>
                                <div key={b.pages[b.pageIdx]?.[0]} className={s.rulerPage} data-dir={b.weekDir} style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
                                  {(b.pages[b.pageIdx] ?? []).map((k) => {
                                    const f = b.fmtDay(k);
                                    const any = b.byDay.get(k)?.some((x) => x.free);
                                    return (
                                      <button key={k} type="button" aria-pressed={k === b.openDay} data-full={!any} onClick={() => b.toggleDay(k)} className={s.day}>
                                        <span className={s.dayWd} aria-hidden="true">{f.wd}</span>
                                        <span className={`${s.dayN} tnum`} aria-hidden="true">{f.n}</span>
                                        {k === b.todayKey && <span className={s.today} aria-hidden="true" />}
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
                                              <button key={iso} type="button" onClick={() => b.setStage({ s: "form", slot: iso })} className={s.time} style={{ ["--i" as string]: k, ["--c4" as string]: quarterCol(iso, run[0].iso, b.tz, 4), ["--c8" as string]: quarterCol(iso, run[0].iso, b.tz, 8) }}>
                                                {b.fmtTime(iso)}
                                              </button>
                                            ) : (
                                              <button key={iso} type="button" disabled aria-label={`${b.fmtTime(iso)}, ${bk.unavailable}`} className={`${s.time} ${s.taken}`} style={{ ["--i" as string]: k, ["--c4" as string]: quarterCol(iso, run[0].iso, b.tz, 4), ["--c8" as string]: quarterCol(iso, run[0].iso, b.tz, 8) }}>
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
                              <BookingForm
                                t={bk} lang={lang} kind={b.kind} tz={b.tz} slot={stage.slot}
                                label={b.fmtFull(stage.slot)} cities={cities(stage.slot)}
                                onBack={() => b.setStage({ s: "pick" })}
                                onDone={(email, test) => b.setStage({ s: "done", slot: stage.slot, email, test })}
                                onTaken={() => b.load(b.kind)}
                                onUnavailable={() => b.setStage({ s: "error" })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </AutoHeight>

                  <WriteLine lead={p.write} copy={p.copy} copied={p.copied} className={s.write} btnClassName={s.copy} />
                </section>
              </div>

              {/* ── What happens next ───────────────────────────────────────── */}
              <aside className={s.next} aria-labelledby="next-title" data-done={stage.s === "done"}>
                <span id="next-title" className="mono-label">{p.next}</span>
                <ol className={s.rail}>
                  <span className={s.railTrack} aria-hidden="true"><span className={s.railFill} /></span>
                  {p.nextSteps.map((line, i) => (
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
        </HeroCard>

        <SiteFooter lang={lang} t={t} bookHref={bookHref} />
      </div>
      <FloatingNav lang={lang} t={t} bookHref={bookHref} />
    </>
  );
}

function BookingForm({ t, lang, kind, tz, slot, label, cities, onBack, onDone, onTaken, onUnavailable }: {
  t: Dictionary["book"]; lang: Locale; kind: "automations" | "websites"; tz: string; slot: string; label: string; cities: React.ReactNode;
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
          <span className={`display ${s.chosenLabel}`}>{label}</span>
          <span className={s.cities}>{cities}</span>
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
      {/* Honeypot: invisible to people, tempting to bots. */}
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
