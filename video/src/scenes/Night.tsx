import { Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Line } from "../parts";
import { BEAT, C, EXPO, EXPO_IN, MONO, SANS, clamp } from "../theme";

// 1 · What agencies face: enquiries arrive at any hour. A clock rolls on into
// the night while messages arrive, one by one, each on a beat.
// Above the caption, around the clock: they never sit behind the words.
const PILLS = [
  { x: -620, y: -200, at: 2 * BEAT, w: 300 },
  { x: 340, y: -250, at: 3 * BEAT, w: 260 },
  { x: -360, y: -40, at: 4 * BEAT, w: 240 },
  { x: 460, y: -60, at: 5 * BEAT, w: 300 },
];

const NightInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mins = Math.round(interpolate(frame, [0, 6 * BEAT], [21 * 60 + 58, 23 * 60 + 47], { ...clamp, easing: EXPO }));
  const time = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
  const leave = interpolate(frame, [8 * BEAT, 9 * BEAT], [1, 0], { ...clamp, easing: EXPO_IN });
  return (
    <>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", opacity: leave }}>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.16em", color: C.silver, fontVariantNumeric: "tabular-nums", opacity: interpolate(frame, [0, BEAT], [0, 1], clamp) }}>{time}</div>
      </div>
      {PILLS.map((p, i) => {
        const s = spring({ frame: frame - p.at, fps, config: { damping: 200, mass: 0.6 } });
        return (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", translate: `${p.x}px ${p.y - 60 + (1 - s) * 28}px`, opacity: s * leave * 0.9, width: p.w, height: 64, borderRadius: 22, background: C.surface2, display: "flex", alignItems: "center", gap: 16, padding: "0 22px" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: C.chrome, flex: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ height: 6, width: "70%", borderRadius: 3, background: "#3a3d42" }} />
              <div style={{ height: 6, width: "45%", borderRadius: 3, background: "#2e3136" }} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 720, width: "100%", textAlign: "center", fontFamily: SANS, fontSize: 96, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1, color: C.text }}>
        <Line at={4 * BEAT} out={8 * BEAT}>Enquiries arrive at any hour.</Line>
      </div>
      <div style={{ position: "absolute", inset: 0, background: C.page, opacity: interpolate(frame, [0, BEAT], [1, 0], { ...clamp, easing: EXPO }), pointerEvents: "none" }} />
    </>
  );
};

export const Night = Interactive.create({ Component: NightInner, layout: "absolute-fill" });
