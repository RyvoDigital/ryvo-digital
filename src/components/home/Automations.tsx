"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/chrome/Icons";
import styles from "./Automations.module.css";

// Five nodes on the hairline orbit around the chrome loop (pentagon, 01 on top).
const NODE_ANGLES = [-90, -18, 54, 126, 198];
const ORBIT = { rx: 44, ry: 31 }; // % of the stage

function LoopStage({ active, note }: { active: number; note: string[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // The ring turns on its own in a seamless endless loop (first and last frames
  // match). It loads when about to be seen, pauses off-screen, and never loads
  // with reduced motion (the still stays).
  useEffect(() => {
    const el = stage.current;
    const v = video.current;
    if (!el || !v || prefersReducedMotion()) return;
    let loaded = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!loaded) { loaded = true; v.src = "/media/loop/loop-turn.mp4"; v.load(); }
        v.play().catch(() => {});
      } else if (loaded) v.pause();
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    const onReady = () => setReady(true);
    v.addEventListener("loadeddata", onReady);
    return () => { io.disconnect(); v.removeEventListener("loadeddata", onReady); };
  }, []);

  return (
    <div ref={stage} className={styles.stage}>
      <div aria-hidden="true" className={styles.glow} />
      <picture>
        <source type="image/avif" srcSet="/media/loop/loop-640.avif 640w, /media/loop/loop-960.avif 960w, /media/loop/loop-1280.avif 1280w" sizes="(min-width: 1024px) 540px, 90vw" />
        <img src="/media/loop/loop-960.webp" srcSet="/media/loop/loop-640.webp 640w, /media/loop/loop-960.webp 960w, /media/loop/loop-1280.webp 1280w" sizes="(min-width: 1024px) 540px, 90vw" alt="" width={1280} height={1280} loading="lazy" decoding="async" className={styles.media} />
      </picture>
      <video ref={video} className={styles.media} style={{ opacity: ready ? 1 : 0 }} muted playsInline loop preload="none" aria-hidden="true" />
      <svg className={styles.orbit} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="50" cy="50" rx={ORBIT.rx} ry={ORBIT.ry} />
      </svg>
      {NODE_ANGLES.map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <span
            key={deg}
            aria-hidden="true"
            className={`${styles.node} ${i === active ? styles.nodeOn : ""}`}
            style={{ left: `${50 + ORBIT.rx * Math.cos(r)}%`, top: `${50 + ORBIT.ry * Math.sin(r)}%` }}
          >
            0{i + 1}
          </span>
        );
      })}
      <span className={styles.note}>{note[0]}<br />{note[1]}</span>
    </div>
  );
}

export default function Automations({ lang, t, names }: { lang: Locale; t: Dictionary["automations"]; names: string[] }) {
  const [open, setOpen] = useState(0);
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || prefersReducedMotion()) return;
    return withMotion(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.from(el.querySelectorAll("[data-row]"), {
          opacity: 0,
          y: 18,
          duration: 1,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
      }, el);
      return () => ctx.revert();
    });
  }, []);

  return (
    <section id="automations" className={styles.section} aria-labelledby="automations-title">
      <div aria-hidden="true" className={styles.sideGlow} />
      <div className={styles.inner}>
        <LoopStage active={open} note={t.loopNote} />
        <div className={styles.copy}>
          <div className={`flex flex-col gap-[18px] ${styles.header}`}>
            <span className="mono-label">{t.label}</span>
            <h2 id="automations-title" className={`display ${styles.title}`}>
              {t.titleA}{" "}
              <span className="text-steel">
                <span className="hidden md:inline">{t.titleB}</span>
                <span className="md:hidden">{t.titleBShort}</span>
              </span>
            </h2>
          </div>
          <div ref={listRef} className={styles.list}>
            {names.map((name, i) => {
              const isOpen = open === i;
              return (
                <div key={name} className={styles.row} data-row data-open={isOpen} data-no-pill={isOpen ? "" : undefined}>
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={`${base}-h${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${base}-p${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className={styles.head}
                    >
                      <span className="flex items-baseline gap-[14px] md:gap-[22px]">
                        <span className={styles.num}>[0{i + 1}]</span>
                        <span className={styles.name}>{name}</span>
                      </span>
                      <span className={styles.icon} aria-hidden="true">
                        <ArrowUpRight size={14} />
                      </span>
                    </button>
                  </h3>
                  <div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-h${i}`} className={styles.panel} inert={!isOpen}>
                    <div className="overflow-hidden">
                      <p className={styles.body}>{t.items[i]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href={`/${lang}/automations`} className={`btn-ghost self-start ${styles.more}`}>{t.more}</Link>
        </div>
      </div>
    </section>
  );
}
