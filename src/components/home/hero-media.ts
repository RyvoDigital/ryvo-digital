// The hero art (Kie.ai, Nano Banana Pro, 16 Oct 2026): one backlit photo per
// layout, a silhouette layer cut from it (BiRefNet matte) that sits above the
// glass wordmark, and the phone screen's four corners (% of the image, fitted
// with a minimum-area rectangle), its height ÷ width and its corner radius.
// Shared by the server (preload) and the client so both ask for the same files.

export type Art = {
  bg: string; hand: string; widths: number[]; w: number; h: number; sizes: string;
  // The silhouette layer is cropped to the hand's own box (% of the photo), so it
  // is small, and never the largest paint: the photo stays the LCP element.
  handBox: [number, number, number, number]; handWidths: number[]; handSizes: string; handW: number; handH: number;
  corners: { TL: [number, number]; TR: [number, number]; BR: [number, number]; BL: [number, number] };
  aspect: number; radius: number;
};

export const ART: Record<"desk" | "mob", Art> = {
  desk: {
    bg: "/media/hero/hero-bg", hand: "/media/hero/hero-hand", widths: [1440, 2160, 2880], w: 5056, h: 3392,
    sizes: "1440px",
    handBox: [42.603, 17.718, 33.722, 82.282], handWidths: [480, 960, 1440], handSizes: "480px", handW: 1705, handH: 2791,
    corners: { TL: [53.543, 24.261], TR: [66.166, 18.224], BR: [74.824, 58.447], BL: [62.2, 64.483] }, aspect: 2.1376, radius: 0.1862,
  },
  mob: {
    bg: "/media/hero/hero-bg-m", hand: "/media/hero/hero-hand-m", widths: [600, 900, 1200], w: 3392, h: 5056,
    sizes: "(min-width: 768px) 740px, 540px",
    handBox: [16.215, 28.204, 59.935, 71.796], handWidths: [320, 640, 960], handSizes: "(min-width: 768px) 440px, 324px", handW: 2033, handH: 3630,
    corners: { TL: [29.996, 33.259], TR: [56.755, 28.597], BR: [72.377, 68.96], BL: [45.617, 73.622] }, aspect: 2.2483, radius: 0.1738,
  },
};

export const DESK_MEDIA = "(min-width: 1024px)";
export const MOB_MEDIA = "(max-width: 1023px)";

export const srcSet = (a: Art, which: "bg" | "hand", ext: "avif" | "webp") =>
  (which === "bg" ? a.widths : a.handWidths).map((w) => `${a[which]}-${w}.${ext} ${w}w`).join(", ");
