import { Img, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Line } from "../parts";
import { BEAT, C, EXPO_IN, OBJECTS, SANS, clamp } from "../theme";

// 2 · Ryvo: five automations, from the first contact until after the deed.
const IntroInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const leave = interpolate(frame, [7 * BEAT, 8 * BEAT], [1, 0], { ...clamp, easing: EXPO_IN });
  return (
    <>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 0.98 }}>
        <Line at={0} out={7 * BEAT} style={{ fontSize: 150, color: C.text }}>Five automations</Line>
        <Line at={BEAT} out={7 * BEAT} style={{ fontSize: 64, color: C.steel, marginTop: 18 }}>from the first contact until after the deed.</Line>
      </div>
      <div style={{ position: "absolute", top: 690, width: "100%", display: "flex", justifyContent: "center", gap: 56, opacity: leave }}>
        {OBJECTS.map((src, i) => {
          const s = spring({ frame: frame - (3 * BEAT + i * 4), fps, config: { damping: 200, mass: 0.7 } });
          return <Img key={src} src={src} style={{ width: 170, height: 170, objectFit: "contain", opacity: s, translate: `0 ${(1 - s) * 40}px` }} />;
        })}
      </div>
    </>
  );
};

export const Intro = Interactive.create({ Component: IntroInner, layout: "absolute-fill" });
