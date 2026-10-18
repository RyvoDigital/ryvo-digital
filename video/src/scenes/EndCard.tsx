import { interpolate, useCurrentFrame } from "remotion";
import { BEAT, C, EXPO, MONO, SANS, clamp } from "../theme";

// 5 · RYVO. The four letters assemble out of focus, a single sweep of light
// crosses the chrome, the line beneath tightens its tracking into place, and
// the frame goes to black, so the loop returns to the opening without a seam.
export const EndCard = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [Math.round(1.5 * BEAT), Math.round(3.5 * BEAT)], [-30, 130], { ...clamp, easing: EXPO });
  const track = interpolate(frame, [BEAT, 3 * BEAT], [0.62, 0.2], { ...clamp, easing: EXPO });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
        <div style={{ display: "flex", fontFamily: SANS, fontSize: 240, fontWeight: 700, fontStretch: "125%", letterSpacing: "0.04em", lineHeight: 1 }}>
          {"RYVO".split("").map((ch, i) => {
            const t = interpolate(frame, [i * 3, i * 3 + 26], [0, 1], { ...clamp, easing: EXPO });
            return (
              <span key={i} style={{ display: "inline-block", opacity: t, scale: `${1.5 - 0.5 * t}`, filter: t < 0.995 ? `blur(${(1 - t) * 22}px)` : undefined, translate: `${(i - 1.5) * (1 - t) * 60}px 0`,
                backgroundImage: `linear-gradient(105deg, transparent ${sweep - 12 - i * 3}%, rgba(255,255,255,0.6) ${sweep - i * 3}%, transparent ${sweep + 12 - i * 3}%), ${C.chrome}`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{ch}</span>
            );
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: `${track}em`, color: C.silver, opacity: interpolate(frame, [BEAT, 2 * BEAT], [0, 1], clamp), marginRight: `-${track}em` }}>REAL ESTATE AUTOMATIONS</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.page, opacity: interpolate(frame, [5 * BEAT, 7 * BEAT], [0, 1], { ...clamp, easing: EXPO }) }} />
    </>
  );
};
