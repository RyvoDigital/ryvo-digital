import Link from "next/link";
import { preload } from "react-dom";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "@/components/chrome/SiteNav";
import { BookButton } from "@/components/chrome/Icons";
import { navLinks } from "@/components/chrome/nav-links";
import { NOTCH, NOTCH_AT, NOTCH_W_CLOSED, NOTCH_W_OPEN } from "@/components/chrome/notch";
import NotchNav from "@/components/chrome/NotchNav";
import HeroVisual from "./HeroVisual";
import { ART, DESK_MEDIA, MOB_MEDIA, srcSet } from "./hero-media";
import styles from "./Hero.module.css";

export default function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.hero;
  // The hero photo is the LCP element: fetch the one for this layout first, at
  // high priority. (The silhouette layer is small and follows at normal priority.)
  for (const [a, media] of [[ART.desk, DESK_MEDIA], [ART.mob, MOB_MEDIA]] as const) {
    preload(`${a.bg}-${a.widths[1]}.avif`, {
      as: "image", type: "image/avif", fetchPriority: "high", media,
      imageSrcSet: srcSet(a, "bg", "avif"), imageSizes: a.sizes,
    });
  }

  const notch = {
    "--nr": `${NOTCH.r}px`, "--nh": `${NOTCH.h}px`,
    "--W-closed": `${NOTCH_W_CLOSED}px`, "--W-open": `${NOTCH_W_OPEN[lang]}px`,
  } as CSSProperties;

  return (
    <header className={styles.wrap} data-hero data-notch-at={NOTCH_AT[lang]} data-nav-open="false" style={notch}>
      <div aria-hidden="true" className={styles.spill} />

      {/* Wide desktops: the four links sit in the card's notch as icons that open
          into words (narrower ones keep them inline in the card's bar). */}
      {/* Where the notch shows, the logo sits out here too, before the notch in the
          page order, so the keyboard goes logo → links → languages → Book. */}
      <Link href={`/${lang}`} className={styles.wrapLogo} style={{ fontStretch: "125%" }}>
        R<span className="fold"><span>YVO</span></span>
      </Link>
      <NotchNav links={navLinks(lang, t)} label={t.nav.main} />

      <div aria-hidden="true" className={styles.cardShadow} />
      <section className={styles.card} aria-labelledby="hero-title">
        <div className={styles.nav}>
          <SiteNav lang={lang} t={t} bookHref="#book" linksClassName={styles.inlineLinks} fold logoClassName={styles.cardLogo} />
        </div>

        <div className={styles.headline}>
          <h1 id="hero-title" className={styles.h1}>
            <span className="md:block" data-reveal-line style={{ ["--i" as string]: 0 }}>{h.titleA}</span>{" "}
            <span className="md:block" data-reveal-line style={{ ["--i" as string]: 1 }}>
              {h.titleB} <span className="text-steel">{h.titleC}</span>
            </span>{" "}
            <span className="md:block" data-reveal-line style={{ ["--i" as string]: 2 }}>
              <span className="text-steel">{h.titleD}</span> {h.titleE}
            </span>
          </h1>
        </div>

        {/* Desktop: the subline and the two actions sit to the right of the phone. */}
        <div className={`${styles.deskOnly} ${styles.rightCol}`}>
          <p className={styles.sub} data-reveal style={{ ["--i" as string]: 0 }}>{h.body}</p>
          <span className={styles.actions} data-reveal style={{ ["--i" as string]: 1 }}>
            <BookButton href="#book" label={h.primary} />
            <a href="#demo" className={styles.textLink}>{h.secondary}</a>
          </span>
        </div>

        <HeroVisual lang={lang} t={h} />
      </section>

      <div className={styles.panel}>
        {/* Phones: the subline and the two actions sit under the card. */}
        <div className="flex flex-col gap-4 lg:hidden">
          <p className="m-0 text-[15px] leading-[1.55] text-body" data-reveal style={{ ["--i" as string]: 0 }}>{h.body}</p>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1" data-reveal style={{ ["--i" as string]: 1 }}>
            <BookButton href="#book" label={h.primary} className="shrink-0 whitespace-nowrap !pl-5 text-[14px]" />
            <a href="#demo" className={styles.textLink}>{h.secondary}</a>
          </span>
        </div>
        {/* Desktop: the five automation names. */}
        <ol className="mx-auto hidden w-full max-w-[1180px] grid-cols-5 gap-6 lg:grid">
          {t.automationNames.map((name, i) => (
            <li key={name} className="flex min-w-0 flex-col items-center gap-2 text-center">
              <span className={`font-mono text-[11px] ${i === 0 ? "text-text" : "text-steel"}`}>0{i + 1}</span>
              <span className={`text-[15px] ${i === 0 ? "text-text" : "text-body"}`}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
