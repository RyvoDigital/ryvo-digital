// Booking rules. Hours are Europe/Madrid wall time, confirmed by Manuel on
// 16 Oct 2026: Mon–Fri 09:00–14:00 and 19:00–23:00; Saturday 10:30–17:00 for
// automations calls only; no Sundays.

export type Kind = "automations" | "websites";
export const KINDS: Kind[] = ["automations", "websites"];

export type Window = [string, string]; // "HH:MM" start, end (end exclusive)
type Week = Record<number, Window[]>; // 0 = Sunday … 6 = Saturday

const WEEKDAYS: Window[] = [["09:00", "14:00"], ["19:00", "23:00"]];

export const HOURS: Record<Kind, Week> = {
  automations: { 1: WEEKDAYS, 2: WEEKDAYS, 3: WEEKDAYS, 4: WEEKDAYS, 5: WEEKDAYS, 6: [["10:30", "17:00"]] },
  websites: { 1: WEEKDAYS, 2: WEEKDAYS, 3: WEEKDAYS, 4: WEEKDAYS, 5: WEEKDAYS },
};

export const RULES = {
  timeZone: "Europe/Madrid",
  durationMin: 30,
  // Starts every 15 minutes, with a 15-minute break kept either side of any
  // busy time: after a 10:00–10:30 call the next start is 10:45, and the
  // latest before it 09:15 (Manuel, 19 Oct 2026).
  stepMin: 15,
  bufferMin: 15,
  minNoticeHours: 12,
  horizonDays: 28,
};

export const TITLES: Record<Kind, string> = {
  automations: "Automations call",
  websites: "Websites call",
};

// A site booking in hello@'s calendar: the title starts "Booked ·" and the
// event is Tomato (Google's event colour 11; colour is private to this
// calendar, guests keep their own), so it never looks like the open hours of
// the two Google booking pages (FALLBACK_LINKS) shown in the same calendar.
export const BOOKED_PREFIX = "Booked ·";
export const BOOKED_COLOR_ID = "11";
export const bookedTitle = (kind: Kind, agency: string) => `${BOOKED_PREFIX} ${TITLES[kind]} · ${agency}`;

// Fallback: the public Google booking pages, opened in a new tab.
export const FALLBACK_LINKS: Record<Kind, string> = {
  automations: "https://calendar.app.google/B2oHRfo416JWU1UD8",
  websites: "https://calendar.app.google/T4LvbW8jcoD855j98",
};
