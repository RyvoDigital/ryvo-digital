"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import HeroChat from "./HeroChat";
import ScreenFit, { type Corners } from "@/components/chrome/ScreenFit";
import { HERO_SIZES, heroSrcSet } from "./hero-media";
import styles from "./Hero.module.css";

// Kie.ai hand + phone cut-outs (background removed). Each carries the four true
// corners of its screen (edge-fitted, % of the image), its height ÷ width and its
// corner radius, so the chat takes the photo's own perspective and stays inside
// the glass. B is the chosen still (16 Oct); A stays available at ?still=a.
// cx is the screen centre's x, used to centre the phone in the card.
const STILLS = {
  b: {
    base: "/media/hero/hand-phone-b", ar: "2049 / 1883", w: 2049, h: 1883, cx: "76.8%", scale: 1.047, dim: 0.5,
    corners: { TL: [68.03, -0.03], TR: [96.32, 2.84], BR: [86.37, 80.49], BL: [56.53, 79.8] }, aspect: 2.17, radius: 0.13,
  },
  a: {
    base: "/media/hero/hand-phone", ar: "2210 / 2072", w: 2210, h: 2072, cx: "76.5%", scale: 1, dim: 0,
    corners: { TL: [63.97, -0.2], TR: [97.21, 4.12], BR: [90.56, 84.24], BL: [54.21, 79.61] }, aspect: 2.15, radius: 0.15,
  },
} satisfies Record<string, { corners: Corners } & Record<string, unknown>>;

const noop = () => () => {};
const useStill = () =>
  useSyncExternalStore(noop, () => (new URLSearchParams(location.search).get("still") === "a" ? "a" : "b"), () => "b" as const);

export default function HeroVisual({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const [loaded, setLoaded] = useState(false); // the light sweep waits for the page's load
  useEffect(() => {
    const go = () => setLoaded(true);
    if (document.readyState === "complete") { const id = window.setTimeout(go, 0); return () => clearTimeout(id); }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  const still = STILLS[useStill()];
  const key = useViewingKey();

  const date = useMemo(() => (key ? formatViewing(lang, nextThursday()) : weekdayOnly(lang)), [key, lang]);
  const chat = useMemo(() => ({ ...t.chat, a1: fill(t.chat.a1, date), a2: fill(t.chat.a2, date) }), [t.chat, date]);

  const vars = {
    "--img-ar": still.ar, "--cx": still.cx, "--vis-scale": still.scale, "--dim": still.dim, ...(loaded ? { "--mask": `url(${still.base}-760.avif)` } : {}),
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
            width={still.w}
            height={still.h}
            alt=""
            fetchPriority="high"
            className={styles.image}
          />
        </picture>
        {loaded && <div aria-hidden="true" className={styles.sweep} />}
        <ScreenFit corners={still.corners as Corners} aspect={still.aspect} radius={still.radius} className="hero-chat">
          <div aria-hidden="true" className={styles.dim} />
          <HeroChat chat={chat} key={key ?? "ssr"} />
          <div aria-hidden="true" className={styles.glass} />
        </ScreenFit>
      </div>

      <div className={styles.chip} data-chip>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{fill(t.chipValue, date)}</span>
      </div>
    </>
  );
}
