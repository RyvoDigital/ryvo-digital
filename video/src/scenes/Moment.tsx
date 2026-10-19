import { interpolate, OffthreadVideo } from "remotion";
import { Bokeh, Letters, Line, Mercury, Words } from "../parts";
import { C, CLIPS, EXPO, MONO, SANS, SINE, clamp, useT } from "../theme";

// 3 · One moment per automation: the object in motion (its own footage, as a
// clean alpha cut-out, slowed to 0.6×) arrives out of focus and sharpens in
// front of its own giant numeral; the mercury line circles it as a ring of
// light, then passes beneath its name; the name rises letter
// by letter and the tagline arrives word by word. A slow push throughout.
// Each moment is long enough to read its tagline calmly (BrandFilm.tsx).

const OBJ = 640; // the object's box on screen (composition px; 853 px at 2560)

// A name on at most two lines, split at its middle word (or where its copy
// sets a "\n").
const lines = (t: string) => {
  if (t.includes("\n")) return t.split("\n");
  const w = t.split(" ");
  const k = Math.ceil(w.length / 2);
  return w.length < 2 ? w : [w.slice(0, k).join(" "), w.slice(k).join(" ")];
};

export const Moment = ({ index, title, tagline, seconds }: { index: number; title: string; tagline: string; seconds: number }) => {
  const frame = useT();
  const len = seconds * 30; // the moment's length, in 30-fps units
  const focus = interpolate(frame, [0, 16], [14, 0], { ...clamp, easing: EXPO });
  // The camera never rests: a slow push and drift, eased with weight.
  const push = interpolate(frame, [0, len], [0.95, 1.035], { ...clamp, easing: SINE });
  const drift = interpolate(frame, [0, len], [22, -22], { ...clamp, easing: SINE });
  const num = `0${index + 1}`;
  const clip = CLIPS[index];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Bokeh seed={`m${index}`} count={7} />
      {/* the numeral, far behind: it drifts the other way (parallax) */}
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontSize: 820, fontWeight: 600, fontStretch: "125%", letterSpacing: "-0.06em", lineHeight: 0.8, color: "transparent", WebkitTextStroke: "2px rgba(205,209,217,0.16)", translate: `${-drift * 1.6}px 0`, opacity: interpolate(frame, [0, 14], [0, 1], clamp) }}>
        <Letters text={num} at={0} step={3} />
      </div>
      <div style={{ position: "absolute", left: 240, top: 280, width: OBJ, height: OBJ, scale: `${push}`, translate: `${drift}px 0`, filter: focus > 0.05 ? `blur(${focus}px)` : undefined, opacity: interpolate(frame, [0, 8], [0, 1], clamp) }}>
        {/* The cut-out, with a rim of light on its edges and a soft glow
            behind it, both following its own silhouette. (Not a CSS radial
            gradient: under a transparent video, headless Chrome composites one
            as a bright banded disc.) */}
        <OffthreadVideo src={clip} transparent muted playbackRate={0.6} style={{ position: "absolute", inset: 0, width: OBJ, height: OBJ, objectFit: "contain", filter: "drop-shadow(0 0 1.2px rgba(240,242,246,0.42)) drop-shadow(0 0 34px rgba(205,209,217,0.2))" }} />
        {/* the mercury line, circling the object as a ring of light */}
        <Mercury id={`ring${index}`} mode="comet" d={`M ${-40} ${OBJ * 0.62} A ${OBJ * 0.56} ${OBJ * 0.15} -10 1 0 ${OBJ + 40} ${OBJ * 0.5} A ${OBJ * 0.56} ${OBJ * 0.15} -10 1 0 ${-40} ${OBJ * 0.62}`} at={14} dur={30} seg={0.32} speed={0.006} width={2.6} style={{ inset: "auto", left: 0, top: 0, width: 1920, height: 1200 }} />
      </div>
      {/* the mercury line passes beneath the name (two lines tall in every moment) */}
      <div style={{ position: "absolute", inset: 0, translate: `${drift * 0.5}px 0` }}>
        <Mercury id={`under${index}`} d="M 1012 688 C 1180 694, 1420 694, 1600 684" at={30} dur={44} width={2.2} />
      </div>
      <div style={{ position: "absolute", left: 1010, top: 390, width: 800, translate: `${drift * 0.5}px 0` }}>
        <Line at={6} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.16em", color: C.silver }}>{num} / 05</Line>
        <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 112, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1, color: C.text }}>
          {lines(title).map((w, i) => <div key={i}><Letters text={w} at={10 + i * 7} step={1.3} /></div>)}
        </div>
        <div style={{ marginTop: 34, fontFamily: SANS, fontSize: 40, lineHeight: 1.3, letterSpacing: "-0.012em", color: C.body }}>
          <Words text={tagline} at={27} step={1.8} />
        </div>
      </div>
    </div>
  );
};
