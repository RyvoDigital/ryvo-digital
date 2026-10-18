import { loadFont } from "@remotion/fonts";
import { Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Obsidian & Mercury (docs/design/DESIGN-BRIEF.md): the same palette, type and
// motion family as the site. Archivo is loaded as its variable font, so the
// display cut can use the width axis (112–125%) exactly as the site does.
loadFont({ family: "Archivo", url: staticFile("fonts/Archivo-wdth-wght.ttf"), weight: "100 900", stretch: "62% 125%" });
loadFont({ family: "Geist Mono", url: staticFile("fonts/GeistMono-wght.ttf"), weight: "100 900" });

export const C = {
  page: "#07080a",
  surface: "#131418",
  surface2: "#1c1e22",
  line: "#24272b",
  silver: "#cdd1d9",
  steel: "#7e838b",
  text: "#f1f2f4",
  body: "#c4c8ce",
  chrome: "linear-gradient(135deg, #fafbfc 0%, #a9aeb6 38%, #eef0f2 58%, #8e939b 100%)",
};

export const SANS = "Archivo, Arial, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, monospace";

// One easing family, as on the site: a soft expo-out; nothing bounces.
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EXPO_INOUT = Easing.bezier(0.87, 0, 0.13, 1);
// The camera's ease: a slow push or drift that starts and ends with weight.
export const SINE = Easing.inOut(Easing.sin);

// Round 6: rendered at 60 fps. All animation timing is written in 30-fps
// units (useT), so every move simply gets twice as many, smoother samples;
// scene lengths are set in seconds (SEC), long enough to read every caption
// calmly (at least 0.4 s a word plus 1 s, never under 2.5 s).
export const BEAT = 17; // a beat, in 30-fps units
export const useT = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return (f * 30) / fps; };
export const SEC = (s: number, fps: number) => Math.round(s * fps);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const OBJECTS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"].map((n) => staticFile(`objects/${n}-v1-1200.webp`));

// Real footage for all five (Seedance 2.5, image-to-video from the stills;
// each begins and ends on its still, so it loops). See KIE-LOG.md. Round 6:
// each is alpha-matted frame by frame (BiRefNet, alpha blended with its
// neighbours, colour un-premultiplied from the black), so it composites as a
// clean cut-out: no box, no halo, no shadow.
export const CLIPS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"].map((n) => staticFile(`clips-alpha/${n}.webm`));
