// The booking rules hold: starts every 15 minutes inside the confirmed hours,
// a 15-minute break kept either side of a busy time. Runs the real
// src/lib/booking/{config,slots}.ts (transpiled in memory). Exit 1 on any
// failure. Usage: npm run check:booking-slots
import fs from "node:fs";
import ts from "typescript";

const js = (f) => ts.transpileModule(fs.readFileSync(new URL(`../src/lib/booking/${f}`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const url = (code) => `data:text/javascript,${encodeURIComponent(code)}`;
const config = url(js("config.ts"));
const { availableSlots, zonedToUtc } = await import(url(js("slots.ts").replace(/from "\.\/config"/, `from "${config}"`)));

const Z = "Europe/Madrid";
const at = (d, hh, mm) => zonedToUtc(Z, 2026, 10, d, hh, mm).toISOString(); // October 2026, Madrid wall time
const now = new Date("2026-10-21T08:00:00Z"); // Wed 21 Oct; Mon 26 Oct is in the horizon, past the notice
const busy = [{ start: at(26, 10, 0), end: at(26, 10, 30) }]; // Mon 26 Oct, 10:00–10:30
const auto = new Set(availableSlots("automations", busy, now));
const web = new Set(availableSlots("websites", [], now));
const day = (set, d) => [...set].filter((iso) => iso.startsWith(at(d, 12, 0).slice(0, 10))).sort();

const cases = [
  ["after a 10:00–10:30 call, 10:45 is the next start", auto.has(at(26, 10, 45))],
  ["…and 10:30 is not (the break)", !auto.has(at(26, 10, 30))],
  ["09:15 is the latest start before it", auto.has(at(26, 9, 15)) && !auto.has(at(26, 9, 30))],
  ["starts every 15 minutes (09:00, 09:15 free on a clear morning)", web.has(at(26, 9, 0)) && web.has(at(26, 9, 15))],
  ["weekday windows: first 09:00, last 13:30, then 19:00 to 22:30", (() => { const d = day(web, 26); return d[0] === at(26, 9, 0) && d.includes(at(26, 13, 30)) && !d.includes(at(26, 13, 45)) && d.includes(at(26, 19, 0)) && d.at(-1) === at(26, 22, 30); })()],
  ["weekday: nothing between 14:00 and 19:00", !web.has(at(26, 14, 0)) && !web.has(at(26, 18, 45))],
  ["Saturday automations: 10:30 to a last start of 16:30", auto.has(at(24, 10, 30)) && auto.has(at(24, 16, 30)) && !auto.has(at(24, 16, 45)) && !auto.has(at(24, 10, 15))],
  ["Saturday: no websites calls", day(web, 24).length === 0],
  ["Sunday: no calls", day(auto, 25).length === 0 && day(web, 25).length === 0],
  ["a clear weekday has 34 starts (19 in the morning, 15 in the evening)", day(web, 26).length === 19 + 15],
];
let failed = 0;
for (const [name, ok] of cases) { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); }
console.log(failed ? `${failed} FAIL` : `${cases.length}/${cases.length} PASS`);
process.exit(failed ? 1 : 0);
