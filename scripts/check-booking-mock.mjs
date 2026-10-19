// BOOKING_MOCK must never be honoured in production: runs the real guard
// (src/lib/booking/mock.ts, transpiled in memory) against every environment
// the site runs in. Exit 1 on any failure. Usage: npm run check:booking-mock
import fs from "node:fs";
import ts from "typescript";

const src = fs.readFileSync(new URL("../src/lib/booking/mock.ts", import.meta.url), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { mockAllowed } = await import(`data:text/javascript,${encodeURIComponent(js)}`);

const cases = [
  ["development, BOOKING_MOCK=1", { NODE_ENV: "development", BOOKING_MOCK: "1" }, true],
  ["development, unset", { NODE_ENV: "development" }, false],
  ["Vercel preview, BOOKING_MOCK=1", { NODE_ENV: "production", VERCEL_ENV: "preview", BOOKING_MOCK: "1" }, true],
  ["Vercel production, BOOKING_MOCK=1", { NODE_ENV: "production", VERCEL_ENV: "production", BOOKING_MOCK: "1" }, false],
  ["Vercel production, NODE_ENV not production", { NODE_ENV: "development", VERCEL_ENV: "production", BOOKING_MOCK: "1" }, false],
  ["self-hosted next start, BOOKING_MOCK=1", { NODE_ENV: "production", BOOKING_MOCK: "1" }, false],
  ["BOOKING_MOCK=true (only 1 counts)", { NODE_ENV: "development", BOOKING_MOCK: "true" }, false],
];
let failed = 0;
for (const [name, env, want] of cases) {
  const got = mockAllowed(env);
  if (got !== want) failed++;
  console.log(`${got === want ? "PASS" : "FAIL"}  ${name}  (mock ${got ? "on" : "off"})`);
}
console.log(failed ? `${failed} FAIL` : `${cases.length}/${cases.length} PASS`);
process.exit(failed ? 1 : 0);
