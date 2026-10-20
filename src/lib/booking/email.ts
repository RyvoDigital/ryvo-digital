import { RULES, TITLES, type Kind } from "./config";

// The booking notification: one email from hello@ to hello@ for every booking
// made on the site, built here as a raw MIME message (RFC 5322 + 2045/2047)
// for Gmail's users.messages.send. Pure: no network, no environment, so
// scripts/check-booking-email.mjs builds the exact message and checks it.
// Reply-To is the guest, so a reply goes straight to them.

export const NOTIFY_ADDRESS = "hello@ryvodigital.com";
const FROM_NAME = "Ryvo Digital website";

export type BookingEmailInput = {
  kind: Kind;
  start: string; // ISO, UTC
  name: string;
  email: string;
  agency: string;
  whatsapp?: string;
  extra?: string;
  lang: string; // the page language the guest booked from
  tz?: string; // the guest's own time zone, as their browser reported it
  meet?: string | null;
  eventLink?: string | null;
};

export type BookingEmail = { subject: string; text: string; html: string; raw: string };

const SHORT_KIND: Record<Kind, string> = { automations: "Automations", websites: "Websites" };

// A form value can never reach a header as a new line (guard.ts strips control
// characters already; this keeps the builder safe on its own).
const oneLine = (v: string) => v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

const validZone = (tz?: string) => {
  if (!tz) return null;
  try { new Intl.DateTimeFormat("en-GB", { timeZone: tz }); return tz; } catch { return null; }
};

/** "Tue 21 Oct, 19:30" in the given zone. */
export function fmtWhen(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}`;
}

const zoneName = (tz: string) => (tz.split("/").pop() ?? tz).replace(/_/g, " ");

// ── MIME helpers ──────────────────────────────────────────────────────────────
const utf8 = (s: string) => new TextEncoder().encode(s);
const b64 = (bytes: Uint8Array) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const isAscii = (s: string) => /^[\x20-\x7e]*$/.test(s);

/** RFC 2047 encoded-words, each at most 75 characters, never splitting a character. */
export function encodeWord(s: string) {
  if (isAscii(s)) return s;
  const words: string[] = [];
  let chunk = "";
  for (const ch of s) {
    // "=?UTF-8?B?" + "?=" is 12 characters; 45 bytes of text is 60 of base64.
    if (utf8(chunk + ch).length > 45) { words.push(chunk); chunk = ""; }
    chunk += ch;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${b64(utf8(w))}?=`).join("\r\n ");
}

/** A display name and address: `Name <a@b.c>`, the name encoded when it needs to be. */
const mailbox = (name: string, address: string) => {
  const n = oneLine(name);
  if (!n) return `<${address}>`;
  const shown = isAscii(n) ? `"${n.replace(/["\\]/g, "\\$&")}"` : encodeWord(n);
  return `${shown} <${address}>`;
};

