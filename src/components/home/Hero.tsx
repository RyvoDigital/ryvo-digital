import Link from "next/link";
import { preload } from "react-dom";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "@/components/chrome/SiteNav";
import { BookButton } from "@/components/chrome/Icons";
import { navLinks } from "@/components/chrome/nav-links";
import { NOTCH, NOTCH_AT, NOTCH_W, notchMaskUrl, notchPath } from "@/components/chrome/notch";
import HeroVisual from "./HeroVisual";
import { HERO_SIZES, heroSrcSet } from "./hero-media";
import styles from "./Hero.module.css";

export default function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.hero;
  // The cut-out is the LCP element: fetch it first, at high priority.
  preload("/media/hero/hand-phone-b-1160.avif", {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    imageSrcSet: heroSrcSet("/media/hero/hand-phone-b", "avif"),
    imageSizes: HERO_SIZES,
  });

  const w = NOTCH_W[lang];
  const notch = { "--notch": notchMaskUrl(w), "--notch-w": `${w + 2 * NOTCH.r}px`, "--notch-h": `${NOTCH.h}px` } as CSSProperties;

  return (
    <header className={styles.wrap} data-hero data-notch-at={NOTCH_AT[lang]} style={notch}>
      <div aria-hidden="true" className={styles.spill} />

      {/* Wide desktops: the four links sit in the card's notch, on the page itself
          (narrower ones keep them inline in the card's bar, where they fit). */}
      <nav aria-label={t.nav.main} className={styles.notchNav} style={{ width: w }}>
        {navLinks(lang, t).map((l) => (
          <Link key={l.href} href={l.href} className={styles.notchLink}>{l.label}</Link>
        ))}
      </nav>
      <svg aria-hidden="true" className={styles.notchEdge} width={w + 2 * NOTCH.r} height={NOTCH.h} viewBox={`0 0 ${w + 2 * NOTCH.r} ${NOTCH.h}`}>
        <path d={notchPath(w, NOTCH.h, NOTCH.r, false)} />
      </svg>

      <div aria-hidden="true" className={styles.cardShadow} />
      <section className={styles.card} aria-labelledby="hero-title">
        <div className={styles.nav}>
          <SiteNav lang={lang} t={t} bookHref="#book" linksClassName={styles.inlineLinks} />
        </div>

        <div className={styles.headline}>
          <h1 id="hero-title" className={styles.h1}>
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 0 }}>{h.titleA}</span>{" "}
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 1 }}>
              {h.titleB} <span className="text-steel">{h.titleC}</span>
            </span>{" "}
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 2 }}>
              <span className="text-steel">{h.titleD}</span> {h.titleE}
            </span>
          </h1>
          <div className={styles.deskOnly}>
            <p className={styles.sub} data-reveal style={{ ["--i" as string]: 0 }}>{h.body}</p>
            <span className={styles.actions} data-reveal style={{ ["--i" as string]: 1 }}>
              <BookButton href="#book" label={h.primary} />
              <a href="#demo" className={styles.textLink}>{h.secondary}</a>
            </span>
          </div>
        </div>

        <div aria-hidden="true" className={styles.wordmark} data-wordmark>RYVO</div>

        <HeroVisual lang={lang} t={h} />
      </section>

      <div className={styles.panel}>
        {/* Phones: the subline and the two actions sit under the card. */}
        <div className="flex flex-col gap-4 lg:hidden">
          <p className="m-0 text-[15px] leading-[1.55] text-body" data-reveal style={{ ["--i" as string]: 0 }}>{h.body}</p>
          <span className="flex items-center gap-5" data-reveal style={{ ["--i" as string]: 1 }}>
            <BookButton href="#book" label={h.primary} className="!pl-5 text-[14px]" />
            <a href="#demo" className={styles.textLink}>{h.secondary}</a>
          </span>
        </div>
        {/* Desktop: the five automation names. */}
        <ol className="hidden grid-cols-5 gap-6 lg:grid">
          {t.automationNames.map((name, i) => (
            <li key={name} className="flex flex-col gap-2">
              <span className={`font-mono text-[11px] ${i === 0 ? "text-text" : "text-steel"}`}>0{i + 1}</span>
              <span className={`text-[15px] ${i === 0 ? "text-text" : "text-body"}`}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
