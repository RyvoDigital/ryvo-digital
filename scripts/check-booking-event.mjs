// A site booking stands out in hello@'s calendar: its title starts "Booked ·"
// and the event is Tomato (colorId 11). Runs the real createEvent
// (src/lib/booking/google.ts, transpiled in memory) with fetch stubbed, so
// nothing reaches Google: the request body it would send is checked instead.
// Exit 1 on any failure. Usage: npm run check:booking-event
import fs from "node:fs";
import ts from "typescript";

const src = (f) => fs.readFileSync(new URL(`../src/lib/booking/${f}`, import.meta.url), "utf8");
const js = (code) => ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const url = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const config = url(js(src("config.ts")));
const mock = url(js(src("mock.ts")));
const google = js(src("google.ts")).replace(/import "server-only";/, "").replace(/from "\.\/mock"/, `from "${mock}"`).replace(/from "\.\/config"/, `from "${config}"`);
const { bookedTitle } = await import(config);

// Google mode with placeholder credentials; every request is answered here.
Object.assign(process.env, { GOOGLE_OAUTH_CLIENT_ID: "x", GOOGLE_OAUTH_CLIENT_SECRET: "x", GOOGLE_OAUTH_REFRESH_TOKEN: "x", BOOKING_MOCK: "" });
const sent = [];
globalThis.fetch = async (u, init) => {
  const href = String(u);
  sent.push(href);
  if (href.startsWith("https://oauth2.googleapis.com/token")) return new Response(JSON.stringify({ access_token: "t", expires_in: 3600 }));
  if (href.includes("/calendar/v3/calendars/")) { sent.body = JSON.parse(init.body); return new Response(JSON.stringify({ id: "e1", hangoutLink: "https://meet.google.com/x" })); }
  throw new Error(`unexpected request ${href}`);
};
const { createEvent, mode } = await import(url(google));

const title = bookedTitle("automations", "Acme Imóveis");
await createEvent({ summary: title, description: "d", start: "2026-10-26T09:00:00Z", end: "2026-10-26T09:30:00Z", guest: { email: "a@b.c", name: "A" } });
const cases = [
  ["in Google mode for the test (fetch stubbed)", mode() === "google"],
  ['title: "Booked · Automations call · <agency>"', title === "Booked · Automations call · Acme Imóveis"],
  ['websites title: "Booked · Websites call · <agency>"', bookedTitle("websites", "X") === "Booked · Websites call · X"],
  ["the event sent carries that title", sent.body?.summary === title],
  ["the event is Tomato (colorId 11)", sent.body?.colorId === "11"],
  ["still with a Meet link and the guest invited", !!sent.body?.conferenceData?.createRequest && sent.body?.attendees?.[0]?.email === "a@b.c"],
  ["only Google's token and calendar endpoints were called", sent.every((h) => /^https:\/\/(oauth2|www)\.googleapis\.com\//.test(h))],
];
let failed = 0;
for (const [name, ok] of cases) { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); }
console.log(failed ? `${failed} FAIL` : `${cases.length}/${cases.length} PASS`);
process.exit(failed ? 1 : 0);
