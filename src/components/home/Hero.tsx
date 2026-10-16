import { preload } from "react-dom";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "@/components/chrome/SiteNav";
import { BookButton } from "@/components/chrome/Icons";
import Ruler from "./Ruler";
import HeroVisual from "./HeroVisual";
import { HERO_SIZES, heroSrcSet } from "./hero-media";
import HeroReveal from "./HeroReveal";
import styles from "./Hero.module.css";

export default function Hero({ lang, t }: { lang: Locale; t: Dictionary }) {
  const h = t.hero;
  // The cut-out is the LCP element: fetch it first, at high priority.
  preload("/media/hero/hand-phone-1160.avif", {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    imageSrcSet: heroSrcSet("/media/hero/hand-phone", "avif"),
    imageSizes: HERO_SIZES,
  });
  return (
    <header className={styles.wrap} data-hero>
      <div aria-hidden="true" className={styles.spill} />
      <Ruler t={t} />

      <section className={styles.card} aria-labelledby="hero-title">
        <div className={styles.nav}>
          <SiteNav lang={lang} t={t} bookHref="#book" />
        </div>

        <div className={styles.headline}>
          <span className="mono-label" data-reveal style={{ ["--i" as string]: 0 }}>
            {h.eyebrow[0]}
            <br className="hidden md:block" />
            <span className="md:hidden"> </span>
            {h.eyebrow[1]}
          </span>
          <h1 id="hero-title" className={styles.h1}>
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 0 }}>{h.titleA}</span>{" "}
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 1 }}>
              {h.titleB} <span className="text-steel">{h.titleC}</span>
            </span>{" "}
            <span className="md:block md:whitespace-nowrap" data-reveal-line style={{ ["--i" as string]: 2 }}>
              <span className="text-steel">{h.titleD}</span> {h.titleE}
            </span>
          </h1>
        </div>

        <div className={styles.aside}>
          <p className="m-0 text-[16px] leading-[1.6] text-body" data-reveal style={{ ["--i" as string]: 1 }}>{h.body}</p>
          <span className="flex flex-wrap gap-[10px]" data-reveal style={{ ["--i" as string]: 2 }}>
            <BookButton href="#book" label={h.primary} />
            <a href="#demo" className="btn-ghost">{h.secondary}</a>
          </span>
        </div>

        <div aria-hidden="true" className={styles.wordmark} data-wordmark>RYVO</div>

        <HeroVisual lang={lang} t={h} />

        <span className={styles.corner} style={{ left: 44 }}>
          {h.cities[0]}
          <br />
          {h.cities[1]}
        </span>
        <span className={styles.corner} style={{ right: 44, textAlign: "right" }}>
          {h.repliesIn}
          <br />
          <span className="text-text">PT · EN · ES · FR · DE</span>
        </span>
      </section>

      <div className={styles.panel}>
        {/* Mobile: the buttons live here (homepage-v2-mobile). */}
        <div className="flex flex-col gap-3 lg:hidden">
          <BookButton href="#book" label={h.primary} className="w-full !pl-5 text-[14px]" />
          <a href="#demo" className="btn-ghost w-full text-[15px]">{h.secondary}</a>
          <span className="pt-2 text-center font-mono text-[9.5px] tracking-[0.12em] text-steel">
            {h.repliesIn} <span className="text-text">PT · EN · ES · FR · DE</span>
          </span>
        </div>
        {/* Desktop: the five automation names. */}
        <ol className="hidden grid-cols-5 gap-6 lg:grid">
          {t.automationNames.map((name, i) => (
            <li key={name} className="flex flex-col gap-2" data-reveal style={{ ["--i" as string]: 3 + i }}>
              <span className={`font-mono text-[11px] ${i === 0 ? "text-text" : "text-steel"}`}>0{i + 1}</span>
              <span className={`text-[15px] ${i === 0 ? "text-text" : "text-body"}`}>{name}</span>
            </li>
          ))}
        </ol>
      </div>
      <HeroReveal />
    </header>
  );
}
