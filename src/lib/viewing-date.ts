import { useSyncExternalStore } from "react";
import { INTL_LOCALE, type Locale } from "@/i18n/config";

// The simulated viewing is always on the next Thursday at least two days ahead,
// computed in the visitor's browser so the example never shows a past date.
export function nextThursday(now = new Date()) {
  let ahead = (4 - now.getDay() + 7) % 7;
  if (ahead < 2) ahead += 7;
  const d = new Date(now);
  d.setDate(now.getDate() + ahead);
  return d;
}

const monthName = (lang: Locale, d: Date, month: "long" | "short") =>
  new Intl.DateTimeFormat(INTL_LOCALE[lang], { month }).format(d).replace(/\.$/, "");

export type ViewingDate = { long: string; Long: string; short: string };

// EN "Thursday 23 October" / "Thu 23 Oct"; PT "quinta-feira, 23 de outubro" /
// "qui, 23 out"; ES "jueves 23 de octubre" / "jue, 23 oct".
export function formatViewing(lang: Locale, d: Date): ViewingDate {
  const day = d.getDate();
  const long =
    lang === "en" ? `Thursday ${day} ${monthName(lang, d, "long")}`
    : lang === "pt" ? `quinta-feira, ${day} de ${monthName(lang, d, "long")}`
    : `jueves ${day} de ${monthName(lang, d, "long")}`;
  const short =
    lang === "en" ? `Thu ${day} ${monthName(lang, d, "short")}`
    : lang === "pt" ? `qui, ${day} ${monthName(lang, d, "short")}`
    : `jue, ${day} ${monthName(lang, d, "short")}`;
  return { long, Long: long.charAt(0).toUpperCase() + long.slice(1), short };
}

// Before hydration (and without JS) the copy names only the weekday.
export function weekdayOnly(lang: Locale): ViewingDate {
  const long = lang === "en" ? "Thursday" : lang === "pt" ? "quinta-feira" : "jueves";
  const short = lang === "en" ? "Thu" : lang === "pt" ? "qui" : "jue";
  return { long, Long: long.charAt(0).toUpperCase() + long.slice(1), short };
}

const noop = () => () => {};

/** A stable per-day key on the client, null on the server. */
export function useViewingKey() {
  return useSyncExternalStore(
    noop,
    () => nextThursday().toDateString(),
    () => null,
  );
}

export function fill(template: string, date: ViewingDate) {
  return template.replaceAll("{Long}", date.Long).replaceAll("{long}", date.long).replaceAll("{short}", date.short);
}
