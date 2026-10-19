"use client";

import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import type { Dictionary } from "@/i18n";
import { INTL_LOCALE, type Locale } from "@/i18n/config";
import type { Kind } from "@/lib/booking/config";

// The booking logic of src/components/home/Book.tsx, unchanged, lifted into a
// hook so the two lab directions can dress it differently: the same calls to
// /api/booking/slots and /api/booking/book, the same grouping by day in the
// visitor's own time zone, the same week pages, the same request body and the
// same handling of 409/429/400. Only presentation lives in the directions.
//
// Lab only: `force` pins a state (loading, error, empty, done) so each one can
// be looked at without touching the API.

export type Slot = { iso: string; free: boolean };
export type Stage =
  | { s: "loading" }
  | { s: "error" }
  | { s: "pick" }
  | { s: "form"; slot: string }
  | { s: "done"; slot: string; email: string; test: boolean };
export type Force = "loading" | "error" | "empty" | "done" | "form" | null;

const KIND_OF: Kind[] = ["automations", "websites"];

// `panel`: the element whose nearness starts the first load (owned by the caller).
export function useBooking(lang: Locale, initial: 0 | 1, panel: RefObject<HTMLElement | null>, force: Force = null) {
  const [kindIdx, setKindIdx] = useState<0 | 1>(initial);
  const kind = KIND_OF[kindIdx];
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});
  const [stage, setStage] = useState<Stage>({ s: "loading" });
  const [day, setDay] = useState<string | null>(null);
  const [week, setWeek] = useState(0);
  const [weekDir, setWeekDir] = useState<"next" | "prev">("next");
  const [near, setNear] = useState(false);
  const tz = useMemo(() => (typeof window === "undefined" ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  const locale = INTL_LOCALE[lang];

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [panel]);

  const load = useCallback(async (k: Kind) => {
    setStage({ s: "loading" });
    try {
      const res = await fetch(`/api/booking/slots?kind=${k}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { slots: string[]; unavailable?: string[] };
      const all = [...json.slots.map((iso) => ({ iso, free: true })), ...(json.unavailable ?? []).map((iso) => ({ iso, free: false }))]
        .sort((a, b) => a.iso.localeCompare(b.iso));
      setSlots((p) => ({ ...p, [k]: all }));
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

  const byDay = useMemo(() => {
    const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    const map = new Map<string, Slot[]>();
    for (const s of slots[kind] ?? []) {
      const k = keyFmt.format(new Date(s.iso));
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots, kind, tz]);
  const days = [...byDay.keys()];
  const dayKey = days.join();
  const pages = useMemo(() => toPages(dayKey ? dayKey.split(",") : []), [dayKey]);
  const cols = Math.max(1, ...pages.map((p) => p.length));
  const pageIdx = Math.min(week, Math.max(0, pages.length - 1));
  const openDay = day && byDay.has(day) ? day : null;
  const [shownDay, setShownDay] = useState<string | null>(null);
  const todayKey = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()), [tz]);

  const fmtDay = (key: string) => {
    const d = new Date(`${key}T12:00:00`);
    return {
      wd: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(/\.$/, "").slice(0, 3),
      n: d.getDate(),
      full: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(d),
      mon: new Intl.DateTimeFormat(locale, { month: "short" }).format(d).replace(/\.$/, ""),
    };
  };
  const fmtRange = (w: string[]) => {
    const a = new Date(`${w[0]}T12:00:00`), b = new Date(`${w[w.length - 1]}T12:00:00`);
    const mon = (d: Date) => new Intl.DateTimeFormat(locale, { month: "short" }).format(d).replace(/\.$/, "");
    if (w.length === 1) return `${a.getDate()} ${mon(a)}`;
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${mon(b)}` : `${a.getDate()} ${mon(a)} – ${b.getDate()} ${mon(b)}`;
  };
  const goWeek = (i: number) => { setWeekDir(i >= pageIdx ? "next" : "prev"); setWeek(i); };
  const toggleDay = (k: string) => {
    if (openDay === k) { setDay(null); return; }
    setDay(k);
    setShownDay(k);
  };
  const fmtTime = (iso: string, zone = tz) => new Intl.DateTimeFormat(locale, { timeZone: zone, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const fmtFull = (iso: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  // ── Lab: pin a state for review ──────────────────────────────────────────
  const [later] = useState(() => new Date(Date.now() + 2 * 86_400_000).toISOString());
  const firstFree = (slots[kind] ?? []).find((x) => x.free)?.iso ?? later;
  let shown: Stage = stage;
  let shownDays = days;
  if (force === "loading") shown = { s: "loading" };
  else if (force === "error") shown = { s: "error" };
  else if (force === "empty") { shown = { s: "pick" }; shownDays = []; }
  else if (force === "done" && stage.s !== "loading") shown = stage.s === "done" ? stage : { s: "done", slot: firstFree, email: "you@agency.pt", test: true };
  else if (force === "form" && stage.s === "pick") shown = { s: "form", slot: firstFree };

  return {
    kind, kindIdx, setKindIdx, stage: shown, setStage, load, tz, locale,
    byDay, days: shownDays, pages, cols, pageIdx, openDay, shownDay, todayKey, weekDir,
    fmtDay, fmtRange, fmtTime, fmtFull, goWeek, toggleDay,
  };
}

// Pages of seven calendar days, each starting at its first bookable day.
function toPages(days: string[]) {
  const out: string[][] = [];
  let start = 0;
  for (const k of days) {
    const t = new Date(`${k}T12:00:00`).getTime();
    if (!out.length || t - start >= 7 * 86_400_000) { start = t; out.push([]); }
    out[out.length - 1].push(k);
  }
  return out;
}

// The form's submit, as in Book.tsx's BookingForm: the same body, the same
// responses. (A tripped honeypot is answered with a quiet success by the API.)
export function useSubmit({ t, lang, kind, tz, slot, onDone, onTaken, onUnavailable }: {
  t: Dictionary["book"]; lang: Locale; kind: Kind; tz: string; slot: string;
  onDone: (email: string, test: boolean) => void; onTaken: () => void; onUnavailable: () => void;
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
  return { submit, sending, error, bad };
}

// Lisbon and Madrid, now, ticking each minute (set after mount: the server's
// clock is not the visitor's).
export function useCityClock(locale: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  const at = (zone: string) => (now ? new Intl.DateTimeFormat(locale, { timeZone: zone, hour: "2-digit", minute: "2-digit" }).format(now) : "--:--");
  return { lisbon: at("Europe/Lisbon"), madrid: at("Europe/Madrid") };
}

