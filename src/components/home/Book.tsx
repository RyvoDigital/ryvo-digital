"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import { ArrowUpRight } from "@/components/chrome/Icons";
import { FALLBACK_LINKS, type Kind } from "@/lib/booking/config";
import styles from "./Book.module.css";

// Our own booking UI on hello@'s Google Calendar: free times come from
// /api/booking/slots (free/busy), a booking goes to /api/booking/book, which
// re-checks and creates the event with a Meet link (Google emails the invite).
// If the API is unavailable, the Google booking page opens in a new tab instead.

type Stage =
  | { s: "loading" }
  | { s: "error" }
  | { s: "pick" }
  | { s: "form"; slot: string }
  | { s: "done"; slot: string; email: string; test: boolean };

const KIND_OF: Kind[] = ["automations", "websites"];

export default function Book({ lang, t, initial = 0 }: { lang: Locale; t: Dictionary["book"]; initial?: 0 | 1 }) {
  const [kindIdx, setKindIdx] = useState<0 | 1>(initial);
  const kind = KIND_OF[kindIdx];
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [stage, setStage] = useState<Stage>({ s: "loading" });
  const [day, setDay] = useState<string | null>(null);
  const [week, setWeek] = useState(0);
  const [near, setNear] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const tz = useMemo(() => (typeof window === "undefined" ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  const locale = INTL_LOCALE[lang];

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const load = useCallback(async (k: Kind) => {
    setStage({ s: "loading" });
    try {
      const res = await fetch(`/api/booking/slots?kind=${k}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { slots: string[] };
      setSlots((p) => ({ ...p, [k]: json.slots }));
      setDay(null);
      setWeek(0);
      setStage({ s: "pick" });
    } catch {
      setStage({ s: "error" });
    }
  }, []);

  useEffect(() => {
    if (!near) return;
    const id = window.setTimeout(() => load(kind), 0);
    return () => clearTimeout(id);
  }, [near, kind, load]);

  // Group the slots by day in the visitor's own time zone.
  const byDay = useMemo(() => {
    const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    const map = new Map<string, string[]>();
    for (const iso of slots[kind] ?? []) {
      const k = keyFmt.format(new Date(iso));
      map.set(k, [...(map.get(k) ?? []), iso]);
    }
    return map;
  }, [slots, kind, tz]);
  const days = [...byDay.keys()];
  const dayKey = days.join();
  const weeks = useMemo(() => toWeeks(dayKey ? dayKey.split(",") : []), [dayKey]);
  const weekIdx = Math.min(week, Math.max(0, weeks.length - 1));
  const firstOpen = (w: string[] | undefined) => w?.find((k) => byDay.has(k));
  const activeDay = day && byDay.has(day) ? day : firstOpen(weeks[weekIdx]) ?? days[0];

  const fmtDay = (key: string) => {
    const d = new Date(`${key}T12:00:00`);
    return {
      // Three letters in every language (pt-PT's "short" weekday is the whole word).
      wd: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(/\.$/, "").slice(0, 3),
      n: d.getDate(),
      full: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d),
    };
  };
  // "19–24 Oct", or "27 Oct – 1 Nov" across months, in every language.
  const fmtWeek = (w: string[]) => {
    const a = new Date(`${w[0]}T12:00:00`), b = new Date(`${w[w.length - 1]}T12:00:00`);
    const mon = (d: Date) => new Intl.DateTimeFormat(locale, { month: "short" }).format(d).replace(/\.$/, "");
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${mon(b)}` : `${a.getDate()} ${mon(a)} – ${b.getDate()} ${mon(b)}`;
  };
  const goWeek = (i: number) => { setWeek(i); setDay(firstOpen(weeks[i]) ?? null); };
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const fmtFull = (iso: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  const fallback = (
    <a href={FALLBACK_LINKS[kind]} target="_blank" rel="noopener noreferrer" className="btn">
      {t.fallback}
      <span className="btn-arrow"><ArrowUpRight /></span>
    </a>
  );

  return (
    <section id="book" className={styles.section} aria-labelledby="book-title">
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className="mono-label">{t.label}</span>
          <h2 id="book-title" className={`display ${styles.title}`}>
            <span className={styles.titleLine}>{t.title[0]} {t.title[1]}</span>{" "}
            <span className={`chrome-text ${styles.titleLine}`}>{t.title[2]} {t.title[3]}</span>
          </h2>
          <p className={styles.body}>
            {t.body} <a href="mailto:hello@ryvodigital.com" className="text-text underline underline-offset-4">hello@ryvodigital.com</a>.
          </p>
        </div>

        <div ref={panel} className={styles.panel} data-no-pill>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label={t.label} className={styles.kinds}>
              {t.kinds.map((k, i) => (
                <button key={k} type="button" aria-pressed={kindIdx === i} onClick={() => setKindIdx(i as 0 | 1)} className={styles.kind}>
                  {k}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] text-steel">{t.panelTag}</span>
          </div>

          <div className={styles.stage} aria-live="polite">
            {stage.s === "loading" && <div className={styles.skeleton}><span>{t.loading}</span></div>}

            {stage.s === "error" && (
              <div className={styles.center}>
                <p className="m-0 text-[15px] text-body">{t.errors.unavailable}</p>
                {fallback}
              </div>
            )}

            {stage.s === "pick" && (days.length === 0 ? (
              <div className={styles.center}><p className="m-0 max-w-[340px] text-[14px] text-body">{t.empty}</p></div>
            ) : (
              <>
                <div className={styles.weekHead}>
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[15px] font-medium">{t.pickTime}</span>
                    <span className="font-mono text-[10.5px] text-steel">{t.timesIn} {tz.replace(/_/g, " ")}</span>
                  </span>
                  <span className={styles.weekNav}>
                    <button type="button" className={styles.arrow} aria-label={t.prevWeek} disabled={weekIdx === 0} onClick={() => goWeek(weekIdx - 1)}>
                      <Chevron dir="left" />
                    </button>
                    <span className={styles.weekLabel} aria-live="polite">{weeks[weekIdx] && fmtWeek(weeks[weekIdx])}</span>
                    <button type="button" className={styles.arrow} aria-label={t.nextWeek} disabled={weekIdx >= weeks.length - 1} onClick={() => goWeek(weekIdx + 1)}>
                      <Chevron dir="right" />
                    </button>
                  </span>
                </div>
                <WeekStrip
                  weeks={weeks}
                  index={weekIdx}
                  onIndex={(i) => { setWeek(i); }}
                  label={t.pickTime}
                  firstDay={days[0]}
                  render={(k) => {
                    const f = fmtDay(k);
                    const open = byDay.has(k);
                    return (
                      <button key={k} type="button" data-day={k} aria-pressed={k === activeDay} aria-label={f.full} disabled={!open} onClick={() => setDay(k)} className={styles.day}>
                        <span className={styles.dayWd}>{f.wd}</span>
                        <span className={styles.dayN}>{f.n}</span>
                      </button>
                    );
                  }}
                />
                <div className={styles.times} key={activeDay}>
                  {(byDay.get(activeDay!) ?? []).map((iso) => (
                    <button key={iso} type="button" onClick={() => setStage({ s: "form", slot: iso })} className={styles.time}>
                      {fmtTime(iso)}
                    </button>
                  ))}
                </div>
              </>
            ))}

            {stage.s === "form" && (
              <BookingForm
                t={t}
                lang={lang}
                kind={kind}
                tz={tz}
                slot={stage.slot}
                label={fmtFull(stage.slot)}
                onBack={() => setStage({ s: "pick" })}
                onDone={(email, test) => setStage({ s: "done", slot: stage.slot, email, test })}
                onTaken={() => load(kind)}
                onUnavailable={() => setStage({ s: "error" })}
              />
            )}

            {stage.s === "done" && (
              <div className={styles.center}>
                <span className={styles.ring} aria-hidden="true" />
                <p className="m-0 text-[22px] font-medium">{t.doneTitle}</p>
                <p className="m-0 text-[15px] font-medium text-text">{fmtFull(stage.slot)}</p>
                <p className="m-0 max-w-[380px] text-[14px] leading-[1.6] text-body">{t.doneBody.replace("{email}", stage.email)}</p>
                {stage.test && <p className="m-0 font-mono text-[10.5px] tracking-[0.06em] text-steel">{t.testMode}</p>}
                <button type="button" className="btn-ghost mt-2" onClick={() => load(kind)}>{t.another}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Weeks starting on Monday, from the first day with times to the last. Sunday is
// a column only when some visitor's local time puts a slot on one.
function toWeeks(days: string[]) {
  if (!days.length) return [];
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const withSunday = days.some((k) => new Date(`${k}T12:00:00`).getDay() === 0);
  const first = new Date(`${days[0]}T12:00:00`);
  const last = days[days.length - 1];
  const monday = new Date(first);
  monday.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const out: string[][] = [];
  for (const d = new Date(monday); key(d) <= last; d.setDate(d.getDate() + 7)) {
    out.push(Array.from({ length: withSunday ? 7 : 6 }, (_, i) => {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      return key(x);
    }));
  }
  return out;
}

const useDesk = () =>
  useSyncExternalStore(
    (cb) => { const m = matchMedia("(min-width: 1024px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia("(min-width: 1024px)").matches,
    () => true,
  );

// Desktop: one week at a time, sliding between weeks with the arrows.
// Phones: every day in one swipeable row with edge fades; the arrows jump a week
// and the label follows the swipe.
function WeekStrip({ weeks, index, onIndex, label, firstDay, render }: {
  weeks: string[][]; index: number; onIndex: (i: number) => void; label: string; firstDay: string; render: (k: string) => React.ReactNode;
}) {
  const desk = useDesk();
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const fromScroll = useRef(false);

  // Phones: follow the arrows by scrolling to the week's first day.
  useEffect(() => {
    const el = row.current;
    if (desk || !el) return;
    if (fromScroll.current) { fromScroll.current = false; return; }
    const first = (weeks[index] ?? []).map((k) => el.querySelector<HTMLElement>(`[data-day="${k}"]`)).find(Boolean);
    if (first) el.scrollTo({ left: first.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  }, [desk, index, weeks]);

  const onScroll = () => {
    const el = row.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    const chips = [...el.querySelectorAll<HTMLElement>("[data-day]")];
    const firstVisible = chips.find((c) => c.offsetLeft - el.offsetLeft + c.offsetWidth / 2 >= el.scrollLeft);
    const w = weeks.findIndex((wk) => wk.includes(firstVisible?.dataset.day ?? ""));
    if (w >= 0 && w !== index) { fromScroll.current = true; onIndex(w); }
  };

  if (desk) {
    return (
      <div className={styles.weekViewport} role="group" aria-label={label}>
        <div className={styles.weekTrack} style={{ transform: `translateX(${-index * 100}%)` }}>
          {weeks.map((w, i) => (
            <div key={w[0]} className={styles.weekPage} style={{ gridTemplateColumns: `repeat(${w.length}, minmax(0, 1fr))` }} inert={i !== index}>
              {w.map(render)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div ref={row} className={styles.dayRow} role="group" aria-label={label} onScroll={onScroll} data-start={edges.start} data-end={edges.end}>
      {weeks.flat().filter((k) => k >= firstDay).map(render)}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

function BookingForm({
  t, lang, kind, tz, slot, label, onBack, onDone, onTaken, onUnavailable,
}: {
  t: Dictionary["book"]; lang: Locale; kind: Kind; tz: string; slot: string; label: string;
  onBack: () => void; onDone: (email: string, test: boolean) => void; onTaken: () => void; onUnavailable: () => void;
}) {
  const [openedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bad, setBad] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    setBad(null);
    try {
      const res = await fetch("/api/booking/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind, start: slot, lang, tz, openedAt,
          name: f.get("name"), email: f.get("email"), agency: f.get("agency"),
          whatsapp: f.get("whatsapp"), extra: f.get("extra"), website: f.get("company_url"),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; mode?: string };
      if (res.ok && json.ok) return onDone(String(f.get("email")), json.mode === "mock");
      if (res.status === 409) { setError(t.errors.taken); window.setTimeout(onTaken, 1600); return; }
      if (res.status === 429) return setError(t.errors.rate);
      if (res.status === 400) { setBad(json.error ?? null); return setError(t.errors.invalid); }
      onUnavailable();
    } catch {
      onUnavailable();
    } finally {
      setSending(false);
    }
  };

  const field = (name: string, labelText: string, type = "text", required = false, auto?: string) => (
    <label className={styles.field} data-bad={bad === name || (name === "extra" && bad === "extra")}>
      <span>{labelText}</span>
      <input name={name} type={type} required={required} autoComplete={auto} maxLength={name === "agency" ? 160 : 200} />
    </label>
  );

  return (
    <form className={styles.form} onSubmit={submit} noValidate={false}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[15px] font-medium">{label}</span>
        <button type="button" onClick={onBack} className="text-[13px] text-steel underline-offset-4 hover:text-text hover:underline">{t.change}</button>
      </div>
      <div className={styles.grid}>
        {field("name", t.fields.name, "text", true, "name")}
        {field("email", t.fields.email, "email", true, "email")}
        {field("agency", t.fields.agency, "text", true, "organization")}
        {field("whatsapp", t.fields.whatsapp, "tel", false, "tel")}
        {kind === "automations" ? field("extra", t.fields.enquiries, "text") : field("extra", t.fields.website, "url", false, "url")}
      </div>
      {/* Honeypot: invisible to people, tempting to bots. */}
      <label aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        Company URL <input name="company_url" tabIndex={-1} autoComplete="off" />
      </label>
      {error && <p className="m-0 text-[13px] text-[#E8B4B4]" role="alert">{error}</p>}
      <button type="submit" className="btn self-start" disabled={sending}>
        {sending ? t.sending : t.submit}
        <span className="btn-arrow"><ArrowUpRight /></span>
      </button>
      <p className="m-0 text-[12px] leading-[1.6] text-steel">
        {t.privacy} <Link href={`/${lang}/privacy-policy`} className="underline underline-offset-4 hover:text-text">{t.privacyLink}</Link>
      </p>
    </form>
  );
}
