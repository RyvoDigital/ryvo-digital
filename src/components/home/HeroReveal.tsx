"use client";

import { useEffect } from "react";

// Hero entrance in pure CSS (globals.css, "Hero intro"): the wordmark rises from
// a soft blur, the phone eases up out of the glow, the headline arrives line by
// line. No script dependency, so it starts the moment the page hydrates. The
// phone (the LCP element) only moves, it never fades.
export default function HeroReveal() {
  useEffect(() => {
    document.querySelector("[data-hero]")?.classList.add("is-in");
  }, []);
  return null;
}
