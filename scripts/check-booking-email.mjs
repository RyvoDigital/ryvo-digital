// The booking notification email to hello@: builds the exact MIME message
// (src/lib/booking/email.ts, transpiled in memory) for a booking from each
// page language, checks it, and writes the previews to
// .review/step2/booking-email/. Then runs the real send path (google.ts +
// notify.ts) with fetch stubbed, so nothing reaches Google: no email is sent
// and no event is created. Exit 1 on any failure.
// Usage: npm run check:booking-email
import fs from "node:fs";
import ts from "typescript";

const src = (f) => fs.readFileSync(new URL(`../src/lib/booking/${f}`, import.meta.url), "utf8");
const js = (code) => ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const url = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const config = url(js(src("config.ts")));
const mock = url(js(src("mock.ts")));
const email = url(js(src("email.ts")).replace(/from "\.\/config"/, `from "${config}"`));
const google = url(js(src("google.ts")).replace(/import "server-only";/, "").replace(/from "\.\/mock"/, `from "${mock}"`).replace(/from "\.\/config"/, `from "${config}"`));
const notify = url(js(src("notify.ts")).replace(/import "server-only";/, "").replace(/from "\.\/email"/, `from "${email}"`).replace(/from "\.\/google"/, `from "${google}"`));
const { buildBookingEmail, checkMime, toBase64Url } = await import(email);

// ── Reading a message back the way a mail client would ────────────────────────
const split = (raw) => {
  const [head, ...rest] = raw.split("\r\n\r\n");
  const headers = head.replace(/\r\n[ \t]/g, " ").split("\r\n");
  return { head, headers, body: rest.join("\r\n\r\n") };
};
const header = (raw, k) => split(raw).headers.find((h) => h.toLowerCase().startsWith(`${k.toLowerCase()}:`))?.slice(k.length + 1).trim();
// Whitespace between two encoded-words is folding, not text (RFC 2047 §6.2).
const decodeWords = (v) => v.replace(/\?=\s+=\?UTF-8/g, "?==?UTF-8").replace(/=\?UTF-8\?B\?([^?]+)\?=/g, (_, b) => Buffer.from(b, "base64").toString("utf8"));
const parts = (raw) => {
  const boundary = /boundary="([^"]+)"/.exec(header(raw, "Content-Type"))[1];
  return raw.split(`--${boundary}`).slice(1, -1).map((p) => {
    const [h, b] = p.replace(/^\r\n/, "").split("\r\n\r\n");
    return { type: /Content-Type: ([^;]+)/.exec(h)[1], body: Buffer.from(b.replace(/\r\n/g, ""), "base64").toString("utf8") };
  });
};

// ── Three bookings, one per page language ─────────────────────────────────────
const START = "2026-10-21T17:30:00.000Z"; // 19:30 in Madrid, 18:30 in Lisbon
const fixed = { boundary: "ryvo-preview", date: new Date("2026-10-20T10:00:00Z") };
const SAMPLES = {
  en: { kind: "automations", start: START, name: "Sarah O’Connor", email: "sarah@example.com", agency: "Harbour & Hill <Estates>", whatsapp: "+44 7700 900123", extra: "40", lang: "en", tz: "Europe/London", meet: "https://meet.google.com/abc-defg-hij", eventLink: "https://www.google.com/calendar/event?eid=preview-en" },
  pt: { kind: "websites", start: START, name: "Joana Simões", email: "joana@example.pt", agency: "Marcação Imóveis", whatsapp: "", extra: "www.situacao-imoveis.pt (Situação)", lang: "pt", tz: "Europe/Lisbon", meet: "https://meet.google.com/klm-nopq-rst", eventLink: "https://www.google.com/calendar/event?eid=preview-pt" },
  es: { kind: "automations", start: START, name: "José Ángel Muñoz", email: "jose@example.es", agency: "Inmobiliaria Peñalara", whatsapp: "+34 600 000 000", extra: "", lang: "es", tz: "Europe/Madrid", meet: "https://meet.google.com/uvw-xyza-bcd", eventLink: "https://www.google.com/calendar/event?eid=preview-es" },
};
const built = Object.fromEntries(Object.entries(SAMPLES).map(([k, v]) => [k, buildBookingEmail(v, fixed)]));

