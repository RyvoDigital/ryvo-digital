"use client";

import { useEffect, useRef, useState } from "react";
import { startMotion } from "@/lib/motion";
import { prefersReducedMotion as isReduced } from "@/lib/gsap";
import type { Sig, Stage, StageKind } from "./stage-scene";
import { clipSrc, objectSrc } from "./objects";
import { whenScrollRests } from "@/lib/gl";
import s from "./AutomationsPage.module.css";

// One signature moment. three.js and the scene load when the stage comes
// within two screens of view, the build spread over idle moments while the
// page rests; it renders from gsap.ticker only while on screen and in a
// visible tab, at a pixel ratio of at most 2. Without WebGL the poster stays;
// under reduced motion one still frame is drawn.
// With a `still` (a rendered first frame of the live scene), the stage is
// never empty: the still shows at once, and the live scene starts from that
// same frame (at rest, its clock at 0) and cross-fades in over it.
export type SignatureApi = { renderNow: () => void };

type Props = {
  sig: Sig; kind: StageKind; objects: number[]; poster: number;
  label?: string; // what the stage shows; without one it is decorative and hidden from assistive tech
  posterSrc?: string; // a rendered frame of the scene, shown when WebGL is off
  still?: { narrow: string; wide: string }; // the first frame at the stage's two shapes (below / from 768 px)
  // The hero's carousel: read every tick; told when the stage leaves or returns.
  getPos?: () => number;
  getHover?: () => number;
  onVisible?: (visible: boolean) => void;
  onReady?: (api: SignatureApi) => void;
};

