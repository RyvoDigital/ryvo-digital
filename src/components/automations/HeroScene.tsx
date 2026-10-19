"use client";

import { useEffect, useRef, useState } from "react";
import Signature, { type SignatureApi } from "./Signature";
import { startMotion, type PageMotion } from "@/lib/motion";
import { prefersReducedMotion as isReduced } from "@/lib/gsap";
import s from "./AutomationsPage.module.css";

// The hero's loop: the five objects pass into the vitrine in turn, 01 → 05 and
// back to 01. Nothing is tied to scroll and nothing pins. Each object rests in
// the case for a beat (its number fills as it waits), then the next arrives.
// The loop and its progress run wherever the pointer is; it pauses only off
// screen, in a hidden tab, and under reduced motion. Click a number to go
// there (its progress restarts), or drag and swipe the scene.
//
// The row's position is a critically damped spring, integrated exactly with
// the real frame time: a glide eases in and settles with no overshoot and no
// snap, runs at the same speed whatever the frame rate, and a click mid-glide
// retargets it smoothly, keeping its velocity.
const N = 5;
const REST = 3.4; // seconds an object rests in the case
const OMEGA = 3.4; // the spring's stiffness: about 1.4 s to settle
const SETTLED = 0.004; // within this of the target (and nearly still), it rests

const wrap = (p: number) => ((p % N) + N) % N;

export default function HeroScene({ names, taglines, label, marks }: { names: string[]; taglines: string[]; label: string; marks: string }) {
  const pos = useRef({ p: 0 }); // what the scene reads: the row's position, wrapped
  const [target, setTarget] = useState(0); // the number lit in the progress mark
  const [shown, setShown] = useState(0); // the label under the case
  const [labelOn, setLabelOn] = useState(true);
  const ctl = useRef<{ go: (i: number) => void } | null>(null);
  const api = useRef<SignatureApi | null>(null);
  const scene = useRef<HTMLDivElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ visible: true, dragging: false });

  useEffect(() => {
    let m: PageMotion | null = null;
    let cancelled = false;
    const reduced = isReduced();
    // x: the row (unwrapped), v: its velocity, to: the target (an integer).
    const k = { x: 0, v: 0, to: 0, resting: true, restT: 0 };
    const fill = (i: number, f: number) => fills.current.forEach((el, j) => { if (el) el.style.transform = `scaleX(${j === i ? f : 0})`; });

    function go(i: number) {
      if (!m) return;
      i = wrap(i);
      setTarget(i);
      if (reduced) {
        // No glide under reduced motion: a simple fade.
        const el = scene.current!;
        m.gsap.to(el, { opacity: 0, duration: 0.25, ease: "power1.out", onComplete: () => {
          k.x = k.to = i; pos.current.p = i; setShown(i); api.current?.renderNow();
          m!.gsap.to(el, { opacity: 1, duration: 0.35, ease: "power1.out" });
        } });
        return;
      }
      let d = wrap(i - k.x);
      if (d > N / 2) d -= N;
      k.to = Math.round(k.x + d);
      k.restT = 0;
      fill(i, 0);
      // Already there (a click on the resting number): its progress restarts.
      if (Math.abs(k.to - k.x) < SETTLED && k.resting) return;
      k.resting = false;
      setLabelOn(false);
    }

    const tick = (_time: number, deltaMs: number) => {
      if (!state.current.visible || state.current.dragging) return;
      // Real frame time, clamped so a long stall never jumps the row.
      const dt = Math.min(deltaMs / 1000, 1 / 15);
      if (!k.resting) {
        // Exact critically damped step: x(t) = to + (e + (v + ω e) t) e^(−ω t).
        const e = k.x - k.to;
        const decay = Math.exp(-OMEGA * dt);
        const c = k.v + OMEGA * e;
        k.x = k.to + (e + c * dt) * decay;
        k.v = (c - OMEGA * (e + c * dt)) * decay;
        if (Math.abs(k.x - k.to) < SETTLED && Math.abs(k.v) < 0.02) {
          k.x = k.to; k.v = 0; k.resting = true; k.restT = 0;
          const i = wrap(k.to);
          setShown(i); setLabelOn(true);
        }
      } else {
        k.restT += dt;
        fill(wrap(k.to), Math.min(1, k.restT / REST));
        if (k.restT >= REST) go(wrap(k.to) + 1);
      }
      pos.current.p = wrap(k.x);
    };

    startMotion().then((motion) => {
      if (cancelled) return;
      m = motion;
      ctl.current = { go };
      if (!reduced) m.gsap.ticker.add(tick);
    });

    // Drag or swipe: the row follows the pointer, then the spring carries it,
    // with the flick's velocity, to the next or previous object. Vertical
    // swipes stay the page's own scroll (pan-y).
    const el = scene.current!;
    let x0 = 0, p0 = 0, lastX = 0, lastT = 0, vel = 0, moved = false;
    const down = (e: PointerEvent) => {
      if (!m || reduced || e.button > 0) return;
      x0 = lastX = e.clientX; lastT = performance.now(); vel = 0; moved = false;
      p0 = k.x;
      state.current.dragging = true;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!state.current.dragging || !m) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) { moved = true; k.resting = false; setLabelOn(false); fill(-1, 0); }
      const now = performance.now();
      const w = el.clientWidth * 0.42;
      vel = (-(e.clientX - lastX) / w) / Math.max(0.001, (now - lastT) / 1000); lastX = e.clientX; lastT = now;
      k.x = p0 - dx / w;
      pos.current.p = wrap(k.x);
    };
    const up = () => {
      if (!state.current.dragging) return;
      state.current.dragging = false;
      if (!moved) return;
      // Past a fifth of a step, or a quick flick, moves on; less springs back.
      const drift = k.x - p0 + vel * 0.12;
      const dir = Math.abs(drift) > 0.2 ? Math.sign(drift) : 0;
      const steps = Math.max(1, Math.round(Math.abs(drift)));
      k.v = Math.max(-6, Math.min(6, vel));
      go(dir ? Math.round(p0) + dir * steps : Math.round(k.x));
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    return () => {
      cancelled = true;
      m?.gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  const onVisible = (v: boolean) => { state.current.visible = v; };

  return (
    <div className={s.heroScene}>
      <div ref={scene} className={s.heroCanvas} data-hero-scene>
        <Signature sig="crystal" kind="hero" objects={[0, 1, 2, 3, 4]} poster={0} posterSrc="/media/automations/vitrine-poster.webp" label={label}
          getPos={() => pos.current.p} onVisible={onVisible} onReady={(a) => { api.current = a; }} />
      </div>
      <div className={s.heroCaption} aria-live="polite">
        <p className={s.capLine} data-on={labelOn}>
          <span className={s.capName}>0{shown + 1} · {names[shown]}</span>
          <span className={s.capTag}>{taglines[shown]}</span>
        </p>
        <ol className={s.marks} aria-label={marks}>
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
