"use client";

import * as React from "react";

/**
 * Glass Folder Cards (from 21st.dev, adapted for Ryvo).
 *
 * A folder drawn as an object, in three layers, back to front: a back panel
 * holding a picture, the files the folder contains, and a frosted-glass front
 * panel that blurs whatever sits behind it. The files are real elements
 * between real panels, so the glass frosts them as they move.
 *
 * - Rest: flat and closed. The tops of the files only just show.
 * - Hover / focus: the front panel leans toward you on its bottom hinge and
 *   the files lift a little out of the pocket.
 * - Open (click, Enter, Space): the panel falls further forward and the files
 *   rise out and fan, each one a link with its name on it.
 *
 * What changed from the original, for this site:
 * - Pictures only: the generated "liquid" art and its presets are gone. The
 *   back panel and the files are real screenshots, as AVIF + WebP.
 * - No add key and no menu (the original's `action="add" | "more"`).
 * - Archivo and Geist Mono, the site's ink and silver, and one easing family:
 *   a soft expo-out. Nothing springs or bounces.
 * - Fluid: without `width` the folder fills its container (up to `maxWidth`)
 *   and scales everything with it, so it is designed for 390 px too.
 * - A file can open in a new tab (`external`), and `activeIndex` lifts one
 *   file from outside (a list of page names beside the folder, say).
 * - The CSS is one hoisted, de-duplicated <style> (React 19 `href`), not one
 *   per folder.
 * - Hover is quick and symmetric (250 ms in, 200 ms out) and the glass is a
 *   pre-blurred layer, not a live backdrop-filter, so nothing re-blurs late.
 * - Reduced motion: every transition is instant and the tilt is off.
 */

export type FolderImage = {
  /** `srcset` strings, e.g. "/a-800.avif 800w, /a-1600.avif 1600w". */
  avif?: string;
  webp: string;
  /** The `src` fallback. */
  src: string;
  /** Intrinsic size, for the aspect ratio. */
  width: number;
  height: number;
};

export type FolderFile = {
  name: string;
  /** A short second line: a kind, a path. */
  meta?: string;
  image?: FolderImage;
  href?: string;
  /** Opens `href` in a new tab. */
  external?: boolean;
};

