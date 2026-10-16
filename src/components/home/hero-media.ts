// The hero art (Kie.ai, Nano Banana Pro, 17 Oct 2026; the phone upright and
// centred): one backlit photo per layout, a silhouette layer cut from it (BiRefNet matte) that sits above the
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
    bg: "/media/hero/hero6-bg", hand: "/media/hero/hero6-hand", widths: [1440, 2160, 2880], w: 5056, h: 3392,
    sizes: "1440px",
    handBox: [26.859, 17.925, 36.808, 82.075], handWidths: [480, 960, 1440], handSizes: "520px", handW: 1861, handH: 2784,
    corners: { TL: [40.902, 19.517], TR: [59.098, 19.517], BR: [59.098, 78.833], BL: [40.902, 78.833] }, aspect: 2.187, radius: 0.1469,
  },
  mob: {
    bg: "/media/hero/hero6-bg-m", hand: "/media/hero/hero6-hand-m", widths: [600, 900, 1200], w: 3392, h: 5056,
    sizes: "(min-width: 768px) 740px, 540px",
    handBox: [14.682, 28.461, 56.309, 71.539], handWidths: [320, 640, 960], handSizes: "(min-width: 768px) 420px, 300px", handW: 1910, handH: 3617,
    corners: { TL: [37.028, 29.47], TR: [63.267, 29.47], BR: [63.267, 68.592], BL: [37.028, 68.592] }, aspect: 2.2225, radius: 0.1628,
  },
};

export const DESK_MEDIA = "(min-width: 1024px)";
export const MOB_MEDIA = "(max-width: 1023px)";

export const srcSet = (a: Art, which: "bg" | "hand", ext: "avif" | "webp") =>
  (which === "bg" ? a.widths : a.handWidths).map((w) => `${a[which]}-${w}.${ext} ${w}w`).join(", ");
