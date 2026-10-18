import { Interactive, useCurrentFrame } from "remotion";
import { Line } from "../parts";
import { BEAT, C, MONO, SANS } from "../theme";

// 4 · How we work: one short statement at a time, centred, landing on a beat.
const StatementInner = ({ label, lines }: { readonly label: string; readonly lines: string[] }) => {
  useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 34 }}>
      <Line at={0} out={3 * BEAT} style={{ fontFamily: MONO, fontSize: 24, letterSpacing: "0.18em", color: C.silver }}>{label}</Line>
      <div style={{ fontFamily: SANS, fontSize: 104, fontWeight: 500, fontStretch: "112%", letterSpacing: "-0.045em", lineHeight: 1.02, color: C.text, maxWidth: 1500 }}>
        {lines.map((l, i) => <Line key={l} at={4 + i * 5} out={3 * BEAT + i * 3}>{l}</Line>)}
      </div>
    </div>
  );
};

export const Statement = Interactive.create({ Component: StatementInner, layout: "absolute-fill" });
