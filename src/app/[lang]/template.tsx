"use client";

import { useEffect, useState, type AnimationEvent, type ReactNode } from "react";

// Between pages, the new page fades in (300 ms, the calm ease): never on the
// first load (the homepage intro and the largest paint stay as they are), and
// never a fade-out first, so a click is never slower. Opacity only, so the
// fixed bars keep the viewport; the class comes off once it has played, so no
// layer or stacking context outlives it.
let hydrated = false;

export default function Template({ children }: { children: ReactNode }) {
  const [fade, setFade] = useState(() => hydrated);
  useEffect(() => { hydrated = true; }, []);
  const done = (e: AnimationEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) setFade(false); };
  return <div className={fade ? "page-in" : undefined} onAnimationEnd={fade ? done : undefined}>{children}</div>;
}
