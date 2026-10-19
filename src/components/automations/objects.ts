// The five hero-grade chrome objects (Kie.ai Nano Banana Pro 4K, one light rig,
// cut out locally with BiRefNet; see docs/design/mockups/automations/KIE-LOG.md).
// All five share one square framing, so their relative scale is the render's.
export const OBJECTS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"] as const;
export const OBJECT_SIZES = [480, 800, 1200] as const;

const M = "/media/automations";

export function objectSrc(i: number, size: (typeof OBJECT_SIZES)[number], ext: "avif" | "webp") {
  return `${M}/objects/${OBJECTS[i]}-${size}.${ext}`;
}

// Each object's turning footage for the vitrine (Seedance 2.5, from its own
// still; 512 px), interpolated to 60 fps at its final speed (RIFE) and
// alpha-matted frame by frame, as VP9 with alpha (Chrome, Firefox) and HEVC
// with alpha (Safari). Its first frame is the still's pose. 04 has no clip:
// its cards swing too far between source frames for any interpolation to stay
// clean, so its still turns smoothly instead.
const HAS_CLIP = [true, true, true, false, true];
export function clipSrc(i: number) {
  return HAS_CLIP[i] ? { webm: `${M}/turn/${OBJECTS[i]}.webm`, hevc: `${M}/turn/${OBJECTS[i]}.mov` } : null;
}
