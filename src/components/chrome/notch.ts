// The hero card's top notch: a concave cut-out with rounded inner corners, in
// the card's radius language. One path serves the mask (filled) and the hairline
// edge (stroked, open at the top).

export const NOTCH = { h: 66, r: 24 };

// Width of the notch per language (the four links plus padding).
export const NOTCH_W: Record<string, number> = { en: 430, pt: 490, es: 550 };

// The viewport width from which the notch clears the language switch and Book
// (measured: below it the right-hand cluster runs into the notch).
export const NOTCH_AT: Record<string, "1280" | "1440"> = { en: "1280", pt: "1440", es: "1440" };

export function notchPath(w: number, h = NOTCH.h, r = NOTCH.r, closed = true) {
  const W = w + 2 * r;
  const d = [
    `M0 0`,
    `Q${r} 0 ${r} ${r}`, // concave fillet from the card's top edge into the notch
    `L${r} ${h - r}`,
    `Q${r} ${h} ${2 * r} ${h}`, // rounded inner corner
    `L${w} ${h}`,
    `Q${r + w} ${h} ${r + w} ${h - r}`,
    `L${r + w} ${r}`,
    `Q${r + w} 0 ${W} 0`,
  ].join(" ");
  return closed ? `${d} Z` : d;
}

export function notchMaskUrl(w: number) {
  const W = w + 2 * NOTCH.r;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${NOTCH.h}' viewBox='0 0 ${W} ${NOTCH.h}'><path d='${notchPath(w)}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
