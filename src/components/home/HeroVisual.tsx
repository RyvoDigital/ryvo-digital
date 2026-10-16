"use client";

import { useCallback, useState } from "react";
import type { Dictionary } from "@/i18n";
import HeroChat from "./HeroChat";
import styles from "./Hero.module.css";

// The hand + phone cut-out (Kie.ai, GPT Image 2.5, background removed) with the
// chat placed exactly on the measured screen: centre (76.65%, 41.85%) of the
// image, 33.26% × 82.29% of it, rotated 6.9°. The same geometry serves the video
// later, because its camera is locked off.
export default function HeroVisual({ t }: { t: Dictionary["hero"] }) {
  const [booked, setBooked] = useState(false);
  const onBooked = useCallback(() => setBooked(true), []);

  return (
    <>
      <div className={styles.visual} data-hero-visual>
        <picture>
          <source type="image/avif" srcSet="/media/hero/hand-phone-760.avif 760w, /media/hero/hand-phone-1160.avif 1160w, /media/hero/hand-phone-1640.avif 1640w" sizes="(min-width: 1024px) 840px, (min-width: 768px) 720px, 560px" />
          <img
            src="/media/hero/hand-phone-1160.webp"
            srcSet="/media/hero/hand-phone-760.webp 760w, /media/hero/hand-phone-1160.webp 1160w, /media/hero/hand-phone-1640.webp 1640w"
            sizes="(min-width: 1024px) 840px, (min-width: 768px) 720px, 560px"
            width={2210}
            height={2072}
            alt=""
            fetchPriority="high"
            decoding="async"
            className={styles.image}
          />
        </picture>
        <div aria-hidden="true" className={styles.sweep} />
        <div className={`${styles.screen} hero-chat`}>
          <HeroChat chat={t.chat} onBooked={onBooked} />
          <div aria-hidden="true" className={styles.glass} />
        </div>
      </div>

      <div className={styles.chip} data-on={booked} aria-hidden={!booked}>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-silver md:text-[10px]">{t.chipLabel}</span>
        <span className="text-[12px] font-medium md:text-[15px]">{t.chipValue}</span>
      </div>
    </>
  );
}
