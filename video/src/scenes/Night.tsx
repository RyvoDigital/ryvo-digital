import { interpolate } from "remotion";
import { Mercury, Words } from "../parts";
import { BEAT, C, EXPO, MONO, SANS, SINE, clamp, useT } from "../theme";

// 1 · The night. A clock rolls on like an odometer while messages arrive on
// three planes of depth (the far ones soft), the camera pushes in slowly,
// and the words arrive one by one: "Enquiries arrive at any hour."

// One rolling digit: a column 0…n-1,0 that slides to a continuous value.
const Digit = ({ v, base }: { v: number; base: number }) => (
  <span style={{ display: "inline-block", height: "1em", overflow: "hidden", lineHeight: 1 }}>
    <span style={{ display: "flex", flexDirection: "column", translate: `0 ${-(v % base)}em` }}>
      {[...Array(base).keys(), 0].map((d, i) => <span key={i} style={{ height: "1em" }}>{d}</span>)}
    </span>
  </span>
);
// The carry: a column turns over only in the last tenth of its lower column.
const roll = (lower: number, base: number) => Math.max(0, (lower % base) - (base - 1));

const Clock = ({ mins }: { mins: number }) => {
  const m1 = mins % 10;
  const m10 = Math.floor(mins / 10) % 6 + roll(m1, 10);
  const hours = Math.floor(mins / 60) + roll(Math.floor(mins / 10) % 6 + roll(m1, 10), 6);
  const h1 = hours % 10;
  const h10 = Math.floor(hours / 10) + roll(h1, 10);
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <Digit v={h10} base={10} /><Digit v={h1} base={10} /><span style={{ opacity: 0.6, margin: "0 0.06em" }}>:</span><Digit v={m10} base={6} /><Digit v={m1} base={10} />
    </span>
  );
};

// x, y from the centre; z: 0 far (soft, small, slow) … 2 near (sharp, large)
const PILLS = [
  { x: -700, y: -230, z: 0, at: 1, w: 260 },
  { x: 480, y: -300, z: 1, at: 1.5, w: 300 },
  { x: -380, y: -60, z: 2, at: 2, w: 330 },
  { x: 600, y: -40, z: 0, at: 2.5, w: 230 },
  { x: 120, y: -200, z: 1, at: 3, w: 250 },
  { x: -820, y: 40, z: 1, at: 3.5, w: 240 },
  { x: 820, y: -170, z: 2, at: 4, w: 290 },
];

export const Night = () => {
  const frame = useT();
  const fps = 30; // timing in 30-fps units (useT)
  const mins = interpolate(frame, [0, 6 * BEAT], [21 * 60 + 52, 23 * 60 + 47], { ...clamp, easing: EXPO });
  const push = interpolate(frame, [0, 6 * 30], [1, 1.07], { ...clamp, easing: SINE });
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${push}` }}>
      <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", fontFamily: MONO, fontSize: 40, letterSpacing: "0.12em", color: C.silver, fontVariantNumeric: "tabular-nums", opacity: interpolate(frame, [0, BEAT], [0, 1], clamp) }}>
        <Clock mins={mins} />
      </div>
      {PILLS.map((p, i) => {
        const s = interpolate(frame - p.at * BEAT, [0, 30], [0, 1], { ...clamp, easing: EXPO });
        const depth = [0.62, 0.82, 1.06][p.z];
        const drift = (frame / fps) * [8, 18, 34][p.z] * (p.x < 0 ? -1 : 1);
        const blur = [3.2, 1.2, 0][p.z];
        return (
          <div key={i} style={{ position: "absolute", left: "50%", top: "50%", translate: `${p.x * (0.9 + 0.1 * depth) + drift}px ${p.y - 40 + (1 - s) * 34}px`, scale: `${depth}`, opacity: s * [0.45, 0.7, 0.92][p.z], filter: blur ? `blur(${blur}px)` : undefined, width: p.w, height: 66, borderRadius: 22, background: C.surface2, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: C.chrome, flex: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ height: 6, width: "70%", borderRadius: 3, background: "#3a3d42" }} />
              <div style={{ height: 6, width: "45%", borderRadius: 3, background: "#2e3136" }} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", fontFamily: SANS, fontSize: 104, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1, color: C.text }}>
        <Words text="Enquiries arrive at any hour." at={Math.round(3.5 * BEAT)} step={4} />
      </div>
      {/* the mercury line enters: it draws in beneath the words */}
      <Mercury id="night" d="M 600 842 C 800 858, 1120 858, 1320 838" at={Math.round(3.5 * BEAT) + 22} dur={46} />
      <div style={{ position: "absolute", inset: 0, background: C.page, opacity: interpolate(frame, [0, BEAT], [1, 0], { ...clamp, easing: EXPO }), pointerEvents: "none" }} />
    </div>
  );
};
