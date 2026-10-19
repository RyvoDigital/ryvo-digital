import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "./SiteNav";
import s from "./TopBar.module.css";

// The inner pages' top bar: the homepage card's bar (SiteNav), laid on the
// page's own 1392 grid instead of inside a card, so RYVO lines up with each
// page's headline as it does with the homepage's. Past the top, every page
// has the same floating pill (FloatingNav).
export default function TopBar({ lang, t, bookHref }: { lang: Locale; t: Dictionary; bookHref: string }) {
  return (
    <header className={s.top}>
      <SiteNav lang={lang} t={t} bookHref={bookHref} />
    </header>
  );
}