export type GlassFolderProps = {
  label: string;
  /** The second line. Defaults to the number of files. */
  meta?: string;
  /** `light` is milk glass, `dark` is smoked glass. */
  tone?: "light" | "dark";
  /** The back panel's picture. Without one the back is plain frosted silver. */
  image?: FolderImage;
  files?: FolderFile[];
  /** Where the label sits on the front panel. */
  labelPlacement?: "bottom-left" | "top-left" | "top-right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFileSelect?: (file: FolderFile, index: number) => void;
  /** Lifts this file, as if hovered (from a list beside the folder). */
  activeIndex?: number | null;
  /** Fixed width in px. Omit it to fill the container. */
  width?: number;
  /** The fluid folder's largest width. */
  maxWidth?: number;
  /** `sizes` for the pictures, as rendered on this page. */
  sizes?: string;
  /** Assemble itself the first time it scrolls into view. */
  appear?: boolean;
  appearDelay?: number;
  /** Words for the screen reader: "Open", "Close", "items", "opens in a new tab". */
  words?: { open: string; close: string; items: (n: number) => string; newTab: string };
  className?: string;
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// Geometry, in the folder's own units. The stage is drawn at 340 × 272 and
// scaled to the width, so the shapes can be fixed paths.

const W = 340;
const H = 272;
const HEADROOM = 54; // room above the back panel for the files to rise into
const FRONT_TOP = 74;
const FRONT_H = H - FRONT_TOP;
const SHEET_W = 272;
const SHEET_H = 184;
const MAX_VISIBLE = 4;

const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z";
const FRONT_PATH =
  "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 " +
  (FRONT_H - 22) + "A22 22 0 0 1 318 " + FRONT_H + "L22 " + FRONT_H + "A22 22 0 0 1 0 " + (FRONT_H - 22) + "Z";

const EN_WORDS = {
  open: "Open",
  close: "Close",
  items: (n: number) => n + (n === 1 ? " page" : " pages"),
  newTab: "opens in a new tab",
};

/** Where a file sits in the fan: -1 … 1 across the visible stack, 0 for one file. */
export function fanSlot(index: number, count: number): number {
  return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
}

/** A stable small jitter per file, so a stack never looks machine-aligned. */
function jitter(seed: string, i: number): [number, number] {
  let h = 2166136261;
  for (let k = 0; k < seed.length; k++) h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
  h = (h + i * 0x9e3779b1) >>> 0;
  const a = ((h & 0xffff) / 0xffff - 0.5) * 8; // px
  const b = (((h >>> 16) & 0xffff) / 0xffff - 0.5) * 2.4; // deg
  return [a, b];
}

function Picture({ img, className, sizes, w, h }: { img: FolderImage; className: string; sizes: string; w: number; h: number }) {
  return (
    <picture>
      {img.avif ? <source type="image/avif" srcSet={img.avif} sizes={sizes} /> : null}
      <img className={className} src={img.src} srcSet={img.webp} sizes={sizes} alt="" width={w} height={h} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}

export default function GlassFolder({
  label,
  meta,
  tone = "light",
  image,
  files = [],
  labelPlacement = "bottom-left",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onFileSelect,
  activeIndex = null,
  width,
  maxWidth = 640,
  sizes = "(min-width: 1024px) 560px, 92vw",
  appear = true,
  appearDelay = 0,
  words = EN_WORDS,
  className,
  style,
}: GlassFolderProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const hitRef = React.useRef<HTMLButtonElement>(null);

  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const [entered, setEntered] = React.useState(!appear);

  // ---- size: fixed, or the container's width (no layout shift: the root
  // reserves its height from its own width with an aspect ratio) -----------
  const [measured, setMeasured] = React.useState<number | null>(null);
  React.useEffect(() => {
    if (width) return;
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setMeasured(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const w = width ?? measured ?? Math.min(maxWidth, W);
  const k = w / W;

  // ---- entrance: assemble the first time the folder is on screen ----------
  React.useEffect(() => {
    if (!appear) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    let t = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        t = window.setTimeout(() => setEntered(true), appearDelay);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [appear, appearDelay]);

  // ---- pointer: light and parallax follow the cursor, no re-renders -------
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const write = () => {
      raf = 0;
      el.style.setProperty("--gf-px", px.toFixed(3));
      el.style.setProperty("--gf-py", py.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * 2 - 1;
      py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const leave = () => {
      px = 0;
      py = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- Escape and a press outside close it --------------------------------
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      hitRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, setOpen]);

  const visible = files.slice(0, MAX_VISIBLE);
  const count = files.length;
  const metaLine = meta ?? words.items(count);
  const sheetSizes = sizes.replace(/(\d+)(px|vw)/g, (_, n: string, u: string) => Math.round(Number(n) * 0.8) + u);

  return (
    <div
      ref={rootRef}
      className={"gf-root" + (className ? " " + className : "")}
      data-tone={tone}
      data-open={open || undefined}
      data-entered={entered || undefined}
      data-active={activeIndex != null || undefined}
      data-place={labelPlacement}
      style={{
        width: width ?? "100%",
        maxWidth: width ? undefined : maxWidth,
        aspectRatio: W + " / " + (H + HEADROOM),
        ...style,
      }}
    >
      <style href="ryvo-glass-folder" precedence="medium">{GF_CSS}</style>
      <div className="gf-stage" style={{ transform: "translateY(" + HEADROOM * k + "px) scale(" + k + ")" }}>
        <div className="gf-tilt">
          <div className="gf-shadow" aria-hidden="true" />

          {/* back panel and its picture */}
          <div className="gf-back" style={{ clipPath: "path('" + BACK_PATH + "')" }} aria-hidden="true">
            {image ? <Picture img={image} className="gf-art" sizes={sizes} w={W + 24} h={H + 24} /> : null}
            <div className="gf-back-sheen" />
          </div>
          <svg className="gf-rim gf-back-rim" viewBox={"0 0 " + W + " " + H} aria-hidden="true">
            <path d={BACK_PATH} />
          </svg>

          {/* the frosted front panel, hinged on its bottom edge */}
          <div className="gf-front" style={{ clipPath: "path('" + FRONT_PATH + "')" }}>
            {/* the frost: a pre-blurred copy of the back picture, painted once and
                moved as a layer (never a live backdrop-filter, which re-blurs on
                every frame of the hinge and lags) */}
            {image ? (
              <div className="gf-frost" aria-hidden="true">
                <Picture img={image} className="gf-frost-art" sizes="200px" w={W + 24} h={H + 24} />
              </div>
            ) : null}
            <div className="gf-tint" aria-hidden="true" />
            <div className="gf-spec" aria-hidden="true" />
            <svg className="gf-rim gf-front-rim" viewBox={"0 0 " + W + " " + FRONT_H} aria-hidden="true">
              <defs>
                <linearGradient id={"gf-rim-" + uid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                  <stop offset="0.35" stopColor="#fff" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
                </linearGradient>
              </defs>
              <path d={FRONT_PATH} stroke={"url(#gf-rim-" + uid + ")"} />
            </svg>
            <button
              ref={hitRef}
              type="button"
              className="gf-hit"
              aria-expanded={open}
              aria-label={(open ? words.close : words.open) + ": " + label + ", " + words.items(count)}
              onClick={() => setOpen(!open)}
            />
            <div className="gf-label">
              <span className="gf-title">{label}</span>
              <span className="gf-meta">{metaLine}</span>
            </div>
          </div>

          {/* the contents: after the glass in tab order, beneath it on screen */}
          <div className="gf-files" role="list" aria-label={label} inert={!open}>
            {visible.map((file, v) => {
              const slot = fanSlot(v, visible.length);
              const [jx, jr] = jitter(file.name, v);
              const picture = !!file.image;
              const inner = (
                <>
                  {file.image ? (
                    <Picture img={file.image} className="gf-sheet-art" sizes={sheetSizes} w={SHEET_W} h={SHEET_H} />
                  ) : (
                    <span className="gf-lines" aria-hidden="true">
                      <i style={{ width: "86%" }} />
                      <i style={{ width: "92%" }} />
                      <i style={{ width: "64%" }} />
                    </span>
                  )}
                  <span className="gf-sheet-head">
                    <span className="gf-sheet-name">{file.name}</span>
                    {file.meta ? <span className="gf-sheet-meta">{file.meta}</span> : null}
                  </span>
                  {file.external ? <span className="sr-only"> ({words.newTab})</span> : null}
                </>
              );
              const common = {
                className: "gf-sheet" + (picture ? " gf-sheet--art" : "") + (activeIndex === v ? " gf-sheet--lift" : ""),
                style: {
                  "--gf-slot": slot,
                  "--gf-depth": visible.length - 1 - v,
                  "--gf-jx": jx.toFixed(2) + "px",
                  "--gf-jr": jr.toFixed(2) + "deg",
                  zIndex: v + 1,
                } as React.CSSProperties,
              };
              return (
                <div key={file.name + v} role="listitem" className="gf-sheet-slot">
                  {file.href ? (
                    <a
                      {...common}
                      href={file.href}
                      target={file.external ? "_blank" : undefined}
                      rel={file.external ? "noopener" : undefined}
                      onClick={() => onFileSelect?.(file, v)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button {...common} type="button" onClick={() => onFileSelect?.(file, v)}>
                      {inner}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const GF_CSS = `
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.16, 1, .3, 1);
  --gf-hinge: 0deg;
  --gf-lift: -8px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #0b0c0e;
  --gf-ink-soft: rgba(11, 12, 14, .62);
  position: relative;
  display: block;
  flex: none;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
.gf-root[data-tone="dark"] { --gf-ink: #f1f2f4; --gf-ink-soft: rgba(241, 242, 244, .66); }
@media (hover: hover) {
  .gf-root:hover { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
}
.gf-root:focus-within, .gf-root[data-active] { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }

.gf-stage { position: absolute; left: 0; top: 0; width: 340px; height: 272px; transform-origin: 0 0; }
.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
  transition: transform .6s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(40, 44, 52, .3);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(11, 12, 14, .5); }

.gf-back { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(180deg, #f4f5f7 0%, #dcdfe4 100%); }
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #1c1e22 0%, #0b0c0e 100%); }
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  width: 364px;
  height: 296px;
  max-width: none;
  object-fit: cover;
  object-position: 50% 0;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease);
}
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .14), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim { position: absolute; left: 0; top: 0; max-width: none; overflow: visible; pointer-events: none; fill: none; }
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .5); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(255, 255, 255, .16); }

/* ---- files ---------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  /* nothing hangs out of the bottom of the pocket */
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot { display: contents; }
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f3f5 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(11, 12, 14, .12), 0 10px 26px -8px rgba(40, 44, 52, .3);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition: transform .2s var(--gf-ease), box-shadow .2s var(--gf-ease), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
@media (hover: hover) {
  .gf-root:hover .gf-sheet { transition-duration: .25s, .25s, 1s, 1s; }
}
.gf-root[data-open] .gf-sheet { transition-duration: .6s, .25s, 1s, 1s; }
.gf-sheet--art { background: #131418; }
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible,
.gf-root .gf-sheet.gf-sheet--lift {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(11, 12, 14, .12), 0 22px 40px -12px rgba(40, 44, 52, .45);
  transition-delay: 0s;
}
.gf-sheet:focus-visible { outline: 2px solid #3d4147; outline-offset: 2px; }
.gf-sheet-art { position: absolute; left: 0; top: 0; width: 272px; height: 184px; max-width: none; object-fit: cover; object-position: 50% 0; }
.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(11, 12, 14, .62) 0%, rgba(11, 12, 14, 0) 30%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .18);
  pointer-events: none;
}
.gf-sheet-head {
  position: absolute;
  left: 13px;
  right: 13px;
  top: 10px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name { overflow: hidden; text-overflow: ellipsis; padding-bottom: .14em; font-size: 12.5px; font-weight: 560; letter-spacing: -.005em; color: #0b0c0e; }
.gf-sheet-meta { flex: none; font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: rgba(11, 12, 14, .55); }
.gf-sheet--art .gf-sheet-name { color: #f1f2f4; }
.gf-sheet--art .gf-sheet-meta { color: rgba(241, 242, 244, .74); }
.gf-lines { position: absolute; left: 14px; right: 14px; top: 40px; display: flex; flex-direction: column; gap: 9px; }
.gf-lines i { display: block; height: 5px; border-radius: 3px; background: rgba(11, 12, 14, .08); }

/* ---- front glass ----------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  background: linear-gradient(180deg, #e9ebee, #dcdfe4);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .2s var(--gf-ease), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
  will-change: transform;
}
.gf-root[data-tone="dark"] .gf-front { background: linear-gradient(180deg, #1c1e22, #0b0c0e); }
@media (hover: hover) {
  .gf-root:hover .gf-front { transition-duration: .25s, 1s, 1s; }
}
.gf-root[data-open] .gf-front { transition-duration: .6s, 1s, 1s; }
.gf-frost { position: absolute; inset: 0; overflow: hidden; }
.gf-frost-art {
  position: absolute;
  left: -12px;
  top: -86px;
  width: 364px;
  height: 296px;
  max-width: none;
  object-fit: cover;
  object-position: 50% 0;
  filter: blur(14px) saturate(1.1);
  transform: scale(1.08);
}
.gf-tint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255, 255, 255, .3) 0%, rgba(250, 251, 252, .62) 42%, rgba(246, 247, 249, .92) 100%); }
.gf-root[data-tone="dark"] .gf-tint { background: linear-gradient(180deg, rgba(19, 20, 24, .16) 0%, rgba(13, 14, 17, .58) 46%, rgba(9, 10, 12, .92) 100%); }
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .14; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.2; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .5; }

.gf-hit { all: unset; position: absolute; inset: 0; z-index: 1; cursor: pointer; }
.gf-hit:focus-visible ~ .gf-label .gf-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path { stroke-width: 5; }

.gf-label { position: absolute; z-index: 2; display: flex; flex-direction: column; gap: 5px; max-width: 292px; pointer-events: none; color: var(--gf-ink); }
.gf-root[data-place="bottom-left"] .gf-label { left: 26px; bottom: 26px; }
.gf-root[data-place="top-left"] .gf-label { left: 26px; top: 48px; }
.gf-root[data-place="top-right"] .gf-label { right: 30px; top: 52px; align-items: flex-end; text-align: right; }
.gf-title { font-size: 18px; font-weight: 500; font-stretch: 112%; line-height: 1.12; letter-spacing: -.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-bottom: .14em; margin-bottom: -.14em; }
.gf-meta { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--gf-ink-soft); white-space: nowrap; }

/* ---- entrance: the folder assembles itself ---------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1.1s var(--gf-ease), opacity 1s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: 0s, 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered][data-open] .gf-sheet { transition-delay: calc(var(--gf-depth) * 30ms), 0s, 0s, 0s; }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none; }
}
`;
