"use client";

import { useEffect, useRef, useState } from "react";
import { isReduced } from "./motion";
import f from "./brandfilm.module.css";

// The brand film (video/, Remotion): what Ryvo builds, 35 s, silent, looping,
// playing on a MacBook. The device is a Kie render whose screen is a
// transparent hole, so the film plays behind it and the notch and bezels sit on
// top exactly. Muted and inline; it plays only while in view and pauses
// off-screen. Under reduced motion it shows the poster with a small play button.
const M = "/media/lab/automations";
// The screen hole, in % of the 3,804 × 2,564 render (KIE-LOG.md).
const SCREEN = { left: 12.329, top: 7.137, width: 75.342, height: 70.437 };
const IMG = { w: 3804, h: 2564 };

export default function BrandFilm({ label }: { label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current, el = wrap.current;
    if (!v || !el) return;
    const r = isReduced();
    // Known only on the client; set once after mount.
    queueMicrotask(() => setReduced(r));
    if (r) return;
    let inView = false;
    const sync = () => { if (inView && !document.hidden) v.play().catch(() => {}); else v.pause(); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.25 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  const playOnce = () => { const v = video.current; if (!v) return; if (v.paused) { v.play().catch(() => {}); setPlaying(true); } else { v.pause(); setPlaying(false); } };

  return (
    <section className={f.section} aria-labelledby="film-label" data-film-section>
      <span className="mono-label" id="film-label" data-reveal>{label}</span>
      <div ref={wrap} className={f.device} data-device style={{ aspectRatio: `${IMG.w} / ${IMG.h}` }}>
        <div className={f.screen} style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }}>
          <video
            ref={video}
            className={f.video}
            muted
            loop
            playsInline
            preload="metadata"
            poster={`${M}/brand-film-poster-v3-1920.webp`}
            aria-label="A short silent film about what Ryvo builds: five automations, from the first contact until after the deed"
          >
            <source src={`${M}/brand-film-v3.webm`} type="video/webm" />
            <source src={`${M}/brand-film-v3.mp4`} type="video/mp4" />
          </video>
          <span className={f.glass} aria-hidden="true" />
        </div>
        <picture>
          <source type="image/avif" srcSet={`${M}/macbook-v1-800.avif 800w, ${M}/macbook-v1-1400.avif 1400w, ${M}/macbook-v1-2000.avif 2000w`} sizes="(min-width: 1024px) 1100px, 100vw" />
          <img src={`${M}/macbook-v1-1400.webp`} srcSet={`${M}/macbook-v1-800.webp 800w, ${M}/macbook-v1-1400.webp 1400w, ${M}/macbook-v1-2000.webp 2000w`} sizes="(min-width: 1024px) 1100px, 100vw" width={IMG.w} height={IMG.h} alt="" loading="lazy" decoding="async" className={f.deviceImg} />
        </picture>
        {reduced && (
          <button type="button" className={f.play} onClick={playOnce} aria-label={playing ? "Pause the film" : "Play the film"}>
            {playing
              ? <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>}
          </button>
        )}
      </div>
    </section>
  );
}
