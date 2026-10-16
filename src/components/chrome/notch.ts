// The hero card's top notch: a concave cut-out with rounded inner corners, in
// the card's radius language. It is built from three mask pieces (two rounded
// caps and a straight middle) placed by one width, --W, so it can widen smoothly
// when the links open into words.

export const NOTCH = { h: 66, r: 24 };

// The viewport width from which the notch clears the language switch and Book
// (measured: below it the right-hand cluster runs into the notch).
export const NOTCH_AT: Record<string, "1280" | "1440"> = { en: "1280", pt: "1440", es: "1440" };

// First-paint widths of the whole notch (icons only, and open with labels);
// NotchNav measures the real ones once the fonts are in.
export const NOTCH_W_CLOSED = 286;
export const NOTCH_W_OPEN: Record<string, number> = { en: 620, pt: 680, es: 760 };

const { h, r } = NOTCH;

// One cap of the notch, 2r wide: the fillet from the card's top edge, the side,
// the rounded inner corner. Filled for the mask, open for the hairline edge.
export function capPath(side: "left" | "right", closed: boolean) {
  const d = side === "left"
    ? `M0 0 Q${r} 0 ${r} ${r} L${r} ${h - r} Q${r} ${h} ${2 * r} ${h}`
    : `M${2 * r} 0 Q${r} 0 ${r} ${r} L${r} ${h - r} Q${r} ${h} 0 ${h}`;
  return closed ? `${d} L${side === "left" ? 2 * r : 0} 0 Z` : d;
}

export function capMaskUrl(side: "left" | "right") {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${2 * r}' height='${h}' viewBox='0 0 ${2 * r} ${h}'><path d='${capPath(side, true)}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
