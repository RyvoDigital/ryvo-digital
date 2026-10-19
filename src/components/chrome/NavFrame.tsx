import Link from "next/link";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "./SiteNav";
import NotchNav from "./NotchNav";
import { navLinks } from "./nav-links";
import { NOTCH, NOTCH_AT, NOTCH_W_CLOSED, NOTCH_W_OPEN } from "./notch";
import CardTop from "./CardTop";
import hs from "@/components/home/Hero.module.css";
import s from "./NavFrame.module.css";

// The homepage's navbar on the inner pages: the hero card's top edge (CardTop,
// built from the homepage card itself) with its notch and the four links in it,
// RYVO, the languages and Book where the card's bar puts them, folding the
// same way when the notch opens. The edge fades into the page under the bar,
// so each page's own hero carries on below it. Light tone for the websites
// side. Laid over the page, so nothing below it moves.
export default function NavFrame({ lang, t, bookHref, tone = "dark" }: { lang: Locale; t: Dictionary; bookHref: string; tone?: "dark" | "light" }) {
  const notch = {
    "--nr": `${NOTCH.r}px`, "--nh": `${NOTCH.h}px`,
    "--W-closed": `${NOTCH_W_CLOSED}px`, "--W-open": `${NOTCH_W_OPEN[lang]}px`,
  } as CSSProperties;
  return (
    <header className={`${hs.wrap} ${s.frame}`} data-notch-root data-notch-at={NOTCH_AT[lang]} data-nav-open="false" style={notch}>
      <Link href={`/${lang}`} className={hs.wrapLogo} style={{ fontStretch: "125%" }}>
        R<span className="fold"><span>YVO</span></span>
      </Link>
      <NotchNav links={navLinks(lang, t)} label={t.nav.main} />
      <CardTop tone={tone}>
        <div className={hs.nav}>
          <SiteNav lang={lang} t={t} bookHref={bookHref} linksClassName={hs.inlineLinks} fold logoClassName={hs.cardLogo} />
        </div>
      </CardTop>
    </header>
  );
}
