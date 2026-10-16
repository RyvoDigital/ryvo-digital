import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

export function navLinks(lang: Locale, t: Dictionary) {
  return [
    { href: `/${lang}/automations`, label: t.nav.automations },
    { href: `/${lang}/websites`, label: t.nav.websites },
    { href: `/${lang}#how`, label: t.nav.how },
    { href: `/${lang}/about`, label: t.nav.about },
  ];
}
