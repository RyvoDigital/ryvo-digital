"use client";

import { useId, useMemo } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import PhoneStory from "./PhoneStory";
import ScreenFit, { type Corners } from "@/components/chrome/ScreenFit";
import { ART, DESK_MEDIA, srcSet } from "./hero-media";
import styles from "./Hero.module.css";

// The hero is one photograph: a backlit hand and phone in front of a mercury
// glow, full-bleed in the card. The glass RYVO sits between the photo and a
// silhouette layer cut from it, so the letters pass behind the hand. All layers
// share one "art box" (the photo's cover rectangle, in container units), so the
// silhouette and the chat line up with the photo at every size.
function ArtPicture({ which, className, priority }: { which: "bg" | "hand"; className: string; priority?: boolean }) {
  const d = ART.desk, m = ART.mob;
  const sizes = (a: typeof d) => (which === "bg" ? a.sizes : a.handSizes);
  const w = which === "bg" ? m.w : m.handW, h = which === "bg" ? m.h : m.handH;
  return (
    <picture>
      <source media={DESK_MEDIA} type="image/avif" srcSet={srcSet(d, which, "avif")} sizes={sizes(d)} />
      <source media={DESK_MEDIA} type="image/webp" srcSet={srcSet(d, which, "webp")} sizes={sizes(d)} />
      <source type="image/avif" srcSet={srcSet(m, which, "avif")} sizes={sizes(m)} />
      <img
        src={`${m[which]}-${which === "bg" ? 900 : 640}.webp`}
        srcSet={srcSet(m, which, "webp")}
        sizes={sizes(m)}
        width={w}
        height={h}
        alt=""
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  );
}

// RYVO in liquid glass, sitting on the card's bottom edge. One SVG: each
// letter is a clip of a blurred, brightened copy of the photo (aligned to it),
// a soft white tint, a highlight from above, an inner shadow toward the bottom
// right and a luminous edge, brighter at the top left. Every letter is one
// consistent glass shape. If the texture is missing, the tint and the edge still
// draw the letters. The silhouette layer above keeps the hand in front.
function GlassWordmark() {
  const id = useId().replace(/:/g, "");
  const t = `${id}-t`;
  return (
    <svg aria-hidden="true" className={styles.glassWord} data-wordmark>
      <defs>
        <text id={t} x="50%" y="100%" dy="0.06em" textAnchor="middle" className={styles.glassText}>RYVO</text>
        <clipPath id={`${id}-clip`}><use href={`#${t}`} /></clipPath>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0.32" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id={`${id}-inner`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b" />
          <feOffset in="b" dx="-7" dy="-9" result="o" />
          <feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
          <feFlood floodColor="#000" floodOpacity="0.4" />
          <feComposite in2="band" operator="in" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <image href="/media/hero/hero7-glass-1400.webp" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className={styles.glassDesk} />
        <image href="/media/hero/hero7-glass-m-700.webp" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className={styles.glassMob} />
        <rect width="100%" height="100%" fill="#fff" opacity="0.05" />
        <use href={`#${t}`} fill={`url(#${id}-sheen)`} />
        {/* The glass's thickness: a soft light band just inside every edge. */}
        <use href={`#${t}`} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="8" filter={`url(#${id}-soft)`} />
      </g>
      <use href={`#${t}`} fill="#000" filter={`url(#${id}-inner)`} />
      <use href={`#${t}`} fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.5" />
    </svg>
  );
}

export default function HeroVisual({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const key = useViewingKey();
  const date = useMemo(() => (key ? formatViewing(lang, nextThursday()) : weekdayOnly(lang)), [key, lang]);
  const chat = useMemo(() => ({ ...t.chat, a1: fill(t.chat.a1, date), a2: fill(t.chat.a2, date) }), [t.chat, date]);

  return (
    <>
      <div className={`${styles.art} ${styles.artBg}`} data-hero-art>
        <ArtPicture which="bg" className={styles.artImg} priority />
      </div>

      <GlassWordmark />

      <div className={`${styles.art} ${styles.artHand}`} data-hero-art>
        <ArtPicture which="hand" className={styles.handImg} />
        <div className={styles.screenDesk}>
          <ScreenFit corners={ART.desk.corners as Corners} aspect={ART.desk.aspect} radius={ART.desk.radius} className="hero-chat">
            <PhoneStory chat={chat} story={t.story} langCode={lang.toUpperCase() as "PT" | "EN" | "ES"} slotShort={date.short} key={`d-${key ?? "ssr"}`} />
            <div aria-hidden="true" className={styles.glass} />
          </ScreenFit>
        </div>
        <div className={styles.screenMob}>
          <ScreenFit corners={ART.mob.corners as Corners} aspect={ART.mob.aspect} radius={ART.mob.radius} className="hero-chat">
            <PhoneStory chat={chat} story={t.story} langCode={lang.toUpperCase() as "PT" | "EN" | "ES"} slotShort={date.short} key={`m-${key ?? "ssr"}`} />
            <div aria-hidden="true" className={styles.glass} />
          </ScreenFit>
        </div>
      </div>

      <div aria-hidden="true" className={styles.scrim} />
      <div aria-hidden="true" className={styles.shade} data-hero-shade />

      {/* The handover card's flight out of the phone to the chip (PhoneStory). */}
      <div aria-hidden="true" className={styles.fly} data-fly>
        <span className={styles.flyT}>{t.story.handover}</span>
        {t.story.rows.slice(0, 2).map(([k, v]) => <span key={k} className={styles.flyRow}><span>{k}</span><b>{v}</b></span>)}
      </div>

      <div className={styles.chip} data-chip>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{fill(t.chipValue, date)}</span>
      </div>
    </>
  );
}
