import "server-only";
import type { Kind } from "./config";

// Abuse guards for the booking form: a honeypot, a minimum fill time, strict
// validation and a best-effort rate limit (per server instance) by IP and email.

export type BookingInput = {
  kind: Kind;
  start: string;
  name: string;
  email: string;
  agency: string;
  whatsapp?: string;
  extra?: string; // enquiries per month (automations) or current website (websites)
  lang: string;
  tz?: string;
  website?: string; // honeypot: must stay empty
  openedAt?: number; // ms timestamp when the form was shown
};

const EMAIL = /^[^\s@"<>()[\]\\,;:]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

export function validate(body: Record<string, unknown>): { ok: true; value: BookingInput } | { ok: false; error: string } {
  const kind = body.kind === "websites" ? "websites" : body.kind === "automations" ? "automations" : null;
  if (!kind) return { ok: false, error: "kind" };
  if (clean(body.website, 200)) return { ok: false, error: "spam" };
  const openedAt = Number(body.openedAt);
  if (!Number.isFinite(openedAt) || Date.now() - openedAt < 2500) return { ok: false, error: "spam" };
  const start = clean(body.start, 40);
  if (Number.isNaN(Date.parse(start))) return { ok: false, error: "start" };
  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const agency = clean(body.agency, 160);
  if (name.length < 2) return { ok: false, error: "name" };
  if (!EMAIL.test(email)) return { ok: false, error: "email" };
  if (agency.length < 2) return { ok: false, error: "agency" };
  const whatsapp = clean(body.whatsapp, 32);
  if (whatsapp && !/^\+?[\d\s().-]{6,32}$/.test(whatsapp)) return { ok: false, error: "whatsapp" };
  const extra = clean(body.extra, 200);
  if (kind === "automations" && extra && !/^\d{1,6}$/.test(extra.replace(/[\s.,]/g, ""))) return { ok: false, error: "extra" };
  return { ok: true, value: { kind, start, name, email, agency, whatsapp, extra, lang: clean(body.lang, 5) || "en", tz: clean(body.tz, 64) } };
}

const hits = new Map<string, number[]>();

/** true when the key is still within its limit (records the hit). */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) { hits.set(key, list); return false; }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return true;
}
