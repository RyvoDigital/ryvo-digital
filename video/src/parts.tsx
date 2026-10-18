import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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

// A whole-film backdrop: obsidian with one slow silver glow drifting across, so
// a scene change is never a cut to a different ground.
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const x = 50 + Math.sin(t * Math.PI * 2) * 14;
  const y = 38 + Math.cos(t * Math.PI * 2) * 8;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.page }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 55% at ${x}% ${y}%, rgba(205,209,217,0.10), rgba(205,209,217,0.03) 45%, transparent 70%)` }} />
    </div>
  );
};

// A hairline that draws itself from the left (scaleX) and fades.
export const Hairline: React.FC<{ at: number; width: number; style?: React.CSSProperties }> = ({ at, width, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width, height: 1, background: C.silver, opacity: 0.5, transformOrigin: "0 50%", scale: `${interpolate(frame, [at, at + 24], [0, 1], { ...clamp, easing: EXPO })} 1`, ...style }} />
  );
};
