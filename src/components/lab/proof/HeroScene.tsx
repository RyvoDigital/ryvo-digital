"use client";

import { useEffect, useRef, useState } from "react";
import Signature, { type SignatureApi } from "./Signature";
import { startMotion, isReduced, type ProofMotion } from "./motion";
import s from "./proof.module.css";

// The hero's film loop: the five objects pass through the crystal in turn,
// 01 → 05 and back to 01. Nothing is tied to scroll and nothing pins. Each
// object rests in the crystal for a beat (its number fills as it waits), then
// the next arrives. A visitor can take over, but never has to: click a number,
// drag or swipe the scene, or hover to hold it. Every move starts from where
// the row is, so a click mid-glide never jumps.
const N = 5;
const REST = 2.8; // seconds an object rests in the crystal
const GLIDE = 1.7; // seconds from one object to the next

const wrap = (p: number) => ((p % N) + N) % N;

export default function HeroScene({ names, taglines }: { names: string[]; taglines: string[] }) {
  const pos = useRef({ p: 0 });
  const hov = useRef({ k: 0 }); // the hover lift, eased
  const [target, setTarget] = useState(0); // the number lit in the progress mark
  const [shown, setShown] = useState(0); // the label under the crystal
  const [labelOn, setLabelOn] = useState(true);
  const ctl = useRef<{ go: (i: number, opts?: { quick?: boolean }) => void } | null>(null);
  const api = useRef<SignatureApi | null>(null);
  const scene = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ visible: true, hover: false, dragging: false });
  const hold = useRef<() => void>(() => {});

  useEffect(() => {
    let m: ProofMotion | null = null;
    let glide: gsap.core.Tween | null = null;
    let rest: gsap.core.Tween | null = null;
    let cancelled = false;
    const reduced = isReduced();

    const held = () => !state.current.visible || state.current.hover || state.current.dragging;
    const syncRest = () => {
      // Off-screen, the glide waits too, so coming back never shows a jump.
      if (state.current.visible) glide?.resume(); else glide?.pause();
      if (!rest) return;
      if (held()) rest.pause(); else rest.resume();
    };
    hold.current = syncRest;

    const startRest = (i: number) => {
      if (!m || reduced) return;
      rest?.kill();
      fills.current.forEach((f) => f && m!.gsap.set(f, { scaleX: 0 }));
      const fill = fills.current[i];
      rest = m.gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: REST, ease: "none", onComplete: () => go(wrap(i + 1)) });
      syncRest();
    };

    // Move to object i along the shorter way round, from wherever the row is.
    function go(i: number, opts: { quick?: boolean } = {}) {
      if (!m) return;
      i = wrap(i);
      setTarget(i);
      rest?.kill(); rest = null;
      fills.current.forEach((f) => f && m!.gsap.set(f, { scaleX: 0 }));
      if (reduced) {
        // No glide under reduced motion: a simple fade.
        const el = scene.current!;
        m.gsap.to(el, { opacity: 0, duration: 0.25, ease: "power1.out", onComplete: () => {
          pos.current.p = i; setShown(i); api.current?.renderNow();
          m!.gsap.to(el, { opacity: 1, duration: 0.35, ease: "power1.out" });
        } });
        return;
      }
      let d = wrap(i - pos.current.p);
      if (d > N / 2) d -= N;
      if (Math.abs(d) < 0.001 && !glide?.isActive()) { startRest(i); return; }
      setLabelOn(false);
      glide?.kill();
      glide = m.gsap.to(pos.current, {
        p: pos.current.p + d,
        duration: opts.quick ? 0.9 : GLIDE * Math.min(1.35, 0.75 + Math.abs(d) * 0.25),
        ease: opts.quick ? "expo.out" : "expo.inOut",
        onComplete: () => {
          pos.current.p = wrap(Math.round(pos.current.p));
          setShown(i);
          setLabelOn(true);
          startRest(i);
        },
      });
    }

    startMotion().then((motion) => {
      if (cancelled) return;
      m = motion;
      ctl.current = { go };
      startRest(0);
    });

    // Drag or swipe: the row follows the pointer, then settles on the next or
    // previous object. Vertical swipes stay the page's own scroll (pan-y).
    const el = scene.current!;
    let x0 = 0, p0 = 0, lastX = 0, lastT = 0, v = 0, moved = false;
    const down = (e: PointerEvent) => {
      if (!m || reduced || e.button > 0) return;
      x0 = lastX = e.clientX; lastT = performance.now(); v = 0; moved = false;
      p0 = pos.current.p;
      state.current.dragging = true;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!state.current.dragging || !m) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) { moved = true; glide?.kill(); rest?.kill(); rest = null; setLabelOn(false); fills.current.forEach((f) => f && m!.gsap.set(f, { scaleX: 0 })); }
      const now = performance.now();
      v = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      pos.current.p = p0 - dx / (el.clientWidth * 0.42);
    };
    const up = () => {
      if (!state.current.dragging) return;
      state.current.dragging = false;
      if (!moved) { syncRest(); return; }
      // Past a fifth of a step, or a quick flick, moves on; less springs back.
      const drift = pos.current.p - p0 - v * 0.6;
      const dir = Math.abs(drift) > 0.2 ? Math.sign(drift) : 0;
      const steps = Math.max(1, Math.round(Math.abs(drift)));
      go(dir ? Math.round(p0) + dir * steps : Math.round(pos.current.p), { quick: true });
    };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") { state.current.hover = true; syncRest(); if (m && !reduced) m.gsap.to(hov.current, { k: 1, duration: 1.1, ease: "expo.out", overwrite: true }); } };
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") { state.current.hover = false; syncRest(); if (m) m.gsap.to(hov.current, { k: 0, duration: 1.1, ease: "expo.out", overwrite: true }); } };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    return () => {
      cancelled = true;
      glide?.kill(); rest?.kill();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const onVisible = (v: boolean) => { state.current.visible = v; hold.current(); };

  return (
    <div className={s.heroScene}>
      <div ref={scene} className={s.heroCanvas} data-hero-scene>
        <Signature sig="crystal" kind="hero" objects={[0, 1, 2, 3, 4]} poster={0} posterSrc="/media/proof/vitrine-poster-v1.webp" label="The five automations as chrome objects, shown one at a time in a lit glass case"
          getPos={() => pos.current.p} getHover={() => hov.current.k} onVisible={onVisible} onReady={(a) => { api.current = a; }} />
      </div>
      <div className={s.heroCaption} aria-live="polite">
        <p className={s.capLine} data-on={labelOn}>
          <span className={s.capName}>0{shown + 1} · {names[shown]}</span>
          <span className={s.capTag}>{taglines[shown]}</span>
        </p>
        <ol className={s.marks} aria-label="The five automations">
          {names.map((n, i) => (
            <li key={n}>
              <button type="button" className={s.mark} data-on={i === target} aria-current={i === target ? "true" : undefined} aria-label={`0${i + 1} ${n}`} onClick={() => ctl.current?.go(i)}>
                <span>0{i + 1}</span>
                <span className={s.markBar} aria-hidden="true"><span ref={(el) => { fills.current[i] = el; }} /></span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
