"use client";

import { useCallback, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import HeroChat from "./HeroChat";
import { HERO_SIZES, heroSrcSet } from "./hero-media";
import styles from "./Hero.module.css";

// Kie.ai hand + phone cut-outs (background removed). Each carries its measured
// screen: centre, size (as % of the image) and rotation, so the chat sits exactly
// on the glass. A is the approved still; B (?still=b) is kept for comparison, its
// lighter screen darkened in code to match A's contrast.
const STILLS = {
  a: { base: "/media/hero/hand-phone", ar: "2210 / 2072", cx: "76.65%", cy: "41.85%", sw: "33.26%", sh: "82.29%", rot: "6.9deg", scale: 1, dim: 0 },
  b: { base: "/media/hero/hand-phone-b", ar: "2049 / 1883", cx: "77.0%", cy: "40.5%", sw: "29.3%", sh: "78.6%", rot: "5.4deg", scale: 1.047, dim: 0.55 },
} as const;

const noop = () => () => {};
const useStill = () =>
  useSyncExternalStore(noop, () => (new URLSearchParams(location.search).get("still") === "b" ? "b" : "a"), () => "a" as const);

export default function HeroVisual({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const [booked, setBooked] = useState(false);
  const onBooked = useCallback(() => setBooked(true), []);
  const still = STILLS[useStill()];
  const key = useViewingKey();

  const date = useMemo(() => (key ? formatViewing(lang, nextThursday()) : weekdayOnly(lang)), [key, lang]);
  const chat = useMemo(() => ({ ...t.chat, a1: fill(t.chat.a1, date), a2: fill(t.chat.a2, date) }), [t.chat, date]);

  const vars = {
    "--img-ar": still.ar, "--cx": still.cx, "--cy": still.cy, "--sw": still.sw, "--sh": still.sh,
    "--rot": still.rot, "--vis-scale": still.scale, "--dim": still.dim, "--mask": `url(${still.base}-760.avif)`,
  } as CSSProperties;

  return (
    <>
      <div className={styles.visual} style={vars} data-hero-visual>
        <picture>
          <source type="image/avif" srcSet={heroSrcSet(still.base, "avif")} sizes={HERO_SIZES} />
          <img
            src={`${still.base}-1160.webp`}
            srcSet={heroSrcSet(still.base, "webp")}
            sizes={HERO_SIZES}
            width={2210}
            height={2072}
            alt=""
            fetchPriority="high"
            className={styles.image}
          />
        </picture>
        <div aria-hidden="true" className={styles.sweep} />
        <div className={`${styles.screen} hero-chat`}>
          <div aria-hidden="true" className={styles.dim} />
          <HeroChat chat={chat} onBooked={onBooked} key={key ?? "ssr"} />
          <div aria-hidden="true" className={styles.glass} />
        </div>
      </div>

      <div className={styles.chip} data-on={booked} aria-hidden={!booked}>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{fill(t.chipValue, date)}</span>
      </div>
    </>
  );
}
