import { getDictionary } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { getPages } from "@/i18n/pages";
import { LABELS } from "./labels";
import type { Force } from "./useBooking";

const FORCES = ["loading", "error", "empty", "form", "done"];

// The lab pages' query: language, the preselected call, and a pinned state.
export function labBookProps(q: Record<string, string | undefined>) {
  const lang: Locale = q.lang && isLocale(q.lang) ? q.lang : "en";
  return {
    lang,
    t: getDictionary(lang),
    p: getPages(lang).book,
    L: LABELS[lang],
    initial: (q.kind === "websites" ? 1 : 0) as 0 | 1,
    force: (FORCES.includes(q.state ?? "") ? q.state : null) as Force,
  };
}
