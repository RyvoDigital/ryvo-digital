import { Img, Interactive, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Hairline, Line } from "../parts";
import { BEAT, C, EXPO, EXPO_IN, MONO, OBJECTS, SANS, clamp } from "../theme";

// 3 · One moment per automation: its object, each with its own motion, then
// its number, name and tagline. 6 beats each.
type Motion = "pop" | "turn" | "slide" | "fan" | "descend";

const AutomationInner = ({ index, title, tagline, motion }: { readonly index: number; readonly title: string; readonly tagline: string; readonly motion: Motion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200, mass: 0.9 } });
  const out = interpolate(frame, [5 * BEAT, 6 * BEAT], [0, 1], { ...clamp, easing: EXPO_IN });
  const e = (from: number, to: number) => interpolate(frame, [0, 28], [from, to], { ...clamp, easing: EXPO });

  // Each object's own way in.
  const objStyle: React.CSSProperties =
    motion === "pop" ? { scale: `${0.62 + 0.38 * s}`, translate: `0 ${(1 - s) * 50}px` }
    : motion === "turn" ? { rotate: `${e(-32, 0)}deg`, scale: `${e(0.82, 1)}` }
    : motion === "slide" ? { translate: `${e(-160, 0)}px ${e(90, 0)}px`, rotate: `${e(12, 0)}deg` }
    : motion === "fan" ? { clipPath: `inset(0 ${e(100, 0)}% 0 0)`, rotate: `${e(-6, 0)}deg` }
    : { translate: `0 ${e(-110, 0)}px` };
  const glow = interpolate(frame, [0, 3 * BEAT], [0, 1], { ...clamp, easing: EXPO });

  return (
    <div style={{ position: "absolute", inset: 0, scale: `${interpolate(frame, [0, 6 * BEAT], [1.035, 1], clamp)}`, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 230, top: 260, width: 680, height: 680, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(205,209,217,0.14), transparent 72%)", opacity: glow }} />
      <Img src={OBJECTS[index]} style={{ position: "absolute", left: 250, top: 270, width: 640, height: 640, objectFit: "contain", opacity: interpolate(frame, [0, 10], [0, 1], clamp), translate: `${-out * 60}px 0`, ...objStyle }} />
      {motion === "descend" && <Hairline at={BEAT} width={360} style={{ position: "absolute", left: 390, top: 935 }} />}
      <div style={{ position: "absolute", left: 1010, top: 400, width: 760, translate: `${-out * 40}px 0` }}>
        <Line at={4} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.16em", color: C.silver }}>0{index + 1} / 05</Line>
        <Line at={BEAT} style={{ fontFamily: SANS, fontSize: 112, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1, color: C.text, marginTop: 26 }}>{title}</Line>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 42, lineHeight: 1.3, letterSpacing: "-0.012em", color: C.body }}>
          <Line at={2 * BEAT}>{tagline}</Line>
        </div>
      </div>
    </div>
  );
};

export const Automation = Interactive.create({ Component: AutomationInner, layout: "absolute-fill" });
