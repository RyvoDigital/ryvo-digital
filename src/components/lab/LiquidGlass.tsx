"use client";

import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import g from "./glass.module.css";

// One glass system for every piece (RESEARCH.md §B, round 2).
//
// Refraction comes from a lens map drawn per element from its own size and
// corner radius: a smooth convex bezel, zero in the flat centre and rising
// toward the rim, so the centre stays perfectly clear and the backdrop bends
// only near the edge (ref 01). It is applied with backdrop-filter: url(#…),
// in Chromium only, and only while the element is on screen. Safari and
// Firefox keep the rest (tint, bevel, speculars, inner glow, caustic), so they
// still read as clean glass, just without the bend.

export type GlassVariant = "clear" | "smoked";

type Props = {
  as?: "div" | "article" | "section" | "nav" | "button" | "aside" | "span";
  variant?: GlassVariant;
  className?: string;
  style?: CSSProperties;
  /** Background blur in px. Clear controls 0–1, smoked cards ~2. */
  blur?: number;
  /** Strength of the edge bend (1 = default). */
  refract?: number;
  /** Uniform magnification across the face (a thick lens), 0–0.3. */
  magnify?: number;
  /** No caustic pool or contact shadow (glass inside glass). */
  flat?: boolean;
  /** Speculars drift toward a fine pointer. */
  pointer?: boolean;
  children?: ReactNode;
} & Record<string, unknown>;

let chromium: boolean | null = null;
export function isChromium() {
  if (chromium === null) {
    // backdrop-filter: url() renders in Chromium only. WebKit parses it but
    // draws nothing; Firefox ignores it. iOS Chrome (CriOS) is WebKit.
    const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
    chromium = /Chrome\/\d/.test(ua) && !/CriOS|FxiOS/.test(ua);
  }
  return chromium;
}

const maps = new Map<string, string>();

/** The lens map: red/green hold the x/y displacement (0.5 = none). */
export function lensMap(w: number, h: number, r: number, bezel: number, magnify: number, taper = false) {
  const key = `${w}|${h}|${r}|${bezel}|${magnify}|${taper}`;
  const hit = maps.get(key);
  if (hit) return hit;
  const res = Math.min(1, Math.sqrt(90000 / (w * h)));
  const W = Math.max(8, Math.round(w * res)), H = Math.max(8, Math.round(h * res));
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const bx = w / 2, by = h / 2, rr = Math.min(r, bx, by);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = ((x + 0.5) / W) * w - bx, py = ((y + 0.5) / H) * h - by;
      // Signed distance to the rounded rectangle, and its outward normal.
      const qx = Math.abs(px) - (bx - rr), qy = Math.abs(py) - (by - rr);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), ol = Math.hypot(ox, oy);
      const sd = ol + Math.min(Math.max(qx, qy), 0) - rr;
      let nx: number, ny: number;
      if (qx > 0 && qy > 0) { nx = (ox / ol) * Math.sign(px); ny = (oy / ol) * Math.sign(py); }
      else if (qx > qy) { nx = Math.sign(px); ny = 0; }
      else { nx = 0; ny = Math.sign(py); }
      let dx = 0, dy = 0;
      if (sd < 0) {
        // A circular-arc bezel: flat inside, curving down to the rim.
        const t = Math.min(1, -sd / bezel), u = 1 - t;
        // taper: a crystal bevel, zero at the rim and on the face, peaking a
        // third of the way in, so the backdrop stays continuous at the edge.
        const m = taper ? Math.sin(Math.PI * Math.pow(t, 0.75)) : 1 - Math.sqrt(Math.max(0, 1 - u * u));
        dx = -nx * m - (px / bx) * magnify;
        dy = -ny * m - (py / by) * magnify;
      }
      const i = (y * W + x) * 4;
      img.data[i] = Math.round(128 + 127 * Math.max(-1, Math.min(1, dx)));
      img.data[i + 1] = Math.round(128 + 127 * Math.max(-1, Math.min(1, dy)));
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = cv.toDataURL();
  maps.set(key, url);
  return url;
}

