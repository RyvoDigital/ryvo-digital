"use client";

import { preload } from "react-dom";
import { ART, DESK_MEDIA, MOB_MEDIA, srcSet } from "./hero-media";

// The hero photo is the LCP element: fetch the one for this layout first, at
// high priority. (The silhouette layer is small and follows at normal
// priority.) A client component on purpose: its server render puts these
// hints in the homepage's head as before, while a page that prefetches the
// homepage gets only a reference to it, so the photo is no longer fetched for
// nothing on every page that links home.
export default function HeroPreload() {
  for (const [a, media] of [[ART.desk, DESK_MEDIA], [ART.mob, MOB_MEDIA]] as const) {
    preload(`${a.bg}-${a.widths[1]}.avif`, {
      as: "image", type: "image/avif", fetchPriority: "high", media,
      imageSrcSet: srcSet(a, "bg", "avif"), imageSizes: a.sizes,
    });
  }
  return null;
}
