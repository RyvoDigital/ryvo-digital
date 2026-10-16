import "server-only";
import type { Busy } from "./slots";

// Google Calendar for hello@, over plain REST. Credentials come only from the
// environment (.env.local / Vercel), placed by Manuel; nothing here logs them.
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
//   BOOKING_CALENDAR_ID (defaults to "primary": the calendar of the account that consented)
// BOOKING_MOCK=1 swaps in a mock calendar for local testing.

export type Mode = "google" | "mock" | "off";

export function mode(): Mode {
  if (process.env.BOOKING_MOCK === "1") return "mock";
  const { GOOGLE_OAUTH_CLIENT_ID: id, GOOGLE_OAUTH_CLIENT_SECRET: secret, GOOGLE_OAUTH_REFRESH_TOKEN: token } = process.env;
  return id && secret && token ? "google" : "off";
}

const calendarId = () => process.env.BOOKING_CALENDAR_ID || "primary";

let cached: { token: string; expires: number } | null = null;

async function accessToken() {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

// ── Mock calendar: a few busy blocks relative to now, and fake events ─────────
const mockBusy = (): Busy[] => {
  const h = 3_600_000, base = Date.now();
  return [24, 30, 50, 74, 98, 122].map((k) => ({ start: new Date(base + k * h).toISOString(), end: new Date(base + k * h + 1.5 * h).toISOString() }));
};
const mockBooked: Busy[] = [];

export async function freeBusy(timeMin: Date, timeMax: Date): Promise<Busy[]> {
  if (mode() === "mock") return [...mockBusy(), ...mockBooked];
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: calendarId() }] }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`freeBusy ${res.status}`);
  const json = (await res.json()) as { calendars: Record<string, { busy?: Busy[]; errors?: unknown[] }> };
  const cal = Object.values(json.calendars)[0];
  if (!cal || cal.errors?.length) throw new Error("freeBusy calendar error");
  return cal.busy ?? [];
}

export type NewEvent = { summary: string; description: string; start: string; end: string; guest: { email: string; name: string } };

export async function createEvent(e: NewEvent): Promise<{ id: string; meet?: string }> {
  if (mode() === "mock") {
    mockBooked.push({ start: e.start, end: e.end });
    return { id: `mock-${Date.now()}`, meet: undefined };
  }
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events`);
  url.searchParams.set("conferenceDataVersion", "1");
  url.searchParams.set("sendUpdates", "all");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: e.summary,
      description: e.description,
      start: { dateTime: e.start, timeZone: "UTC" },
      end: { dateTime: e.end, timeZone: "UTC" },
      attendees: [{ email: e.guest.email, displayName: e.guest.name }],
      guestsCanModify: false,
      conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      reminders: { useDefault: true },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`insert ${res.status}`);
  const json = (await res.json()) as { id: string; hangoutLink?: string };
  return { id: json.id, meet: json.hangoutLink };
}
