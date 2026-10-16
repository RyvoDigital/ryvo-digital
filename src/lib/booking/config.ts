// Booking rules. Hours are Europe/Madrid wall time and mirror the current Google
// appointment schedules as published on 16 Oct 2026 (read from the public pages):
// Mon–Fri 09:00–14:00 and 19:00–23:00; Saturday differs per call. Confirm with
// Manuel before launch.

export type Kind = "automations" | "websites";
export const KINDS: Kind[] = ["automations", "websites"];

export type Window = [string, string]; // "HH:MM" start, end (end exclusive)
type Week = Record<number, Window[]>; // 0 = Sunday … 6 = Saturday

const WEEKDAYS: Window[] = [["09:00", "14:00"], ["19:00", "23:00"]];

export const HOURS: Record<Kind, Week> = {
  automations: { 1: WEEKDAYS, 2: WEEKDAYS, 3: WEEKDAYS, 4: WEEKDAYS, 5: WEEKDAYS, 6: [["10:30", "17:00"]] },
  websites: { 1: WEEKDAYS, 2: WEEKDAYS, 3: WEEKDAYS, 4: WEEKDAYS, 5: WEEKDAYS, 6: WEEKDAYS },
};

export const RULES = {
  timeZone: "Europe/Madrid",
  durationMin: 30,
  stepMin: 30,
  bufferMin: 15,
  minNoticeHours: 12,
  horizonDays: 28,
};

export const TITLES: Record<Kind, string> = {
  automations: "Ryvo · Automations call",
  websites: "Ryvo · Websites call",
};

// Fallback: the public Google booking pages, opened in a new tab.
export const FALLBACK_LINKS: Record<Kind, string> = {
  automations: "https://calendar.app.google/B2oHRfo416JWU1UD8",
  websites: "https://calendar.app.google/T4LvbW8jcoD855j98",
};