export default function Signature({ sig, kind, objects, poster, label, posterSrc, still, getPos, getHover, onVisible, onReady }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const hooks = useRef({ getPos, getHover, onVisible, onReady });
  useEffect(() => { hooks.current = { getPos, getHover, onVisible, onReady }; });
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current, cv = canvas.current;
    if (!el || !cv) return;
    let stage: (Stage & { setPlaying?: (on: boolean) => void }) | null = null;
    let disposed = false;
    let onScreen = false;
    let ticking = false;
    let top = 0, height = 1;
    let t0 = 0; // the scene's clock starts here (with a still: at the reveal)
    const cleanups: (() => void)[] = [];
    const fromStill = !!still;

    // One slice of the build: once the scroll has rested, in the next idle
    // moment (after a frame where requestIdleCallback is missing: Safari).
    // An unmounted stage lets the rest of its build through at once.
    const idle = (fn: () => void) => ("requestIdleCallback" in window ? window.requestIdleCallback(() => fn(), { timeout: 600 }) : requestAnimationFrame(() => setTimeout(fn, 0)));
    // A page already at rest goes straight to the next idle moment.
    let lastScroll = 0;
    const onScroll = () => { lastScroll = performance.now(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
    const settle = () => new Promise<void>((resolve) => {
      if (disposed) return resolve();
      if (performance.now() - lastScroll > 150) { idle(resolve); return; }
      const stop = whenScrollRests(() => idle(resolve), { rest: 150 });
      cleanups.push(() => { stop(); resolve(); });
    });

    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      boot();
    }, { rootMargin: "200% 0px" });
    near.observe(el);

    async function boot() {
      const reduced = isReduced();
      try {
        // Loading three.js and building the scene are long tasks (more so on
        // a phone): both wait until the page rests.
        await settle();
        if (disposed) return;
        const m = await startMotion();
        const srcs = objects.map((i) => objectSrc(i, 800, "webp"));
        // The hero is the vitrine; the close is the mercury stage.
        const made = kind === "hero"
          ? import("./vitrine-scene").then(({ createVitrine }) => createVitrine(cv!, { objects: srcs, clips: objects.map((i) => clipSrc(i)), reduced }))
          : import("./stage-scene").then(({ createStage }) => createStage(cv!, { sig, kind, objects: srcs, reduced, step: fromStill ? settle : undefined }));
        if (disposed) return;
        stage = await made;
        if (disposed) { stage.dispose(); return; }

        const measure = () => {
          const r = el!.getBoundingClientRect();
          top = r.top + window.scrollY; height = r.height;
          stage!.resize();
        };
        measure();
        const ro = new ResizeObserver(() => { measure(); if (!ticking) { stage!.setPos(hooks.current.getPos?.() ?? 0); stage!.render(m.gsap.ticker.time - t0); } });
        ro.observe(el!);
        m.ScrollTrigger.addEventListener("refresh", measure);
        cleanups.push(() => { ro.disconnect(); m.ScrollTrigger.removeEventListener("refresh", measure); });

        // Scroll: 0 while the stage sits in view, 1 once it has scrolled past.
        // Read from the scroll position Lenis has just set, never from layout.
        const progress = () => {
          const vh = window.innerHeight;
          const p = kind === "hero" ? window.scrollY / Math.max(1, top + height * 0.9) : (window.scrollY + vh - top) / (vh + height) - 0.5;
          return Math.max(kind === "hero" ? 0 : -0.5, Math.min(1, p));
        };

        // Pointer: smoothed by quickTo on a plain object, read by the scene.
        const ptr = { x: 0, y: 0 };
        if (!reduced && matchMedia("(pointer: fine)").matches) {
          const qx = m.gsap.quickTo(ptr, "x", { duration: 1.2, ease: "expo.out" });
          const qy = m.gsap.quickTo(ptr, "y", { duration: 1.2, ease: "expo.out" });
          const move = (e: PointerEvent) => { qx((e.clientX / window.innerWidth) * 2 - 1); qy((e.clientY / window.innerHeight) * 2 - 1); };
          window.addEventListener("pointermove", move, { passive: true });
          cleanups.push(() => window.removeEventListener("pointermove", move));
        }

        const tick = (time: number) => {
          stage!.setPos(hooks.current.getPos?.() ?? 0);
          stage!.setHover(hooks.current.getHover?.() ?? 0);
          stage!.setScroll(progress());
          stage!.setPointer(ptr.x, ptr.y);
          stage!.render(time - t0);
        };
        const play = () => {
          if (ticking || reduced) return;
          ticking = true;
          stage!.setPlaying?.(true);
          m.gsap.ticker.add(tick);
        };
        const pause = () => {
          if (!ticking) return;
          ticking = false;
          stage!.setPlaying?.(false);
          m.gsap.ticker.remove(tick);
        };
        cleanups.push(pause);

        hooks.current.onReady?.({ renderNow: () => { stage!.setPos(hooks.current.getPos?.() ?? 0); stage!.render(m.gsap.ticker.time - t0); } });
        if (reduced) {
          stage.setIntro(1);
          stage.render(0);
          const vis = new IntersectionObserver(([e]) => hooks.current.onVisible?.(e.isIntersecting));
          vis.observe(el!);
          cleanups.push(() => vis.disconnect());
        } else {
          // The entrance: driven by a GSAP tween on the same ticker.
          const intro = { k: 0 };
          // The hero opens at rest (01 already inside the crystal); the close rises in.
          // With a still, the object is already there: the live scene starts at
          // rest from the still's own frame, its clock at 0, and fades in over it.
          const startIntro = () => {
            if (fromStill) { t0 = m.gsap.ticker.time; stage!.setIntro(1); stage!.render(0); setReady(true); return; }
            return kind === "hero" ? undefined : m.gsap.to(intro, { k: 1, duration: 2.2, ease: "expo.out", onUpdate: () => stage!.setIntro(intro.k) });
          };
          let introStarted = false;
          const vis = new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            hooks.current.onVisible?.(onScreen && !document.hidden);
            if (onScreen && !document.hidden) {
              play();
              if (!introStarted) { introStarted = true; startIntro(); }
            } else pause();
          }, { rootMargin: "80px 0px" });
          vis.observe(el!);
          const onVis = () => { hooks.current.onVisible?.(onScreen && !document.hidden); if (document.hidden) pause(); else if (onScreen) play(); };
          document.addEventListener("visibilitychange", onVis);
          cleanups.push(() => { vis.disconnect(); document.removeEventListener("visibilitychange", onVis); });
          stage.render(0);
        }
        if (reduced || !fromStill) setReady(true);
      } catch {
        if (!disposed) setFailed(true);
      }
    }

    return () => {
      disposed = true;
      near.disconnect();
      cleanups.forEach((c) => c());
      stage?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, kind, objects.join(",")]);

  return (
    <div ref={wrap} className={s.sig} data-kind={kind} data-ready={ready} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      <div className={s.sigPoster} data-show={failed || !!still} aria-hidden="true">
        {still ? <picture className={s.sigPosterPic}>
          <source media="(min-width: 768px)" srcSet={still.wide} width={1960} height={1102} />
          <img src={still.narrow} alt="" width={1200} height={1200} decoding="async" fetchPriority="low" className={s.sigPosterFull} />
        </picture> : posterSrc ? <img src={posterSrc} alt="" width={1920} height={1200} decoding="async" className={s.sigPosterFull} data-failed={failed} /> : <picture>
          <source type="image/avif" srcSet={`${objectSrc(poster, 800, "avif")} 800w, ${objectSrc(poster, 1200, "avif")} 1200w`} sizes="(min-width: 1024px) 40vw, 80vw" />
          <img src={objectSrc(poster, 800, "webp")} srcSet={`${objectSrc(poster, 800, "webp")} 800w, ${objectSrc(poster, 1200, "webp")} 1200w`} sizes="(min-width: 1024px) 40vw, 80vw" width={1200} height={1200} alt="" decoding="async" data-failed={failed} />
        </picture>}
      </div>
      <canvas ref={canvas} className={s.sigCanvas} aria-hidden="true" />
    </div>
  );
}
