import { CameraMotionBlur } from "@remotion/motion-blur";
import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Letters, Words } from "../parts";
import { BEAT, C, EXPO, OBJECTS, SANS, clamp } from "../theme";

// 2 · Ryvo. "Five automations / from the first contact until after the deed."
// The five objects swoop in and orbit the words: behind them when far (small,
// soft) and in front when near. The swoop is motion-blurred.

const CX = 960, CY = 590, RX = 800, RY = 300;

const Orbiter = ({ i }: { i: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const swoop = interpolate(frame, [0, 30], [1, 0], { ...clamp, easing: EXPO });
  const th = -Math.PI / 2 + (i / 5) * Math.PI * 2 + (frame / fps) * 0.38 + swoop * 2.6;
  const z = Math.sin(th); // -1 back … 1 front
  const r = 1 + swoop * 0.9;
  const x = CX + Math.cos(th) * RX * r;
  const y = CY + z * RY * r; // far: above the title; near: below the line
  const size = 220 * (0.66 + 0.4 * (z + 1) / 2);
  return (
    <Img src={OBJECTS[i]} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, objectFit: "contain", opacity: interpolate(frame, [0, 12], [0, 1], clamp) * (0.55 + 0.45 * (z + 1) / 2), filter: z < 0 ? `blur(${(-z * 3.5).toFixed(2)}px)` : undefined }} />
  );
};

export const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const order = [0, 1, 2, 3, 4].map((i) => ({ i, z: Math.sin(-Math.PI / 2 + (i / 5) * Math.PI * 2 + (frame / fps) * 0.38 + interpolate(frame, [0, 30], [1, 0], { ...clamp, easing: EXPO }) * 2.6) }));
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${interpolate(frame, [0, 8 * BEAT], [1.04, 1])}` }}>
      {order.map(({ i, z }) => (
        <div key={i} style={{ position: "absolute", inset: 0, zIndex: z < 0 ? 1 : 10 }}>
          <CameraMotionBlur shutterAngle={200} samples={6}><Orbiter i={i} /></CameraMotionBlur>
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 0.98 }}>
        <Letters text="Five automations" at={8} style={{ fontSize: 168, color: C.text }} />
        <div style={{ fontSize: 60, color: C.steel, marginTop: 26 }}><Words text="from the first contact until after the deed." at={BEAT + 12} step={2.5} /></div>
      </div>
    </div>
  );
};
