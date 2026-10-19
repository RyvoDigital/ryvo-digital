"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { prefersReducedMotion as isReduced } from "@/lib/gsap";
import f from "./BrandFilm.module.css";

// The brand film (video/, Remotion): what Ryvo builds, 35 s, silent, looping,
// playing on a MacBook. The device is a Kie render whose screen is a
// transparent hole, so the film plays behind it and the notch and bezels sit on
// top exactly. Muted and inline. Its poster shows first; the file (11-12 MB)
// is fetched only once the film is within ~1.5 screens, and it plays only
// while in view and pauses off-screen. Under reduced motion it shows the
// poster with a small play button (the file loads on the first tap).
const M = "/media/automations/film";
// The film's captions are burned in, so each language plays its own render
// (the same frames; only the words change: video/src/copy.ts).
const FILMS: readonly Locale[] = ["en", "pt", "es"];
// The screen hole, in % of the 3,804 × 2,564 render (KIE-LOG.md).
const SCREEN = { left: 12.329, top: 7.137, width: 75.342, height: 70.437 };
const IMG = { w: 3804, h: 2564 };

export default function BrandFilm({ lang, label, alt, play, pause }: { lang: Locale; label: string; alt: string; play: string; pause: string }) {
  const film = FILMS.includes(lang) ? lang : "en";
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
    // Near: start buffering, so it is ready by the time it is in view.
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      v.preload = "auto";
      v.load();
    }, { rootMargin: "150% 0px" });
    near.observe(el);
    let inView = false;
    const sync = () => { if (inView && !document.hidden) v.play().catch(() => {}); else v.pause(); };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.25 });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { near.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", sync); v.pause(); };
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
            preload="none"
            poster={`${M}/brand-film-poster-${film}-1920.webp`}
            aria-label={alt}
          >
            {/* One file: H.264 at 2560 × 1600, 60 fps (11.3 MB), which every
                browser plays; a WebM would only add weight. */}
            <source src={`${M}/brand-film-${film}.mp4`} type="video/mp4" />
          </video>
          <span className={f.glass} aria-hidden="true" />
        </div>
        <picture>
          <source type="image/avif" srcSet={`${M}/macbook-800.avif 800w, ${M}/macbook-1400.avif 1400w, ${M}/macbook-2000.avif 2000w`} sizes="(min-width: 1024px) 1100px, 100vw" />
          <img src={`${M}/macbook-1400.webp`} srcSet={`${M}/macbook-800.webp 800w, ${M}/macbook-1400.webp 1400w, ${M}/macbook-2000.webp 2000w`} sizes="(min-width: 1024px) 1100px, 100vw" width={IMG.w} height={IMG.h} alt="" loading="lazy" decoding="async" className={f.deviceImg} />
        </picture>
        {reduced && (
          <button type="button" className={f.play} onClick={playOnce} aria-label={playing ? pause : play}>
            {playing
              ? <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>}
          </button>
        )}
      </div>
    </section>
  );
}
