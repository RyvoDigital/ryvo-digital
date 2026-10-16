"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import PhoneStory, { HandCard } from "./PhoneStory";
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

// RYVO in liquid glass, sitting on the card's bottom edge: solid, thick glass,
// not an outline. One SVG: each letter is a clip of a blurred copy of the photo
// (placed on the photo's art box), under a soft milky tint; a specular highlight
// lit from above runs along the top edges, an inner shadow darkens the bottom
// inside edge for thickness, and a fine luminous rim draws the shape. Chromium
// also bends the light through the letters (an SVG displacement from the
// letters' own bevel, with a slight colour split at the rims); Safari and
// Firefox keep the blur, tint and highlights. The silhouette layer above keeps
// the hand in front. (Fixed ids: there is one wordmark on the page.)
function GlassWordmark() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    // Chromium only, and after the first paint, so the photo stays the LCP.
    const ua = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData;
    if (!ua?.brands.some((b) => b.brand === "Chromium")) return;
    const id = requestAnimationFrame(() => svg.current?.setAttribute("data-refract", ""));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <svg ref={svg} aria-hidden="true" className={styles.glassWord} data-wordmark>
      <defs>
        <text id="ryvo-t" x="50%" y="100%" dy="0.06em" textAnchor="middle" className={styles.glassText}>RYVO</text>
        <clipPath id="ryvo-clip"><use href="#ryvo-t" /></clipPath>
        <linearGradient id="ryvo-edge" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="ryvo-milk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#f4f6fa" stopOpacity="0.16" />
          <stop offset="0.8" stopColor="#e9ecf2" stopOpacity="0.09" />
          <stop offset="1" stopColor="#dfe3ea" stopOpacity="0.05" />
        </linearGradient>
        {/* Chromium: the light refracted through the body. The letters' alpha,
            blurred, is a bevel; its slope (x → red, y → green, 0.5 = flat) drives
            the displacement, twice, a little apart, for red and for green-blue. */}
        <filter id="ryvo-refract" filterUnits="userSpaceOnUse" x="0" y="38%" width="100%" height="62%" colorInterpolationFilters="sRGB">
          <feImage href="#ryvo-t" result="shape" />
          <feGaussianBlur in="shape" stdDeviation="16" result="b" />
          <feOffset in="b" dx="-3" result="l" /><feOffset in="b" dx="3" result="r" />
          <feOffset in="b" dy="-3" result="u" /><feOffset in="b" dy="3" result="d" />
          <feComposite in="l" in2="r" operator="arithmetic" k2="1" k3="-1" result="lr" />
          <feComposite in="r" in2="l" operator="arithmetic" k2="1" k3="-1" result="rl" />
          <feComposite in="u" in2="d" operator="arithmetic" k2="1" k3="-1" result="ud" />
          <feComposite in="d" in2="u" operator="arithmetic" k2="1" k3="-1" result="du" />
          <feComposite in="lr" in2="rl" operator="arithmetic" k2="2.6" k3="-2.6" k4="0.5" result="gx" />
          <feComposite in="ud" in2="du" operator="arithmetic" k2="2.6" k3="-2.6" k4="0.5" result="gy" />
          <feColorMatrix in="gx" values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="mx" />
          <feColorMatrix in="gy" values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1" result="my" />
          <feComposite in="mx" in2="my" operator="arithmetic" k2="1" k3="1" result="map" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feComponentTransfer in="blur" result="soft"><feFuncR type="linear" slope="1.3" intercept="0.05" /><feFuncG type="linear" slope="1.3" intercept="0.05" /><feFuncB type="linear" slope="1.3" intercept="0.06" /></feComponentTransfer>
          <feDisplacementMap in="soft" in2="map" scale="110" xChannelSelector="R" yChannelSelector="G" result="d1" />
          <feDisplacementMap in="soft" in2="map" scale="124" xChannelSelector="R" yChannelSelector="G" result="d2" />
          <feColorMatrix in="d1" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feColorMatrix in="d2" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
          <feComposite in="red" in2="gb" operator="arithmetic" k2="1" k3="1" />
        </filter>
        {/* Every engine: the specular highlight, lit from above, on the top edges. */}
        <filter id="ryvo-spec" x="-4%" y="-8%" width="108%" height="116%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="bump" />
          <feSpecularLighting in="bump" surfaceScale="7" specularConstant="1.25" specularExponent="26" lightingColor="#fff" result="spec">
            <feDistantLight azimuth="265" elevation="38" />
          </feSpecularLighting>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="bump2" />
          <feSpecularLighting in="bump2" surfaceScale="4" specularConstant="1.4" specularExponent="60" lightingColor="#fff" result="gleam">
            <feDistantLight azimuth="250" elevation="30" />
          </feSpecularLighting>
          <feComposite in="spec" in2="gleam" operator="arithmetic" k2="1" k3="0.9" result="both" />
          <feComposite in="both" in2="SourceAlpha" operator="in" />
        </filter>
        {/* The bottom inside edge, darker: the glass's thickness. */}
        <filter id="ryvo-inner" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b" />
          <feOffset in="b" dx="-4" dy="-14" result="o" />
          <feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
          <feFlood floodColor="#000" floodOpacity="0.55" />
          <feComposite in2="band" operator="in" />
        </filter>
        {/* Safari and Firefox: the same photo, blurred (~30 px) and lifted, unbent. */}
        <filter id="ryvo-blur" filterUnits="userSpaceOnUse" x="0" y="38%" width="100%" height="62%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="10" />
          <feComponentTransfer><feFuncR type="linear" slope="1.3" intercept="0.05" /><feFuncG type="linear" slope="1.3" intercept="0.05" /><feFuncB type="linear" slope="1.3" intercept="0.06" /></feComponentTransfer>
        </filter>
        <filter id="ryvo-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <g clipPath="url(#ryvo-clip)">
        <image href="/media/hero/hero7-bg-1440.avif" preserveAspectRatio="none" className={`${styles.glassImg} ${styles.glassDesk}`} />
        <image href="/media/hero/hero7-bg-m-600.avif" preserveAspectRatio="none" className={`${styles.glassImg} ${styles.glassMob}`} />
        <rect width="100%" height="100%" fill="url(#ryvo-milk)" />
        {/* a soft light band just inside every edge */}
        <use href="#ryvo-t" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="10" filter="url(#ryvo-soft)" />
      </g>
      <use href="#ryvo-t" fill="#000" filter="url(#ryvo-inner)" />
      <use href="#ryvo-t" fill="#fff" filter="url(#ryvo-spec)" className={styles.glassSpec} />
      <use href="#ryvo-t" fill="none" stroke="url(#ryvo-edge)" strokeWidth="1.25" />
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
      {/* The deep dark at the bottom the letters rise out of (under the hand). */}
      <div aria-hidden="true" className={styles.deep} />

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
        <HandCard story={t.story} />
      </div>

      <div className={styles.chip} data-chip>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{fill(t.chipValue, date)}</span>
      </div>
    </>
  );
}
