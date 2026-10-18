import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

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

// Every change lands on a beat: an imagined 106 bpm, one beat every 17 frames
// at 30 fps. The five moments cut fast; "how we work" breathes slower.
export const BEAT = 17;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const OBJECTS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"].map((n) => staticFile(`objects/${n}-v1-1200.webp`));

// Real footage (Seedance 2.5, image-to-video from the stills; each loops) for
// three objects; 03 and 05 are modelled in 3D (scenes/Chrome3D.tsx).
export const CLIPS: Record<number, string> = {
  0: staticFile("clips/01-concierge.mp4"),
  1: staticFile("clips/02-reactivation.mp4"),
  3: staticFile("clips/04-launch.mp4"),
};
