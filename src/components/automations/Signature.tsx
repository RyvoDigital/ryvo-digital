"use client";

import { useEffect, useRef, useState } from "react";
import { startMotion, isReduced } from "./motion";
import type { Sig, Stage, StageKind } from "./stage-scene";
import { clipSrc, objectSrc } from "./objects";
import { whenScrollRests } from "@/lib/gl";
import s from "./AutomationsPage.module.css";

// One signature moment. three.js and the scene load only when the stage comes
// within 800 px of view; it renders from gsap.ticker only while on screen and
// in a visible tab, at a pixel ratio of at most 2. Without WebGL the poster
// stays; under reduced motion one still frame is drawn.
export type SignatureApi = { renderNow: () => void };

type Props = {
  sig: Sig; kind: StageKind; objects: number[]; poster: number; label: string;
  posterSrc?: string; // a rendered frame of the scene, shown when WebGL is off
  // The hero's carousel: read every tick; told when the stage leaves or returns.
  getPos?: () => number;
  getHover?: () => number;
  onVisible?: (visible: boolean) => void;
  onReady?: (api: SignatureApi) => void;
};

export default function Signature({ sig, kind, objects, poster, label, posterSrc, getPos, getHover, onVisible, onReady }: Props) {
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
    const cleanups: (() => void)[] = [];

    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      boot();
    }, { rootMargin: "800px 0px" });
    near.observe(el);

    async function boot() {
      const reduced = isReduced();
      try {
        const probe = document.createElement("canvas");
        const gl = probe.getContext("webgl2") || probe.getContext("webgl");
        if (!gl) throw new Error("no webgl");
        gl.getExtension("WEBGL_lose_context")?.loseContext(); // the probe gives its context back at once
        const m = await startMotion();
        // The build is one long task: run it while the page rests.
        await new Promise<void>((resolve) => { cleanups.push(whenScrollRests(resolve)); });
        if (disposed) return;
        const srcs = objects.map((i) => objectSrc(i, 800, "webp"));
        // The hero is the vitrine; the close is the mercury stage.
        const made = kind === "hero"
          ? import("./vitrine-scene").then(({ createVitrine }) => createVitrine(cv!, { objects: srcs, clips: objects.map((i) => clipSrc(i)), reduced }))
          : import("./stage-scene").then(({ createStage }) => createStage(cv!, { sig, kind, objects: srcs, reduced }));
        if (disposed) return;
        stage = await made;
        if (disposed) { stage.dispose(); return; }

        const measure = () => {
          const r = el!.getBoundingClientRect();
          top = r.top + window.scrollY; height = r.height;
          stage!.resize();
        };
        measure();
        const ro = new ResizeObserver(() => { measure(); if (!ticking) { stage!.setPos(hooks.current.getPos?.() ?? 0); stage!.render(m.gsap.ticker.time); } });
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
          stage!.render(time);
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

        hooks.current.onReady?.({ renderNow: () => { stage!.setPos(hooks.current.getPos?.() ?? 0); stage!.render(m.gsap.ticker.time); } });
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
          const startIntro = () => kind === "hero" ? undefined : m.gsap.to(intro, { k: 1, duration: 2.2, ease: "expo.out", onUpdate: () => stage!.setIntro(intro.k) });
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
        setReady(true);
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
    <div ref={wrap} className={s.sig} data-kind={kind} data-ready={ready} role="img" aria-label={label}>
      <div className={s.sigPoster} data-show={failed} aria-hidden="true">
        {posterSrc ? <img src={posterSrc} alt="" decoding="async" className={s.sigPosterFull} data-failed={failed} /> : <picture>
          <source type="image/avif" srcSet={`${objectSrc(poster, 800, "avif")} 800w, ${objectSrc(poster, 1200, "avif")} 1200w`} sizes="(min-width: 1024px) 40vw, 80vw" />
          <img src={objectSrc(poster, 800, "webp")} srcSet={`${objectSrc(poster, 800, "webp")} 800w, ${objectSrc(poster, 1200, "webp")} 1200w`} sizes="(min-width: 1024px) 40vw, 80vw" width={1200} height={1200} alt="" decoding="async" data-failed={failed} />
        </picture>}
      </div>
      <canvas ref={canvas} className={s.sigCanvas} aria-hidden="true" />
    </div>
  );
}
