// Shared by the server (preload) and the client (picture) so both ask for the same files.
export const HERO_SIZES = "(min-width: 1024px) 860px, (min-width: 768px) 740px, 560px";

export const heroSrcSet = (base: string, ext: "avif" | "webp") =>
  [760, 1160, 1640].map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
