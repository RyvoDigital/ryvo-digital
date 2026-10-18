import type React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EXPO, EXPO_IN, clamp, useT } from "./theme";

// A line of type that rises out of its own mask and, later, leaves upwards.
export const Line: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const frame = useT();
  const inY = interpolate(frame, [at, at + 22], [112, 0], { ...clamp, easing: EXPO });
  const outY = out === undefined ? 0 : interpolate(frame, [out, out + 14], [0, -112], { ...clamp, easing: EXPO_IN });
  return (
    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
      <span style={{ display: "block", translate: `0 ${inY + outY}%`, ...style }}>{children}</span>
    </span>
  );
};

// Words that arrive one by one out of focus: each scales down from 1.16, its
// blur clears and it settles; `out` sends them away the other way (they grow
// a little and soften). `step` is the per-word delay in frames.
export const Words: React.FC<{ text: string; at: number; out?: number; step?: number; style?: React.CSSProperties }> = ({ text, at, out, step = 3, style }) => {
  const frame = useT();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((w, i) => {
        const t = interpolate(frame, [at + i * step, at + i * step + 20], [0, 1], { ...clamp, easing: EXPO });
        const o = out === undefined ? 0 : interpolate(frame, [out + i * 1.5, out + i * 1.5 + 12], [0, 1], { ...clamp, easing: EXPO_IN });
        const blur = (1 - t) * 16 + o * 12;
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: t * (1 - o), filter: blur > 0.05 ? `blur(${blur}px)` : undefined, scale: `${1.16 - 0.16 * t + o * 0.08}`, translate: `0 ${(1 - t) * 0.18}em`, transformOrigin: "50% 70%" }}>
            {w}{i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

// Letters that rise out of a shared mask, one after another.
export const Letters: React.FC<{ text: string; at: number; out?: number; step?: number; style?: React.CSSProperties }> = ({ text, at, out, step = 1.6, style }) => {
  const frame = useT();
  return (
    <span style={{ display: "inline-flex", overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      {text.split("").map((ch, i) => {
        const t = interpolate(frame, [at + i * step, at + i * step + 18], [0, 1], { ...clamp, easing: EXPO });
        const o = out === undefined ? 0 : interpolate(frame, [out + i * 0.8, out + i * 0.8 + 12], [0, 1], { ...clamp, easing: EXPO_IN });
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", translate: `0 ${(1 - t) * 105 - o * 105}%`, rotate: `${(1 - t) * 6}deg`, transformOrigin: "0 100%" }}>{ch}</span>;
      })}
    </span>
  );
};

// The whole-film ground: obsidian, one slow silver glow drifting across, so a
// change of scene is never a cut to a different ground; a faint vignette.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const x = 50 + Math.sin(t * Math.PI * 2) * 14;
  const y = 40 + Math.cos(t * Math.PI * 2) * 8;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 55% at ${x}% ${y}%, rgba(205,209,217,0.09), rgba(205,209,217,0.025) 45%, transparent 70%)` }} />
    </div>
  );
};

// Over everything: a soft vignette. (Round 6: no grain; it cost bits and read
// as low quality.)
export const Finish: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))", pointerEvents: "none" }} />
);

// A silver light leak: a soft, warm-neutral bloom that drifts in from one
// edge and away again over `dur` frames, starting at `at`.
export const LightLeak: React.FC<{ at: number; dur: number; from?: "left" | "right"; seed?: string }> = ({ at, dur, from = "left", seed = "leak" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const a = Math.sin(p * Math.PI);
  const jitter = (random(`${seed}${Math.floor(frame / 4)}`) - 0.5) * 0.06;
  const x = from === "left" ? -10 + p * 50 : 110 - p * 50;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", opacity: a * (0.5 + jitter),
      background: `radial-gradient(38% 70% at ${x}% ${30 + p * 25}%, rgba(236,230,218,0.30), rgba(205,209,217,0.10) 45%, transparent 72%)` }} />
  );
};

// A hairline that draws itself from the left (scaleX).
export const Hairline: React.FC<{ at: number; width: number; style?: React.CSSProperties }> = ({ at, width, style }) => {
  const frame = useT();
  return (
    <div style={{ width, height: 1, background: C.silver, opacity: 0.5, transformOrigin: "0 50%", scale: `${interpolate(frame, [at, at + 24], [0, 1], { ...clamp, easing: EXPO })} 1`, ...style }} />
  );
};

// The mercury line (round 6): the one signature line of light that threads
// the film. A chrome stroke with a soft glow, drawn along a path. mode "draw":
// it grows from its start (and, with `out`, recedes from its start); mode
// "comet": a bright segment travels along it, round and round. Paths are in
// composition pixels (1920 × 1200).
export const Mercury: React.FC<{ id: string; d: string; at: number; dur?: number; out?: number; mode?: "draw" | "comet"; seg?: number; speed?: number; width?: number; opacity?: number; style?: React.CSSProperties }> = ({ id, d, at, dur = 40, out, mode = "draw", seg = 0.22, speed = 0.012, width = 3, opacity = 1, style }) => {
  const frame = useT();
  const grow = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EXPO });
  const gone = out === undefined ? 0 : interpolate(frame, [out, out + 24], [0, 1], { ...clamp, easing: EXPO_IN });
  if (grow <= 0 || gone >= 1) return null;
  const dash = mode === "draw" ? `${grow} 1` : `${seg} ${1 - seg}`;
  const offset = mode === "draw" ? -gone : -((frame - at) * speed) % 1;
  const fade = mode === "comet" ? grow * (1 - gone) : 1;
  const stroke = { pathLength: 1, strokeDasharray: dash, strokeDashoffset: offset, fill: "none", strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 1920 1200" width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", opacity: opacity * fade, ...style }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#9aa0a8" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9bec6" />
        </linearGradient>
        <filter id={`${id}-f`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={width * 3.2} /></filter>
      </defs>
      <path d={d} {...stroke} stroke="rgba(226,230,236,0.55)" strokeWidth={width * 5} filter={`url(#${id}-f)`} />
      <path d={d} {...stroke} stroke={`url(#${id}-g)`} strokeWidth={width} />
    </svg>
  );
};

// Depth of field: a few soft discs of light far behind the subject, out of
// focus, drifting slowly the other way (parallax).
export const Bokeh: React.FC<{ seed: string; count?: number; drift?: number }> = ({ seed, count = 9, drift = 1 }) => {
  const frame = useT();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const size = 50 + r("s") * 150;
        const x = r("x") * 1920 - (frame / 30) * (6 + r("v") * 10) * drift;
        const y = 120 + r("y") * 960 + Math.sin(frame / 30 * 0.3 + i) * 10;
        return <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", background: "rgba(214,218,226,1)", opacity: 0.035 + r("o") * 0.07, filter: `blur(${14 + r("b") * 16}px)` }} />;
      })}
    </>
  );
};
