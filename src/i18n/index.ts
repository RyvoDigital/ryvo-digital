import en from "./en";
import pt from "./pt";
import es from "./es";
import type { Locale } from "./config";

const dictionaries = { en, pt, es };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type { Dictionary, CalcToken } from "./en";