const out = new URL("../.review/step2/booking-email/", import.meta.url);
fs.mkdirSync(out, { recursive: true });
for (const [lang, m] of Object.entries(built)) {
  const [text, html] = parts(m.raw);
  const head = split(m.raw).headers.filter((h) => /^(From|To|Reply-To|Subject):/.test(h)).map((h) => h.replace(/^(\S+) (.*)$/, (_, k, v) => `${k} ${decodeWords(v)}`));
  fs.writeFileSync(new URL(`email-preview-${lang}.txt`, out), `${head.join("\n")}\n\n${text.body}\n`);
  fs.writeFileSync(new URL(`email-preview-${lang}.html`, out), html.body.replace("<body", `<body data-headers="${head.join(" | ").replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[c])}"`));
  fs.writeFileSync(new URL(`email-preview-${lang}.eml`, out), m.raw);
}

const en = built.en, pt = built.pt, es = built.es;
const ptText = parts(pt.raw)[0].body, enText = parts(en.raw)[0].body, esText = parts(es.raw)[0].body;
const enHtml = parts(en.raw)[1].body;
const longestWord = Math.max(...[en, pt, es].flatMap((m) => m.raw.match(/=\?UTF-8\?B\?[^?]+\?=/g) ?? []).map((w) => w.length));

// A name that tries to start a new header line.
const evil = buildBookingEmail({ ...SAMPLES.en, name: "Eve\r\nBcc: spy@example.com", agency: "X\nCc: spy@example.com" }, fixed);
// An unknown zone from the browser must not break the build.
const badZone = buildBookingEmail({ ...SAMPLES.en, tz: "Mars/Olympus" }, fixed);
// checkMime can fail: a Reply-To that is not the guest, and an added Bcc.
const tamperedReply = en.raw.replace("<sarah@example.com>", "<someone@else.com>");
const tamperedBcc = en.raw.replace("MIME-Version: 1.0", "Bcc: spy@example.com\r\nMIME-Version: 1.0");

// ── The send path, with fetch stubbed ─────────────────────────────────────────
Object.assign(process.env, { GOOGLE_OAUTH_CLIENT_ID: "x", GOOGLE_OAUTH_CLIENT_SECRET: "x", GOOGLE_OAUTH_REFRESH_TOKEN: "x", BOOKING_MOCK: "", NODE_ENV: "production", VERCEL_ENV: "production" });
let gmailStatus = 200;
const sent = [], everyHref = [];
globalThis.fetch = async (u, init) => {
  const href = String(u);
  sent.push({ href, body: init?.body });
  everyHref.push(href);
  if (href.startsWith("https://oauth2.googleapis.com/token")) return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }));
  if (href === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send") return new Response(JSON.stringify({ id: "m1" }), { status: gmailStatus });
  throw new Error(`unexpected request ${href}`);
};
const logs = [];
console.error = (...a) => logs.push(a.join(" "));
console.info = (...a) => logs.push(a.join(" "));
const { mode } = await import(google);
const { notifyBooking } = await import(notify);

