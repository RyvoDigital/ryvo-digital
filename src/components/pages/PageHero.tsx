import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteNav from "@/components/chrome/SiteNav";
import NotchNav from "@/components/chrome/NotchNav";
import { navLinks } from "@/components/chrome/nav-links";
import { NOTCH, NOTCH_AT, NOTCH_W_CLOSED, NOTCH_W_OPEN } from "@/components/chrome/notch";
import hs from "@/components/home/Hero.module.css";
import s from "./Pages.module.css";

// The inner pages' opening card: the homepage hero's system (the card, one even
// tone with its hairline edge, its notch with the four links, the folding top
// row, the intro's entrances) around a headline, a subline, actions and an
// optional object on the right. Light tone for the websites side.
export default function PageHero({
  lang, t, path, label, title, dim = [], sub, actions, side, tone = "dark", compact = false,
}: {
  lang: Locale; t: Dictionary; path: string; label: string; title: string[]; dim?: number[];
  sub?: ReactNode; actions?: ReactNode; side?: ReactNode; tone?: "dark" | "light"; compact?: boolean;
}) {
  const notch = {
    "--nr": `${NOTCH.r}px`, "--nh": `${NOTCH.h}px`,
    "--W-closed": `${NOTCH_W_CLOSED}px`, "--W-open": `${NOTCH_W_OPEN[lang]}px`,
  } as CSSProperties;
  const bookHref = `/${lang}/book${path === "/websites" ? "?kind=websites" : ""}`;
  return (
    <header className={`${hs.wrap} ${s.heroWrap}`} data-hero data-notch-root data-notch-at={NOTCH_AT[lang]} data-nav-open="false" style={notch}>
      <Link href={`/${lang}`} className={hs.wrapLogo} style={{ fontStretch: "125%" }}>
        R<span className="fold"><span>YVO</span></span>
      </Link>
      <NotchNav links={navLinks(lang, t)} label={t.nav.main} />

      <section className={`${s.card} ${compact ? s.compact : ""}`} data-tone={tone} data-hero-card aria-labelledby="page-title">
        <div className={hs.nav}>
          <SiteNav lang={lang} t={t} bookHref={bookHref} linksClassName={hs.inlineLinks} fold logoClassName={hs.cardLogo} />
        </div>
        <div className={s.heroBody}>
          <div className={s.heroCopy}>
            <span className={`mono-label ${s.heroLabel}`} data-reveal style={{ ["--i" as string]: 0 }}>{label}</span>
            <h1 id="page-title" className={`display ${s.h1}`}>
              {title.map((line, i) => (
                <span key={i} className={`block ${dim.includes(i) ? s.dim : ""}`} data-reveal-line style={{ ["--i" as string]: i }}>{line}</span>
              ))}
            </h1>
            {sub && <div className={s.heroSub} data-reveal style={{ ["--i" as string]: 1 }}>{sub}</div>}
            {actions && <div className={s.heroActions} data-reveal style={{ ["--i" as string]: 2 }}>{actions}</div>}
          </div>
          {side && <div className={s.heroSide} data-reveal style={{ ["--i" as string]: 1 }}>{side}</div>}
        </div>
      </section>
    </header>
  );
}

// An object render from /media/objects, lazy unless it is above the fold.
export function ObjectArt({ name, alt = "", eager = false, className = "" }: { name: string; alt?: string; eager?: boolean; className?: string }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={`/media/objects/${name}-480.avif 480w, /media/objects/${name}-800.avif 800w`} sizes="(min-width: 1024px) 440px, 70vw" />
      <img
        src={`/media/objects/${name}-480.webp`}
        srcSet={`/media/objects/${name}-480.webp 480w, /media/objects/${name}-800.webp 800w`}
        sizes="(min-width: 1024px) 440px, 70vw"
        width={800}
        height={800}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={s.objImg}
      />
    </picture>
  );
}
