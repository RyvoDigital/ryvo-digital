"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ────────────────────────────────────────────────────────────
const SEGMENTS = [
  { dir: "v0", count: 121 },
  { dir: "v1", count: 145 },
  { dir: "v2", count: 145 },
];
const TOTAL_FRAMES = SEGMENTS.reduce((s, seg) => s + seg.count, 0); // 411

function getFrameSrc(globalIndex: number): string {
  let remaining = globalIndex;
  for (const seg of SEGMENTS) {
    if (remaining < seg.count) {
      return `/frames/${seg.dir}/frame_${String(remaining + 1).padStart(4, "0")}.webp`;
    }
    remaining -= seg.count;
  }
  const last = SEGMENTS[SEGMENTS.length - 1];
  return `/frames/${last.dir}/frame_${String(last.count).padStart(4, "0")}.webp`;
}

// ─── Text sections ───────────────────────────────────────────────────────────
// enter/leave are scroll progress values (0–1) for the whole container
const TEXT_SECTIONS = [
  {
    key: "hero",
    enter: 0,
    leave: 0.08,
    label: "Web Design & Development · Lisbon & Madrid",
    lines: ["We build", "digital worlds", "that last."],
    sub: null as string | null,
    position: "left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2",
    align: "items-center",
    connector: null as { x1: number; y1: number; x2: number; y2: number } | null,
  },
  {
    key: "design",
    enter: 0.24,
    leave: 0.37,
    label: "01 — Design",
    lines: ["We craft", "websites that", "define brands."],
    sub: "Every pixel intentional. Every interaction felt.",
    position: "bottom-16 right-12",
    align: "items-end",
    connector: { x1: 25, y1: 62, x2: 80, y2: 82 },
  },
  {
    key: "build",
    enter: 0.58,
    leave: 0.71,
    label: "02 — Build",
    lines: ["We engineer", "digital products", "that perform."],
    sub: "Fast, scalable, built to last.",
    position: "top-[20%] left-[22%]",
    align: "items-start",
    connector: { x1: 62, y1: 38, x2: 44, y2: 32 },
  },
  {
    key: "maintain",
    enter: 0.86,
    leave: 1.01,
    label: "03 — Maintain",
    lines: ["We grow", "your presence", "over time."],
    sub: "Ongoing support, updates, and evolution.",
    position: "top-28 left-8",
    align: "items-start",
    connector: { x1: 68, y1: 58, x2: 22, y2: 28 },
  },
];

const FADE_RANGE = 0.035;

// ─── Planet checkpoint easing ─────────────────────────────────────────────────
// Slow the frame animation as it approaches and departs each planet.
// Denominator is TOTAL_FRAMES - 1 = 410 (frame mapping is p * 410).
const PLANET_CKS = [121 / 410, 266 / 410, 1.0] as const;
const EASE_HALF = 0.10; // wider zone — feel gravity from further away

function gravityCurve(t: number): number {
  // Slow at planet center (t=0.5), fast at zone edges (t=0 and t=1)
  // f'(0.5) = 1−A (slowest), f'(0) = f'(1) = 1+A (fastest)
  const A = 0.78;
  return t + (A / (2 * Math.PI)) * Math.sin(2 * Math.PI * t);
}

function easedProgress(p: number): number {
  for (const ck of PLANET_CKS) {
    const lo = ck - EASE_HALF;
    const hi = Math.min(ck + EASE_HALF, 1.0);
    if (p >= lo && p <= hi) {
      const t = (p - lo) / (hi - lo);
      return lo + gravityCurve(t) * (hi - lo);
    }
  }
  return p;
}