const bodyPart = (type: string, content: string) => {
  const lines = b64(utf8(content)).match(/.{1,76}/g) ?? [];
  return [`Content-Type: ${type}; charset=UTF-8`, "Content-Transfer-Encoding: base64", "", ...lines].join("\r\n");
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// ── The message ───────────────────────────────────────────────────────────────
export function buildBookingEmail(b: BookingEmailInput, opts: { boundary?: string; date?: Date } = {}): BookingEmail {
  const name = oneLine(b.name), email = oneLine(b.email), agency = oneLine(b.agency);
  const madrid = fmtWhen(b.start, RULES.timeZone);
  const guestZone = validZone(b.tz);
  const guestWhen = guestZone ? fmtWhen(b.start, guestZone) : null;
  // The guest's time only when it reads differently from Madrid's.
  const showGuest = guestZone && guestZone !== RULES.timeZone && guestWhen !== madrid;
  const subject = `New booking · ${SHORT_KIND[b.kind]} · ${madrid} · ${name}`;
  const extraLabel = b.kind === "automations" ? "Enquiries per month" : "Current website";

  const rows: [string, string, string?][] = [
    ["Call", `${TITLES[b.kind]} · ${RULES.durationMin} minutes`],
    ["When (Madrid)", madrid],
    ...(showGuest ? [["Guest's time", `${guestWhen} (${zoneName(guestZone)})`] as [string, string]] : []),
    ["Name", name],
    ["Email", email, `mailto:${email}`],
    ["Agency / brand", agency],
    ["WhatsApp", oneLine(b.whatsapp ?? "") || "not given"],
    [extraLabel, oneLine(b.extra ?? "") || "not given"],
    ["Page language", oneLine(b.lang).toUpperCase() || "EN"],
  ];
  const links: [string, string | null][] = [
    ["Google Meet", b.meet ?? null],
    ["Calendar event", b.eventLink ?? null],
  ];

  const text = [
    `New booking on ryvodigital.com`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    ...links.map(([k, v]) => `${k}: ${v ?? "not available"}`),
    "",
    `Reply to this email to write to ${name} directly.`,
  ].join("\n");

  const cell = "padding:8px 0;border-bottom:1px solid #e6e6e6;vertical-align:top;font-size:15px;line-height:1.4";
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#666666">New booking</p>
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;font-weight:600">${esc(TITLES[b.kind])} · ${esc(madrid)}</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
${rows.map(([k, v, href]) => `<tr><td style="${cell};color:#666666;width:40%;padding-right:12px">${esc(k)}</td><td style="${cell}">${href ? `<a href="${esc(href)}" style="color:#111111">${esc(v)}</a>` : esc(v)}</td></tr>`).join("\n")}
</table>
<p style="margin:24px 0 0">${links.map(([k, v]) => (v ? `<a href="${esc(v)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;border-radius:999px;background:#111111;color:#ffffff;text-decoration:none;font-size:14px">${esc(k)}</a>` : `<span style="display:inline-block;margin:0 8px 8px 0;padding:10px 16px;font-size:14px;color:#666666">${esc(k)}: not available</span>`)).join("")}</p>
<p style="margin:16px 0 0;font-size:13px;color:#666666">Reply to this email to write to ${esc(name)} directly.</p>
</div>
</body></html>`;

  const boundary = opts.boundary ?? `ryvo-${crypto.randomUUID()}`;
  const raw = [
    `From: ${mailbox(FROM_NAME, NOTIFY_ADDRESS)}`,
    `To: <${NOTIFY_ADDRESS}>`,
    `Reply-To: ${mailbox(name, email)}`,
    `Subject: ${encodeWord(subject)}`,
    `Date: ${(opts.date ?? new Date()).toUTCString().replace("GMT", "+0000")}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    bodyPart("text/plain", text),
    `--${boundary}`,
    bodyPart("text/html", html),
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return { subject, text, html, raw };
}

/** What makes the message safe to send: null when it is, else the first problem found. */
export function checkMime(raw: string, want: { replyTo: string }): string | null {
  if (/\r(?!\n)|(?<!\r)\n/.test(raw)) return "line endings are not CRLF";
  const [head] = raw.split("\r\n\r\n");
  if (!isAscii(head.replace(/\r\n/g, ""))) return "a header is not 7-bit ASCII";
  if (raw.split("\r\n").some((l) => l.length > 998)) return "a line is longer than 998 characters";
  const headers = head.replace(/\r\n[ \t]/g, " ").split("\r\n");
  const get = (k: string) => headers.filter((h) => h.toLowerCase().startsWith(`${k.toLowerCase()}:`));
  for (const k of ["From", "To", "Reply-To", "Subject", "Date", "MIME-Version", "Content-Type"]) if (get(k).length !== 1) return `${k} is not there exactly once`;
  if (get("Bcc").length || get("Cc").length) return "the message has Cc or Bcc";
  if (!get("From")[0].includes(`<${NOTIFY_ADDRESS}>`)) return "From is not hello@";
  if (get("To")[0] !== `To: <${NOTIFY_ADDRESS}>`) return "To is not hello@ alone";
  if (!get("Reply-To")[0].endsWith(`<${want.replyTo}>`)) return "Reply-To is not the guest";
  const boundary = /boundary="([^"]+)"/.exec(get("Content-Type")[0])?.[1];
  if (!boundary || !raw.includes(`\r\n--${boundary}--\r\n`)) return "the multipart boundary does not close";
  if (raw.split(`--${boundary}\r\n`).length - 1 !== 2) return "the message does not have exactly two parts";
  return null;
}

/** base64url of the raw message, as Gmail's `raw` field wants it. */
export const toBase64Url = (raw: string) => b64(utf8(raw)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