export function LiquidGlass({ as: Tag = "div", variant = "smoked", className = "", style, blur, refract = 1, magnify = 0, flat = false, pointer = true, children, ...rest }: Props) {
  const root = useRef<HTMLElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const fe = useRef<SVGFEImageElement>(null);
  const filt = useRef<SVGFilterElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const id = `lg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const b = blur ?? (variant === "clear" ? 0.6 : 2);

  useEffect(() => {
    const el = root.current, ln = lens.current;
    if (!el || !ln) return;
    const base = `blur(${b}px) saturate(${variant === "clear" ? 1.08 : 1.2})`;
    const refracts = isChromium() && refract > 0;
    let live = false, ready = false, last = "";

    const apply = () => {
      // Chromium treats -webkit-backdrop-filter as an alias, so it gets only
      // the unprefixed property (setting both would drop the lens).
      if (refracts) ln.style.setProperty("backdrop-filter", live && ready ? `url(#${id}) ${base}` : base);
      else { ln.style.setProperty("backdrop-filter", base); ln.style.setProperty("-webkit-backdrop-filter", base); }
    };

    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const m = Math.min(w, h);
      // The bevel band reads as thickness; the lens zone is wider, so the bend
      // starts inside the band and is strongest right at the rim.
      const band = Math.round(Math.min(10, Math.max(5, m * 0.14)));
      const bezel = Math.round(Math.min(30, Math.max(10, m * 0.3)));
      el.style.setProperty("--band", `${band}px`);
      el.style.setProperty("--r", `${r}px`);
      if (!refracts) return;
      const key = `${w}|${h}|${r}`;
      if (key === last || !live) return;
      last = key;
      fe.current?.setAttribute("href", lensMap(w, h, Math.round(r), bezel, magnify));
      fe.current?.setAttribute("width", String(w));
      fe.current?.setAttribute("height", String(h));
      filt.current?.setAttribute("width", String(w));
      filt.current?.setAttribute("height", String(h));
      disp.current?.setAttribute("scale", String(Math.round(bezel * 0.9 * refract)));
      ready = true;
      apply();
    };

    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live) measure(); apply(); }, { rootMargin: "200px 0px" });
    io.observe(el);
    measure();
    apply();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [id, b, variant, refract, magnify]);

  // Speculars drift a few px toward a fine pointer; calm, and off with reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || !pointer || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    return withMotion(({ gsap }) => {
      const p = { x: 0, y: 0 };
      const paint = () => { el.style.setProperty("--hx", `${p.x.toFixed(2)}px`); el.style.setProperty("--hy", `${p.y.toFixed(2)}px`); };
      const qx = gsap.quickTo(p, "x", { duration: 0.8, ease: "expo.out", onUpdate: paint });
      const qy = gsap.quickTo(p, "y", { duration: 0.8, ease: "expo.out", onUpdate: paint });
      const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); qx(((e.clientX - r.left) / r.width - 0.5) * 6); qy(((e.clientY - r.top) / r.height - 0.5) * 3); };
      const leave = () => { qx(0); qy(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
    });
  }, [pointer]);

  const T = Tag as "div";
  return (
    <T ref={root as React.Ref<HTMLDivElement>} className={`${g.lg} ${g[variant]} ${flat ? g.flat : ""} ${className}`} style={style} {...rest}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute", pointerEvents: "none" }}>
        <filter ref={filt} id={id} x="0" y="0" width="1" height="1" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage ref={fe} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span className={g.shadow} aria-hidden="true" />
      <span className={g.caustic} aria-hidden="true" />
      <span ref={lens} className={g.lens} aria-hidden="true" />
      <span className={g.tint} aria-hidden="true" />
      <span className={g.glow} aria-hidden="true" />
      <span className={g.bevel} aria-hidden="true" />
      <span className={g.face} aria-hidden="true" />
      <span className={g.spec} aria-hidden="true" />
      <span className={g.spec2} aria-hidden="true" />
      {children}
    </T>
  );
}

/** A content wrapper above the glass layers. */
export function GlassBody({ className = "", children, style }: { className?: string; children: ReactNode; style?: CSSProperties }) {
  return <div className={`${g.body} ${className}`} style={style}>{children}</div>;
}

// ── 00 Glass study: the same pill and card, clear and smoked, over a detailed
// image and over the mercury glow, to judge the glass against the references.
export function GlassStudy() {
  const panel = (kind: "image" | "glow") => (
    <div className={`${g.studyPanel} ${kind === "image" ? g.studyImage : g.studyGlow}`} style={kind === "image" ? { backgroundImage: "url(/media/websites/gallery-1000.webp)" } : undefined}>
      {kind === "glow" && <span className={g.studyGlowRing} aria-hidden="true" />}
      <span className={`mono-label ${g.studyLabel}`}>{kind === "image" ? "OVER AN IMAGE" : "OVER THE MERCURY GLOW"}</span>
      <div className={g.studyRow}>
        <LiquidGlass variant="clear" className={g.pill}><span className={g.body}>Clear glass</span></LiquidGlass>
        <LiquidGlass variant="smoked" className={g.pill}><span className={g.body}>Smoked glass</span></LiquidGlass>
      </div>
      <div className={g.studyRow}>
        <LiquidGlass variant="smoked" className={g.studyCard}>
          <div className={g.body}>
            <h4>Smoked slab</h4>
            <p>Body text stays readable: a dark glass, a clear edge that bends what is behind it.</p>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
  return <div className={g.study}>{panel("image")}{panel("glow")}</div>;
}
