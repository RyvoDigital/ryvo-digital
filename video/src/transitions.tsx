import type React from "react";
import { Easing } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { C } from "./theme";

type NoProps = Record<string, never>;
const W = 1920, H = 1200;
const SMOOTH = Easing.bezier(0.65, 0, 0.35, 1);

// The wave edge of the mercury wipe at progress p, as points across the frame.
const wave = (p: number) => {
  const e = SMOOTH(p);
  const base = H * 1.08 - e * H * 1.16; // from below the frame to above it
  const amp = 70 * Math.sin(p * Math.PI); // calm at both ends, fullest mid-way
  const pts: [number, number][] = [];
  for (let i = 0; i <= 32; i++) {
    const x = (i / 32) * W;
    const y = base + amp * Math.sin(i / 32 * Math.PI * 2.2 + p * 5.5) + amp * 0.45 * Math.sin(i / 32 * Math.PI * 5.1 - p * 3.2);
    pts.push([x, y]);
  }
  return pts;
};

// Liquid mercury rises over the frame: the next scene is revealed below a
// moving wave, and the wave's edge is a band of chrome that catches light.
const MercuryWipe: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const pts = wave(p);
  if (presentationDirection === "exiting") {
    // The scene it covers stays only above the wave, sinking back a little
    // and dimming, for depth (scenes have no ground of their own).
    const above = `polygon(0% 0%, 100% 0%, ${[...pts].reverse().map(([x, y]) => `${(x / W) * 100}% ${(y / H) * 100}%`).join(", ")})`;
    return <div style={{ position: "absolute", inset: 0, clipPath: above }}><div style={{ position: "absolute", inset: 0, scale: `${1 - 0.04 * p}`, filter: `brightness(${1 - 0.35 * p})` }}>{children}</div></div>;
  }
  const poly = `polygon(${pts.map(([x, y]) => `${(x / W) * 100}% ${(y / H) * 100}%`).join(", ")}, 100% 100%, 0% 100%)`;
  const d = `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")}`;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, clipPath: poly, scale: `${1.05 - 0.05 * p}` }}>{children}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <linearGradient id="merc" x1="0" x2="1" y1="0" y2="0.2">
            <stop offset="0" stopColor="#8e939b" />
            <stop offset={`${0.25 + p * 0.5}`} stopColor="#fafbfc" />
            <stop offset="1" stopColor="#7e838b" />
          </linearGradient>
          <filter id="mercGlow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <path d={d} fill="none" stroke="rgba(236,238,242,0.35)" strokeWidth={46} filter="url(#mercGlow)" />
        <path d={d} fill="none" stroke="url(#merc)" strokeWidth={10} strokeLinecap="round" />
        <path d={d} fill="none" stroke={C.page} strokeWidth={3} transform="translate(0 7)" opacity={0.6} />
      </svg>
    </div>
  );
};
export const mercuryWipe = (): TransitionPresentation<NoProps> => ({ component: MercuryWipe, props: {} });

// A whip pan: the scene leaves to the left and the next arrives from the right,
// smeared along the direction of travel (a horizontal-only blur) at speed.
const Whip: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const e = SMOOTH(p);
  const speed = Math.sin(p * Math.PI); // fastest mid-way
  const x = presentationDirection === "exiting" ? -e * 70 : (1 - e) * 70;
  const id = `whip${presentationDirection}`;
  return (
    <div style={{ position: "absolute", inset: 0, translate: `${x}% 0`, opacity: presentationDirection === "exiting" ? 1 - e * 0.6 : 0.4 + e * 0.6, filter: speed > 0.02 ? `url(#${id})` : undefined }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation={`${(speed * 46).toFixed(1)} 0`} /></filter>
      </svg>
      {children}
      {presentationDirection === "entering" && (
        // The mercury line carries the move: one streak of light runs across
        // the frame with the whip, brightest at its fastest.
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", translate: `${-x}% 0`, opacity: speed }}>
          <defs><filter id="whipLine" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="8" /></filter></defs>
          <path d={`M ${W * (1.2 - e * 1.4)} 640 L ${W * (1.6 - e * 1.4)} 640`} stroke="rgba(230,233,238,0.55)" strokeWidth={14} strokeLinecap="round" filter="url(#whipLine)" />
          <path d={`M ${W * (1.2 - e * 1.4)} 640 L ${W * (1.6 - e * 1.4)} 640`} stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};
export const whip = (): TransitionPresentation<NoProps> => ({ component: Whip, props: {} });

// A light sweep: a bright diagonal band crosses the frame and the next scene
// is underneath it once it has passed.
const Sweep: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const pos = -30 + SMOOTH(p) * 160;
  if (presentationDirection === "exiting") {
    return <div style={{ position: "absolute", inset: 0, maskImage: `linear-gradient(105deg, transparent ${pos - 8}%, #000 ${pos + 8}%)`, WebkitMaskImage: `linear-gradient(105deg, transparent ${pos - 8}%, #000 ${pos + 8}%)` }}>{children}</div>;
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, maskImage: `linear-gradient(105deg, #000 ${pos - 8}%, transparent ${pos + 8}%)`, WebkitMaskImage: `linear-gradient(105deg, #000 ${pos - 8}%, transparent ${pos + 8}%)` }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(105deg, transparent ${pos - 10}%, rgba(236,238,242,0.22) ${pos}%, transparent ${pos + 10}%)` }} />
    </div>
  );
};
export const lightSweep = (): TransitionPresentation<NoProps> => ({ component: Sweep, props: {} });
