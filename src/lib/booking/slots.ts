import { HOURS, RULES, type Kind } from "./config";

export type Busy = { start: string; end: string };

const MIN = 60_000;

// Offset (minutes) of a time zone from UTC at a given instant, via Intl only.
function offsetMinutes(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / MIN);
}

// A wall-clock time in the zone → the UTC instant (two passes cover DST edges).
export function zonedToUtc(timeZone: string, y: number, m: number, d: number, hh: number, mm: number) {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - offsetMinutes(timeZone, new Date(guess)) * MIN;
  t = guess - offsetMinutes(timeZone, new Date(t)) * MIN;
  return new Date(t);
}

function zonedDate(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { y: Number(get("year")), m: Number(get("month")), d: Number(get("day")), wd };
}

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/** Every bookable 30-minute start (UTC ISO) for a call type, given the calendar's busy blocks. */
export function availableSlots(kind: Kind, busy: Busy[], now = new Date()) {
  const { timeZone, durationMin, stepMin, bufferMin, minNoticeHours, horizonDays } = RULES;
  const earliest = now.getTime() + minNoticeHours * 60 * MIN;
  const latest = now.getTime() + horizonDays * 24 * 60 * MIN;
  const blocks = busy.map((b) => [Date.parse(b.start), Date.parse(b.end)] as const);
  const out: string[] = [];

  for (let day = 0; day <= horizonDays; day++) {
    const ref = new Date(now.getTime() + day * 24 * 60 * MIN);
    const { y, m, d, wd } = zonedDate(timeZone, ref);
    for (const [from, to] of HOURS[kind][wd] ?? []) {
      const [fh, fm] = from.split(":").map(Number);
      const [th, tm] = to.split(":").map(Number);
      for (let mins = fh * 60 + fm; mins + durationMin <= th * 60 + tm; mins += stepMin) {
        const start = zonedToUtc(timeZone, y, m, d, Math.floor(mins / 60), mins % 60).getTime();
        const end = start + durationMin * MIN;
        if (start < earliest || start > latest) continue;
        const guard0 = start - bufferMin * MIN, guard1 = end + bufferMin * MIN;
        if (blocks.some(([b0, b1]) => overlaps(guard0, guard1, b0, b1))) continue;
        out.push(new Date(start).toISOString());
      }
    }
  }
  return [...new Set(out)].sort();
}

export function isBookable(kind: Kind, startIso: string, busy: Busy[], now = new Date()) {
  return availableSlots(kind, busy, now).includes(new Date(startIso).toISOString());
}
