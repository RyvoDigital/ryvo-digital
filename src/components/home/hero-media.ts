// The hero art (Kie.ai, Nano Banana Pro, 17 Oct 2026; the phone upright and
// centred, a soft light spread from the upper left): one backlit photo per layout, a silhouette layer cut from it (BiRefNet matte) that sits above the
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
    bg: "/media/hero/hero7-bg", hand: "/media/hero/hero7-hand", widths: [1440, 2160, 2880], w: 5056, h: 3392,
    sizes: "1840px", // the art box is zoomed 1.28× past cover (Hero.module.css --z)
    handBox: [38.845, 22.229, 32.12, 77.771], handWidths: [480, 960, 1440], handSizes: "590px", handW: 1624, handH: 2638,
    corners: { TL: [42.82, 23.496], TR: [57.18, 23.496], BR: [57.18, 71.728], BL: [42.82, 71.728] }, aspect: 2.2534, radius: 0.1555,
  },
  mob: {
    bg: "/media/hero/hero7-bg-m", hand: "/media/hero/hero7-hand-m", widths: [600, 900, 1200], w: 3392, h: 5056,
    sizes: "(min-width: 768px) 950px, 690px",
    handBox: [29.068, 28.758, 56.958, 71.242], handWidths: [320, 640, 960], handSizes: "(min-width: 768px) 540px, 390px", handW: 1932, handH: 3602,
    corners: { TL: [36.409, 29.806], TR: [63.532, 29.806], BR: [63.532, 70.431], BL: [36.409, 70.431] }, aspect: 2.2326, radius: 0.1517,
  },
};

export const DESK_MEDIA = "(min-width: 1024px)";
export const MOB_MEDIA = "(max-width: 1023px)";

export const srcSet = (a: Art, which: "bg" | "hand", ext: "avif" | "webp") =>
  (which === "bg" ? a.widths : a.handWidths).map((w) => `${a[which]}-${w}.${ext} ${w}w`).join(", ");
