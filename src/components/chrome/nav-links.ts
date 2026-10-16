import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { NavIconName } from "./Icons";

export function navLinks(lang: Locale, t: Dictionary): { href: string; label: string; icon: NavIconName }[] {
  return [
    { href: `/${lang}/automations`, label: t.nav.automations, icon: "spark" },
    { href: `/${lang}/websites`, label: t.nav.websites, icon: "browser" },
    { href: `/${lang}#how`, label: t.nav.how, icon: "route" },
    { href: `/${lang}/about`, label: t.nav.about, icon: "people" },
  ];
}
