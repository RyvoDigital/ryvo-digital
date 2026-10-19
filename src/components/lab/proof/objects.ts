// The five hero-grade chrome objects (Kie.ai Nano Banana Pro 4K, one light rig,
// cut out locally with BiRefNet; see docs/design/mockups/automations/KIE-LOG.md).
// All five share one square framing, so their relative scale is the render's.
export const OBJECTS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"] as const;
export const OBJECT_VERSION = "v1";
export const OBJECT_SIZES = [480, 800, 1200] as const;

export function objectSrc(i: number, size: (typeof OBJECT_SIZES)[number], ext: "avif" | "webp") {
  return `/media/proof/objects/${OBJECTS[i]}-${OBJECT_VERSION}-${size}.${ext}`;
}

// Each object's turning footage for the vitrine (Seedance 2.5, from its own
// still; 512 px). Round 7: interpolated to 60 fps at its final speed (RIFE),
// alpha-matted frame by frame, as VP9 with alpha (Chrome, Firefox) and HEVC
// with alpha (Safari). Its first frame is the still's pose.
export function clipSrc(i: number) {
  return { webm: `/media/proof/turn/${OBJECTS[i]}-v3.webm`, hevc: `/media/proof/turn/${OBJECTS[i]}-v3.mov` };
}