const realMode = mode();
const okResult = await notifyBooking(SAMPLES.pt);
const gmailCalls = sent.filter((s) => s.href.includes("gmail")).length;
const gmailCall = sent.find((s) => s.href.includes("gmail.googleapis.com"));
const sentRaw = gmailCall ? JSON.parse(gmailCall.body).raw : "";
const sentDecoded = Buffer.from(sentRaw.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

gmailStatus = 500;
logs.length = 0;
let threw = false, failResult;
try { failResult = await notifyBooking(SAMPLES.pt); } catch { threw = true; }
const failLogs = [...logs];

Object.assign(process.env, { BOOKING_MOCK: "1", NODE_ENV: "development", VERCEL_ENV: "" });
sent.length = 0;
logs.length = 0;
const mockResult = await notifyBooking(SAMPLES.es);
const mockMode = mode();

const personal = Object.values(SAMPLES).flatMap((s) => [s.name, s.email, s.agency, s.whatsapp]).filter(Boolean);
const cases = [
  ["subject: New booking · {kind} · {Madrid time} · {guest}", en.subject === "New booking · Automations · Wed 21 Oct, 19:30 · Sarah O’Connor" && pt.subject === "New booking · Websites · Wed 21 Oct, 19:30 · Joana Simões"],
  ["the Subject header decodes back to that subject (UTF-8, RFC 2047)", [en, pt, es].every((m) => decodeWords(header(m.raw, "Subject")) === m.subject)],
  ["every encoded-word is at most 75 characters", longestWord > 0 && longestWord <= 75],
  ["the headers are plain ASCII (accents only inside encoded-words)", [en, pt, es].every((m) => /^[\x20-\x7e\r\n]*$/.test(split(m.raw).head))],
  ["From and To are hello@ryvodigital.com", [en, pt, es].every((m) => header(m.raw, "To") === "<hello@ryvodigital.com>" && header(m.raw, "From").endsWith("<hello@ryvodigital.com>"))],
  ["Reply-To is the guest, name decoded with its accents", decodeWords(header(pt.raw, "Reply-To")) === "Joana Simões <joana@example.pt>" && decodeWords(header(en.raw, "Reply-To")) === "Sarah O’Connor <sarah@example.com>"],
  ["checkMime passes all three messages", [en, pt, es].every((m, i) => checkMime(m.raw, { replyTo: Object.values(SAMPLES)[i].email }) === null)],
  ["checkMime fails a Reply-To that is not the guest", checkMime(tamperedReply, { replyTo: "sarah@example.com" }) === "Reply-To is not the guest"],
  ["checkMime fails an added Bcc", checkMime(tamperedBcc, { replyTo: "sarah@example.com" }) === "the message has Cc or Bcc"],
  ["two parts: text/plain then text/html", [en, pt, es].every((m) => parts(m.raw).map((p) => p.type).join() === "text/plain,text/html")],
  ["the body is UTF-8: Marcação, Situação, Simões read back intact", ptText.includes("Agency / brand: Marcação Imóveis") && ptText.includes("(Situação)") && ptText.includes("Name: Joana Simões")],
  ["Madrid time, plus the guest's own time when it differs", ptText.includes("When (Madrid): Wed 21 Oct, 19:30") && ptText.includes("Guest's time: Wed 21 Oct, 18:30 (Lisbon)") && enText.includes("Guest's time: Wed 21 Oct, 18:30 (London)")],
  ["no guest time when the guest is in Madrid", !esText.includes("Guest's time")],
  ["every form answer is there, unanswered ones as \"not given\"", enText.includes("WhatsApp: +44 7700 900123") && enText.includes("Enquiries per month: 40") && ptText.includes("WhatsApp: not given") && ptText.includes("Current website: www.situacao-imoveis.pt (Situação)") && esText.includes("Enquiries per month: not given")],
  ["the Meet link and the calendar event link", ptText.includes("Google Meet: https://meet.google.com/klm-nopq-rst") && ptText.includes("Calendar event: https://www.google.com/calendar/event?eid=preview-pt")],
  ["the page language: EN, PT, ES", enText.includes("Page language: EN") && ptText.includes("Page language: PT") && esText.includes("Page language: ES")],
  ["the guest's email is a mailto link in the HTML", enHtml.includes('<a href="mailto:sarah@example.com"')],
  ["form values are escaped in the HTML", enHtml.includes("Harbour &amp; Hill &lt;Estates&gt;") && !enHtml.includes("<Estates>")],
  ["a name with a line break cannot add a Bcc or Cc header", checkMime(evil.raw, { replyTo: "sarah@example.com" }) === null && !/\r\n(Bcc|Cc):/i.test(split(evil.raw).head)],
  ["an unknown browser zone is ignored, not fatal", checkMime(badZone.raw, { replyTo: "sarah@example.com" }) === null && !parts(badZone.raw)[0].body.includes("Guest's time")],
  ["Google mode for the send test (fetch stubbed)", realMode === "google"],
  ["sent once to Gmail's users.messages.send for 'me'", okResult === "sent" && gmailCalls === 1],
  ["Gmail gets base64url (no + / =) that decodes to the exact message", /^[A-Za-z0-9_-]+$/.test(sentRaw) && sentDecoded === buildBookingEmail(SAMPLES.pt, { boundary: /boundary="([^"]+)"/.exec(sentDecoded)?.[1], date: new Date(/Date: (.*)\r\n/.exec(sentDecoded)?.[1] ?? 0) }).raw && toBase64Url("é?>") === "w6k_Pg"],
  ["a Gmail 500 does not throw: the booking stands", !threw && failResult === "failed"],
  ["the failure is logged with the reason only", failLogs.length === 1 && failLogs[0] === "booking email failed: gmail 500"],
  ["no log line carries a guest's details", [...failLogs, ...logs].every((l) => personal.every((p) => !l.includes(p)))],
  ["BOOKING_MOCK in dev: built and checked, no request at all", mockMode === "mock" && mockResult === "mock" && sent.length === 0],
  ["only Google's token and Gmail endpoints were ever called", everyHref.length > 0 && everyHref.every((h) => h === "https://oauth2.googleapis.com/token" || h === "https://gmail.googleapis.com/gmail/v1/users/me/messages/send")],
];
let failed = 0;
const print = (s) => process.stdout.write(`${s}\n`);
for (const [name, ok] of cases) { if (!ok) failed++; print(`${ok ? "PASS" : "FAIL"}  ${name}`); }
print(`previews: .review/step2/booking-email/email-preview-{en,pt,es}.{html,txt,eml}`);
print(failed ? `${failed} FAIL` : `${cases.length}/${cases.length} PASS`);
process.exit(failed ? 1 : 0);
