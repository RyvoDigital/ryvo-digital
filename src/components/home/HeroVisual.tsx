"use client";

import { useMemo } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import HeroChat from "./HeroChat";
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

export default function HeroVisual({ lang, t }: { lang: Locale; t: Dictionary["hero"] }) {
  const key = useViewingKey();
  const date = useMemo(() => (key ? formatViewing(lang, nextThursday()) : weekdayOnly(lang)), [key, lang]);
  const chat = useMemo(() => ({ ...t.chat, a1: fill(t.chat.a1, date), a2: fill(t.chat.a2, date) }), [t.chat, date]);

  return (
    <>
      <div className={`${styles.art} ${styles.artBg}`} data-hero-art>
        <ArtPicture which="bg" className={styles.artImg} priority />
      </div>

      <div aria-hidden="true" className={styles.glassWord} data-text="RYVO" data-wordmark>RYVO</div>

      <div className={`${styles.art} ${styles.artHand}`} data-hero-art>
        <ArtPicture which="hand" className={styles.handImg} />
        <div className={styles.screenDesk}>
          <ScreenFit corners={ART.desk.corners as Corners} aspect={ART.desk.aspect} radius={ART.desk.radius} className="hero-chat">
            <div aria-hidden="true" className={styles.screenBg} />
            <HeroChat chat={chat} key={`d-${key ?? "ssr"}`} />
            <div aria-hidden="true" className={styles.glass} />
          </ScreenFit>
        </div>
        <div className={styles.screenMob}>
          <ScreenFit corners={ART.mob.corners as Corners} aspect={ART.mob.aspect} radius={ART.mob.radius} className="hero-chat">
            <div aria-hidden="true" className={styles.screenBg} />
            <HeroChat chat={chat} key={`m-${key ?? "ssr"}`} />
            <div aria-hidden="true" className={styles.glass} />
          </ScreenFit>
        </div>
      </div>

      <div aria-hidden="true" className={styles.shade} data-hero-shade />

      <div className={styles.chip} data-chip>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{fill(t.chipValue, date)}</span>
      </div>
    </>
  );
}
