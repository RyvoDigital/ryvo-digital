import type { Locale } from "@/i18n/config";

const NBSP = " ";

// EN 12,000 · 2.5 · €3,024 — PT/ES 12 000 · 2,5 · 3 024 € (non-breaking spaces,
// so a figure never splits across lines).
export function group(n: number, lang: Locale) {
  const [int, dec] = String(Math.round(n * 100) / 100).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : NBSP);
  return dec ? `${grouped}${lang === "en" ? "." : ","}${dec}` : grouped;
}

export function euros(n: number, lang: Locale) {
  const v = group(Math.round(n), lang);
  return lang === "en" ? `€${v}` : `${v}${NBSP}€`;
}

// Reads what a visitor types the way their language writes numbers.
export function readNumber(raw: string, lang: Locale) {
  let v = raw.replace(/[\s  ]/g, "");
  v = lang === "en" ? v.replace(/,/g, "") : v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
