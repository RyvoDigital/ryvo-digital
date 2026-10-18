import { Img, interpolate } from "remotion";
import { Line, Mercury, Words } from "../parts";
import { C, EXPO, EXPO_IN, MONO, OBJECTS, SANS, SINE, clamp, useT } from "../theme";

// 4 · How we work: the slower breath. Four statements, each racked into focus
// and out again, over one far, defocused chrome object drifting behind the
// type (depth, not decoration). The label stays; four ticks mark the place.
// Each statement holds for at least 0.4 s a word plus 1 s (in 30-fps units).
const ITEMS = [
  { lines: ["We adapt each one to how", "your agency already works."], obj: 1, s: 5.4 },
  { lines: ["We run it for you", "on a monthly retainer."], obj: 3, s: 5.0 },
  { lines: ["Price and negotiation", "always stay with your team."], obj: 0, s: 4.6 },
  { lines: ["It always says", "it is an AI."], obj: 2, s: 4.4 },
];
const LEAD = 0.7 * 30; // the first statement begins as the mercury clears
const START = ITEMS.map((_, k) => LEAD + ITEMS.slice(0, k).reduce((a, it) => a + it.s * 30, 0));
export const HOW_SECONDS = LEAD / 30 + ITEMS.reduce((a, it) => a + it.s, 0) + 0.7;

export const HowWeWork = () => {
  const frame = useT();
  // The camera never rests: one slow push across all four statements.
  const push = interpolate(frame, [0, HOW_SECONDS * 30], [1, 1.045], { ...clamp, easing: SINE });
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${push}` }}>
      {ITEMS.map((it, k) => {
        const at = START[k];
        const EACH = it.s * 30;
        const local = frame - at;
        if (local < -20 || local > EACH + 30) return null;
        const inF = interpolate(local, [0, 30], [0, 1], { ...clamp, easing: EXPO });
        // One idea at a time: each statement has left before the next arrives.
        const outF = k === ITEMS.length - 1 ? 0 : interpolate(local, [EACH - 26, EACH - 2], [0, 1], { ...clamp, easing: EXPO_IN });
        const pull = (1 - inF) * 18 + outF * 22; // the rack focus
        return (
          <div key={k} style={{ position: "absolute", inset: 0 }}>
            <Img src={OBJECTS[it.obj]} style={{ position: "absolute", left: k % 2 ? 1160 : 80, top: 260, width: 760, height: 760, objectFit: "contain", opacity: 0.22 * inF * (1 - outF), filter: "blur(26px)", translate: `${interpolate(local, [0, EACH], [k % 2 ? 60 : -60, k % 2 ? -60 : 60])}px ${interpolate(local, [0, EACH], [30, -30])}px` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", fontFamily: SANS, fontSize: 108, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1.04, color: C.text, filter: pull > 0.05 ? `blur(${pull}px)` : undefined, scale: `${1.05 - 0.05 * inF + outF * 0.04}`, opacity: inF * (1 - outF) }}>
              {it.lines.map((l, i) => <div key={l}><Words text={l} at={at + 2 + i * 8} step={2.5} /></div>)}
            </div>
            {/* the mercury line draws beneath each statement, and recedes with it */}
            <Mercury id={`how${k}`} d="M 700 752 C 860 760, 1060 760, 1220 748" at={at + 22} dur={40} out={k === ITEMS.length - 1 ? undefined : at + EACH - 28} width={2.2} opacity={inF} />
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 250, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <Line at={0} style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.18em", color: C.silver }}>HOW WE WORK</Line>
        <div style={{ display: "flex", gap: 10 }}>
          {ITEMS.map((_, k) => <span key={k} style={{ width: 34, height: 2, borderRadius: 1, background: C.silver, opacity: frame >= START[k] ? 0.85 : 0.2 }} />)}
        </div>
      </div>
    </div>
  );
};
