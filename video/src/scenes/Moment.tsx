import { Video } from "@remotion/media";
import { interpolate, useCurrentFrame } from "remotion";
import { Letters, Line, Words } from "../parts";
import { BEAT, C, CLIPS, EXPO, MONO, SANS, clamp } from "../theme";
import { Chrome3D } from "./Chrome3D";

// 3 · One moment per automation, 6 beats: the object in motion (its own
// footage, or 03 and 05 in 3D) arrives out of focus and sharpens in front of
// its own giant numeral; light sweeps over it; the name rises letter by
// letter and the tagline arrives word by word. A slow push throughout.

const OBJ = 700; // the object's box on screen

// A name on at most two lines, split at its middle word.
const lines = (t: string) => {
  const w = t.split(" ");
  const k = Math.ceil(w.length / 2);
  return w.length < 2 ? w : [w.slice(0, k).join(" "), w.slice(k).join(" ")];
};

export const Moment = ({ index, title, tagline }: { index: number; title: string; tagline: string }) => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [0, 16], [14, 0], { ...clamp, easing: EXPO });
  const push = interpolate(frame, [0, 6 * BEAT], [0.94, 1.04]);
  const drift = interpolate(frame, [0, 6 * BEAT], [24, -24]);
  const sweep = interpolate(frame, [BEAT + 6, 3 * BEAT + 6], [-40, 140], clamp);
  const num = `0${index + 1}`;
  const clip = CLIPS[index];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the numeral, far behind: it drifts the other way (parallax) */}
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontSize: 820, fontWeight: 600, fontStretch: "125%", letterSpacing: "-0.06em", lineHeight: 0.8, color: "transparent", WebkitTextStroke: "2px rgba(205,209,217,0.16)", translate: `${-drift * 1.6}px 0`, opacity: interpolate(frame, [0, 14], [0, 1], clamp) }}>
        <Letters text={num} at={0} step={3} />
      </div>
      <div style={{ position: "absolute", left: 210, top: 250, width: OBJ, height: OBJ, scale: `${push}`, translate: `${drift}px 0`, filter: focus > 0.05 ? `blur(${focus}px)` : undefined, opacity: interpolate(frame, [0, 8], [0, 1], clamp) }}>
        {clip && <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(205,209,217,0.13), transparent 72%)" }} />}
        {clip ? (
          <Video src={clip} loop muted objectFit="contain" style={{ position: "absolute", inset: 0, width: OBJ, height: OBJ, mixBlendMode: "lighten", maskImage: "radial-gradient(closest-side, #000 78%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 78%, transparent)" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0 }}><Chrome3D which={index === 2 ? "key" : "pen"} size={OBJ} /></div>
        )}
        {/* a band of light passing over the object */}
        <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none", maskImage: "radial-gradient(closest-side, #000 55%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 55%, transparent)", background: `linear-gradient(115deg, transparent ${sweep - 14}%, rgba(240,242,246,0.16) ${sweep}%, transparent ${sweep + 14}%)` }} />
      </div>
      <div style={{ position: "absolute", left: 1010, top: 390, width: 800, translate: `${drift * 0.5}px 0` }}>
        <Line at={6} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.16em", color: C.silver }}>{num} / 05</Line>
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 112, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1, color: C.text }}>
          {lines(title).map((w, i) => <div key={i}><Letters text={w} at={10 + i * 7} step={1.3} /></div>)}
        </div>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 40, lineHeight: 1.3, letterSpacing: "-0.012em", color: C.body }}>
          <Words text={tagline} at={2 * BEAT} step={1.6} />
        </div>
      </div>
    </div>
  );
};