function sectionOpacity(p: number, enter: number, leave: number, isHero: boolean): number {
  if (isHero) {
    // Hero: always visible at start, fades out near leave
    if (p < leave - FADE_RANGE) return 1;
    if (p <= leave) return 1 - (p - (leave - FADE_RANGE)) / FADE_RANGE;
    return 0;
  }
  const neverLeave = leave > 1;
  if (p < enter) return 0;
  if (p <= enter + FADE_RANGE) return (p - enter) / FADE_RANGE;
  if (neverLeave) return 1;
  if (p < leave - FADE_RANGE) return 1;
  if (p <= leave) return 1 - (p - (leave - FADE_RANGE)) / FADE_RANGE;
  return 0;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const firstLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const svgLineRefs = useRef<(SVGLineElement | null)[]>([]);
  const svgContainerRefs = useRef<(SVGSVGElement | null)[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // ── Canvas sizing ──────────────────────────────────────────────────────
    const setCanvasSize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // ── Draw a single image cover-scaled to canvas ────────────────────────
    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const scale = Math.max(cw / iw, ch / ih);
      ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale);
    };

    // ── Draw with sub-frame blending to eliminate visible frame jumps ──────
    // Accepts a floating-point index, e.g. 45.7 blends frame 45 (30%) + frame 46 (70%)
    const drawFrame = (exactIndex: number) => {
      const lower = Math.floor(exactIndex);
      const upper = Math.min(lower + 1, TOTAL_FRAMES - 1);
      const fraction = exactIndex - lower;
      const imgA = framesRef.current[lower];
      if (!imgA) return;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      drawCover(imgA);
      if (fraction > 0.01) {
        const imgB = framesRef.current[upper];
        if (imgB) {
          ctx.globalAlpha = fraction;
          drawCover(imgB);
          ctx.globalAlpha = 1;
        }
      }

    };

    // ── Frame loading ──────────────────────────────────────────────────────
    let loadedCount = 0;

    const loadOneFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          framesRef.current[index] = img;
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
          resolve();
        };
        img.onerror = () => { loadedCount++; resolve(); };
        img.src = getFrameSrc(index);
      });

    // Load frame 0 first for a fast first paint
    loadOneFrame(0).then(() => drawFrame(0)); // integer is fine here, fraction = 0

    // Load the remaining frames in parallel
    Promise.all(
      Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => loadOneFrame(i + 1))
    ).then(() => setIsReady(true));

    // ── GSAP ScrollTrigger — drives frames + text opacity ─────────────────
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Frame — eased progress slows near planet checkpoints, raw p used for text
        const pe = easedProgress(p);
        const exactIndex = Math.min(pe * (TOTAL_FRAMES - 1), TOTAL_FRAMES - 1);
        const roundedIndex = Math.floor(exactIndex);

        if (roundedIndex !== currentFrameRef.current || exactIndex % 1 > 0.01) {
          currentFrameRef.current = roundedIndex;
          requestAnimationFrame(() => drawFrame(exactIndex));
        }

        // Text sections
        TEXT_SECTIONS.forEach((section, i) => {
          const el = textRefs.current[i];
          if (!el) return;
          const opacity = sectionOpacity(p, section.enter, section.leave, section.key === "hero");
          el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
        });

        // Maintain connector line — delayed in, earlier out (relative to parent section opacity)
        const maintainSvg = svgContainerRefs.current[3];
        if (maintainSvg) {
          const LINE_ENTER = 0.915, LINE_RANGE = 0.025;
          const lo = p < LINE_ENTER ? 0 : p <= LINE_ENTER + LINE_RANGE ? (p - LINE_ENTER) / LINE_RANGE : 1;
          maintainSvg.style.opacity = String(lo);
        }

        // Scroll indicator fades with hero text
        const heroFade = Math.max(0, Math.min(1, sectionOpacity(p, TEXT_SECTIONS[0].enter, TEXT_SECTIONS[0].leave, true)));
        const si = scrollIndicatorRef.current;
        if (si) si.style.opacity = String(heroFade);
      },
    });

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      st.kill();
    };
  }, []);

  // ── Connector endpoint measurement ─────────────────────────────────────────
  // Runs after mount (and on resize) to point each SVG line exactly at the
  // top-left corner of the first heading span = the "W" of each section.
  useEffect(() => {
    const updateConnectors = () => {
      TEXT_SECTIONS.forEach((section, i) => {
        if (!section.connector) return;
        const lineEl = svgLineRefs.current[i];
        // design → first letter of first line; build/maintain → final dot of last line
        const useDot = section.key === "build" || section.key === "maintain";
        const spanEl = useDot ? dotRefs.current[i] : firstLineRefs.current[i];
        if (!lineEl || !spanEl) return;
        const rect = spanEl.getBoundingClientRect();
        const x = useDot
          ? (rect.left + rect.width * 0.5) / window.innerWidth * 100
          : rect.left / window.innerWidth * 100;
        const y = useDot
          ? (rect.top + rect.height * 0.6) / window.innerHeight * 100
          : rect.top / window.innerHeight * 100;
        lineEl.setAttribute("x2", `${x.toFixed(2)}%`);
        lineEl.setAttribute("y2", `${y.toFixed(2)}%`);
      });
    };
    document.fonts.ready.then(updateConnectors);
    window.addEventListener("resize", updateConnectors);
    return () => window.removeEventListener("resize", updateConnectors);
  }, []);

  return (
    <section ref={containerRef} style={{ height: "600vh" }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#080808]">

        {/* ── Loading overlay ── */}
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] pointer-events-none"
          style={{
            opacity: isReady ? 0 : 1,
            transition: "opacity 0.6s ease",
          }}
        >
          <span className="font-display font-bold text-white text-lg tracking-widest mb-8">
            RYVO
          </span>
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/60"
              style={{
                width: `${loadProgress}%`,
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <span className="mt-3 font-mono text-[10px] text-white/30 tracking-widest">
            {loadProgress}%
          </span>
        </div>

        {/* ── Canvas ── */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* ── Dark overlay ── */}
        <div className="absolute inset-0 bg-[#080808]/25 z-10 pointer-events-none" />

        {/* ── Text sections ── */}
        {TEXT_SECTIONS.map((section, i) => (
          <div
            key={section.key}
            ref={(el) => { textRefs.current[i] = el; }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ opacity: section.key === "hero" ? 1 : 0 }}
          >
            {/* SVG connector line + planet anchor dot */}
            {section.connector && (
              <svg
                ref={(el) => { svgContainerRefs.current[i] = el; }}
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
                style={{ overflow: "visible", opacity: section.key === "maintain" ? 0 : 1 }}
              >
                <line
                  ref={(el) => { svgLineRefs.current[i] = el; }}
                  x1={`${section.connector.x1}%`}
                  y1={`${section.connector.y1}%`}
                  x2={`${section.connector.x2}%`}
                  y2={`${section.connector.y2}%`}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={`${section.connector.x1}%`}
                  cy={`${section.connector.y1}%`}
                  r="2.5"
                  fill="rgba(255,255,255,0.35)"
                />
              </svg>
            )}

            {/* Text block — positioned per section */}
            <div className={`absolute ${section.position} flex flex-col ${section.align}`}>
              <p
                className={`font-mono text-[10px] text-white/40 uppercase mb-4 ${
                  // Hero label must stay on one line — tighter tracking lets it fit 320px screens
                  section.key === "hero"
                    ? "whitespace-nowrap tracking-[0.12em] sm:tracking-[0.25em]"
                    : "tracking-[0.25em]"
                }`}
              >
                {section.label}
              </p>
              <h2 className={`font-display font-black text-white overflow-visible${section.align === "items-center" ? " text-center" : ""}`}>
                {section.lines.map((line, j) => (
                  <span
                    key={j}
                    ref={j === 0 ? (el) => { firstLineRefs.current[i] = el; } : undefined}
                    className="block"
                    style={{
                      fontSize: "clamp(22px, 2.5vw, 36px)",
                      lineHeight: 1.35,
                      opacity: j === 0 ? 1 : j === 1 ? 0.7 : 0.3,
                    }}
                  >
                    {/* For build/maintain: wrap final char in a ref so the connector line ends at the dot */}
                    {(section.key === "build" || section.key === "maintain") && j === section.lines.length - 1
                      ? <>{line.slice(0, -1)}<span ref={(el) => { dotRefs.current[i] = el; }}>{line.slice(-1)}</span></>
                      : line
                    }
                  </span>
                ))}
              </h2>
              {section.key === "hero" && (
                <p
                  className="mt-5 font-mono tracking-[0.55em] text-white/40 uppercase"
                  style={{ fontSize: "13px", letterSpacing: "0.55em" }}
                >
                  RYVO
                </p>
              )}
              {section.sub && (
                <p className="mt-3 font-sans text-sm text-white/40 tracking-wide">
                  {section.sub}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* ── Scroll indicator ── */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
