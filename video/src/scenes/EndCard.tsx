import { interpolate } from "remotion";
import { BEAT, C, EXPO, MONO, SANS, SINE, clamp, useT } from "../theme";
import { Mercury } from "../parts";

// 5 · RYVO. The four letters assemble out of focus, a single sweep of light
// crosses the chrome, the line beneath tightens its tracking into place, and
// the frame goes to black, so the loop returns to the opening without a seam.
export const EndCard = () => {
  const frame = useT();
  const sweep = interpolate(frame, [Math.round(1.5 * BEAT), Math.round(3.5 * BEAT)], [-30, 130], { ...clamp, easing: EXPO });
  const track = interpolate(frame, [BEAT, 3 * BEAT], [0.62, 0.2], { ...clamp, easing: EXPO });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, scale: `${interpolate(frame, [0, 4.6 * 30], [1.03, 1], { ...clamp, easing: SINE })}` }}>
      {/* the mercury line's last stroke: one sweep beneath the wordmark */}
      <Mercury id="end" d="M 700 796 C 860 812, 1080 812, 1240 790 C 1258 787, 1270 782, 1280 774" at={Math.round(1.2 * BEAT)} dur={48} width={2.6} />
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
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.page, opacity: interpolate(frame, [3.2 * 30, 4.5 * 30], [0, 1], { ...clamp, easing: EXPO }) }} />
    </>
  );
};
