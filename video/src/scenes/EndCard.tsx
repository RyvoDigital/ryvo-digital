import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { Line } from "../parts";
import { BEAT, C, EXPO, MONO, SANS, clamp } from "../theme";

// 5 · The end card: the RYVO wordmark in chrome, then black, so the loop
// returns to the opening frame without a seam.
const EndCardInner = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [BEAT, 4 * BEAT], [-30, 130], { ...clamp, easing: EXPO });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <Line at={0}>
          <span style={{ display: "block", fontFamily: SANS, fontSize: 230, fontWeight: 700, fontStretch: "125%", letterSpacing: "0.04em", lineHeight: 1, backgroundImage: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,255,255,0.55) ${sweep}%, transparent ${sweep + 12}%), ${C.chrome}`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>RYVO</span>
        </Line>
        <Line at={BEAT} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.2em", color: C.silver }}>REAL ESTATE AUTOMATIONS</Line>
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.page, opacity: interpolate(frame, [5 * BEAT, 7 * BEAT], [0, 1], { ...clamp, easing: EXPO }) }} />
    </>
  );
};

export const EndCard = Interactive.create({ Component: EndCardInner, layout: "absolute-fill" });
