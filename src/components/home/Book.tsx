"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const activeDay = day && byDay.has(day) ? day : days[0];

  const fmtDay = (key: string) => {
    const d = new Date(`${key}T12:00:00`);
    return {
      wd: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(/\.$/, ""),
      n: d.getDate(),
      mon: new Intl.DateTimeFormat(locale, { month: "short" }).format(d).replace(/\.$/, ""),
      full: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d),
    };
  };
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
            {t.title[0]}
            <br className="hidden lg:block" /> {t.title[1]} <span className="chrome-text">{t.title[2]}</span>
            <br className="hidden lg:block" /> <span className={`chrome-text ${styles.indent}`}>{t.title[3]}</span>
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
                <div className={styles.daysHead}>
                  <span className="text-[14px] font-medium">{t.pickTime}</span>
                  <span className="font-mono text-[10px] text-steel">{t.timesIn} {tz.replace(/_/g, " ")}</span>
                </div>
                <div className={styles.days} role="group" aria-label={t.pickTime}>
                  {days.map((k) => {
                    const f = fmtDay(k);
                    return (
                      <button key={k} type="button" aria-pressed={k === activeDay} aria-label={f.full} onClick={() => setDay(k)} className={styles.day}>
                        <span className="text-[11px] uppercase text-steel">{f.wd}</span>
                        <span className="tnum text-[20px] font-semibold leading-none">{f.n}</span>
                        <span className="text-[11px] text-steel">{f.mon}</span>
                      </button>
                    );
                  })}
                </div>
                <div className={styles.times}>
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
