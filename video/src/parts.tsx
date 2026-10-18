import type React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EXPO, EXPO_IN, clamp } from "./theme";

// A line of type that rises out of its own mask and, later, leaves upwards.
export const Line: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const frame = useCurrentFrame();
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
  const frame = useCurrentFrame();
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
  const frame = useCurrentFrame();
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

// Over everything: a soft vignette and a very fine grain that changes every
// four frames (kept faint so the film still compresses small).
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 4) % 24;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.45))", pointerEvents: "none" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </>
  );
};

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
  const frame = useCurrentFrame();
  return (
    <div style={{ width, height: 1, background: C.silver, opacity: 0.5, transformOrigin: "0 50%", scale: `${interpolate(frame, [at, at + 24], [0, 1], { ...clamp, easing: EXPO })} 1`, ...style }} />
  );
};
