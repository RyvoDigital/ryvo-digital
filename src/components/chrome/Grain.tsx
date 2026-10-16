"use client";

import { useEffect, useState } from "react";

// A 2–3% film grain over the whole page so the black reads as material. One tiny
// pre-rendered noise tile, nudged in steps; static with reduced motion. It loads
// after the page has, so it never competes with the hero image.
export default function Grain() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const go = () => setOn(true);
    if (document.readyState === "complete") { const id = window.setTimeout(go, 0); return () => clearTimeout(id); }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-[0.035]" style={{ mixBlendMode: "overlay" }}>
      {on && <div className="absolute -inset-[50%] motion-safe:animate-[grain_0.9s_steps(6)_infinite]" style={{ backgroundImage: "url(/media/noise.webp)" }} />}
      <style>{`@keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}`}</style>
    </div>
  );
}
