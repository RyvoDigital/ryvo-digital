"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config — 4 segments, petal animation + about transition ────────────
const SEGMENTS = [
  { dir: "petal0", count: 192 }, // Full sphere → Design petal
  { dir: "petal1", count: 192 }, // Design → Build petal
  { dir: "petal2", count: 192 }, // Build → Maintain petal
  { dir: "about",  count: 192 }, // Maintain petal → smoke (about transition)
];
const TOTAL_FRAMES = SEGMENTS.reduce((s, seg) => s + seg.count, 0); // 768

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

// ─── Scroll mapping ───────────────────────────────────────────────────────────
// 900vh total: 100vh slide-up + 800vh frame animation
// Petal frames (576): progress 0.111 → 0.778
// About frames (192): progress 0.778 → 1.0
const SLIDE_END = 100 / 900; // ≈ 0.111

// ─── Service text sections (petal phase) ─────────────────────────────────────
const TEXT_SECTIONS = [
  {
    key: "design",
    enter: 0.14,
    leave: 0.36,
    number: "01",
    label: "Design",
    lines: ["We craft", "experiences", "that define brands."],
    bullets: [
      "Brand identity & visual systems",
      "UI/UX design & prototyping",
      "Motion & interaction design",
    ],
    position: "bottom-16 right-14",
    align: "items-end",
    textAlign: "text-right",
  },
  {
    key: "build",
    enter: 0.40,
    leave: 0.58,
    number: "02",
    label: "Build",
    lines: ["We engineer", "digital products", "that perform."],
    bullets: [
      "Custom Next.js & React development",
      "Performance & Core Web Vitals",
      "Animations & immersive interfaces",
    ],
    position: "top-[22%] left-12",
    align: "items-start",
    textAlign: "text-left",
  },
  {
    key: "maintain",
    enter: 0.62,
    leave: 0.74,
    number: "03",
    label: "Maintain",
    lines: ["We grow", "your presence", "over time."],
    bullets: [
      "Ongoing updates & iterations",
      "Analytics & conversion optimisation",
      "Priority support & evolution",
    ],
    position: "top-24 right-14",
    align: "items-end",
    textAlign: "text-right",
  },
];

// ─── Manifesto + stats overlay (about phase) ─────────────────────────────────
const MANIFESTO_ENTER = 0.82;
const MANIFESTO_LEAVE = 1.05; // never leaves

// 4 corner stats — each connects to one edge of the manifesto headline
const MANIFESTO_STATS = [
  {
    key: "satisfaction",
    value: "100%",
    label: "Client satisfaction",
    position: "top-[32%] left-[4%]",
    align: "items-start",
    textAlign: "text-left",
  },
  {
    key: "custom",
    value: "Custom",
    label: "Built, never templated",
    position: "top-[20%] right-[5%]",
    align: "items-end",
    textAlign: "text-right",
  },
  {
    key: "load",
    value: "< 2s",
    label: "Average load time",
    position: "bottom-[20%] left-[5%]",
    align: "items-start",
    textAlign: "text-left",
  },
  {
    key: "response",
    value: "< 24h",
    label: "Response guaranteed",
    position: "bottom-[30%] right-[4%]",
    align: "items-end",
    textAlign: "text-right",
  },
];

const FADE_RANGE = 0.035;

function sectionOpacity(p: number, enter: number, leave: number): number {
  const neverLeave = leave > 1;
  if (p < enter) return 0;
  if (p <= enter + FADE_RANGE) return (p - enter) / FADE_RANGE;
  if (neverLeave) return 1;
  if (p < leave - FADE_RANGE) return 1;
  if (p <= leave) return 1 - (p - (leave - FADE_RANGE)) / FADE_RANGE;
  return 0;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ServicesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const manifestoRef = useRef<HTMLDivElement>(null);

  // Refs for SVG connector lines: stat dot → headline character
  const statDotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const headlineCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const svgLineRefs = useRef<(SVGLineElement | null)[]>([]);

  // ── Connector endpoint measurement ─────────────────────────────────────────
  useEffect(() => {
    const updateLines = () => {
      MANIFESTO_STATS.forEach((_, i) => {
        const lineEl = svgLineRefs.current[i];
        const dotEl = statDotRefs.current[i];
        const charEl = headlineCharRefs.current[i];
        if (!lineEl || !dotEl || !charEl) return;

        const dotRect = dotEl.getBoundingClientRect();
        const charRect = charEl.getBoundingClientRect();

        // Stat dot → nearest edge of headline character
        const x1 = ((dotRect.left + dotRect.width / 2) / window.innerWidth * 100).toFixed(2);
        const y1 = ((dotRect.top + dotRect.height / 2) / window.innerHeight * 100).toFixed(2);
        const x2 = ((charRect.left + charRect.width / 2) / window.innerWidth * 100).toFixed(2);
        const y2 = ((charRect.top + charRect.height / 2) / window.innerHeight * 100).toFixed(2);

        lineEl.setAttribute("x1", `${x1}%`);
        lineEl.setAttribute("y1", `${y1}%`);
        lineEl.setAttribute("x2", `${x2}%`);
        lineEl.setAttribute("y2", `${y2}%`);
      });
    };

    document.fonts.ready.then(updateLines);
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, []);

  // ── Canvas + ScrollTrigger ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const panel = panelRef.current;
    if (!canvas || !container || !panel) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const setCanvasSize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const ZOOM = 1.07;
      const scale = Math.max(cw / iw, ch / ih) * ZOOM;
      ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale);
    };

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

    const loadOneFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { framesRef.current[index] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = getFrameSrc(index);
      });

    loadOneFrame(0).then(() => drawFrame(0));
    Promise.all(Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => loadOneFrame(i + 1)));

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Crossfade: panel dissolves in over SLIDE_END
        const slideT = Math.min(1, p / SLIDE_END);
        panel.style.opacity = String(slideT);

        // "SERVICES" label: rises and fades during crossfade
        const title = titleRef.current;
        if (title) {
          let titleOpacity = 0;
          if (slideT <= 0.4) titleOpacity = slideT / 0.4;
          else titleOpacity = Math.max(0, 1 - (slideT - 0.4) / 0.55);
          title.style.opacity = String(Math.max(0, Math.min(1, titleOpacity)));
        }

        // Frame playback (linear)
        const frameP = Math.max(0, (p - SLIDE_END) / (1 - SLIDE_END));
        const exactIndex = Math.min(frameP * (TOTAL_FRAMES - 1), TOTAL_FRAMES - 1);
        const roundedIndex = Math.floor(exactIndex);
        if (roundedIndex !== currentFrameRef.current || exactIndex % 1 > 0.01) {
          currentFrameRef.current = roundedIndex;
          requestAnimationFrame(() => drawFrame(exactIndex));
        }

        // Service text sections opacity
        TEXT_SECTIONS.forEach((section, i) => {
          const el = textRefs.current[i];
          if (!el) return;
          el.style.opacity = String(Math.max(0, Math.min(1, sectionOpacity(p, section.enter, section.leave))));
        });

        // Manifesto + stats overlay opacity
        const manifesto = manifestoRef.current;
        if (manifesto) {
          manifesto.style.opacity = String(Math.max(0, Math.min(1, sectionOpacity(p, MANIFESTO_ENTER, MANIFESTO_LEAVE))));
        }
      },
    });

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      st.kill();
    };
  }, []);

  return (
    <section
      id="services"
      ref={containerRef}
      style={{ height: "900vh" }}
      className="relative bg-[#080808]"
    >
      {/* ── Main panel — crossfades in over the hero ── */}
      <div
        ref={panelRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#080808]"
        style={{ opacity: 0, zIndex: 2 }}
      >
        {/* Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#080808]/25 z-10 pointer-events-none" />

        {/* ── "SERVICES" label — appears on the canvas during the crossfade ── */}
        <div
          ref={titleRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 pointer-events-none"
          style={{ opacity: 0 }}
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
            What we do
          </p>
          <h1
            className="font-display font-black text-white tracking-tight select-none"
            style={{ fontSize: "clamp(56px, 10vw, 130px)", letterSpacing: "-0.03em" }}
          >
            Services
          </h1>
        </div>

        {/* ── Service text sections (petal phase) ── */}
        {TEXT_SECTIONS.map((section, i) => (
          <div
            key={section.key}
            ref={(el) => { textRefs.current[i] = el; }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className={`absolute ${section.position} flex flex-col ${section.align}`}>
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase mb-2">
                {section.number}
              </p>
              <p className="font-display font-bold text-[#4F6EF7] tracking-widest uppercase text-sm mb-6">
                {section.label}
              </p>
              <h2 className="font-display font-black text-white overflow-visible">
                {section.lines.map((line, j) => (
                  <span
                    key={j}
                    className={`block ${section.textAlign}`}
                    style={{
                      fontSize: "clamp(22px, 2.5vw, 36px)",
                      lineHeight: 1.35,
                      opacity: j === 0 ? 1 : j === 1 ? 0.7 : 0.3,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </h2>
              <ul className="mt-6 flex flex-col gap-2">
                {section.bullets.map((b, j) => (
                  <li key={j} className={`font-sans text-sm text-white/40 tracking-wide ${section.textAlign}`}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* ── Manifesto + stats overlay (about/smoke phase) ── */}
        <div
          ref={manifestoRef}
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: 0 }}
        >
          {/* SVG connector lines: stat dots → headline characters */}
          <svg
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
            style={{ overflow: "visible" }}
          >
            {MANIFESTO_STATS.map((_, i) => (
              <line
                key={i}
                ref={(el) => { svgLineRefs.current[i] = el; }}
                x1="50%" y1="50%" x2="50%" y2="50%"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            ))}
          </svg>

          {/* Centered manifesto headline */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2
              className="font-display font-black text-white text-center leading-none select-none"
              style={{ fontSize: "clamp(36px, 5.5vw, 85px)", letterSpacing: "-0.02em", opacity: 0.75 }}
            >
              {/* Line 1 — refs on first and last char for connector lines */}
              <span className="block">
                <span ref={(el) => { headlineCharRefs.current[0] = el; }}>Y</span>
                {"OUR VISION.".slice(0, -1)}
                <span ref={(el) => { headlineCharRefs.current[1] = el; }}>.</span>
              </span>
              <span className="block opacity-70">ENGINEERED</span>
              {/* Line 3 — refs on first and last char */}
              <span className="block opacity-30">
                <span ref={(el) => { headlineCharRefs.current[2] = el; }}>T</span>
                {"O LAST.".slice(0, -1)}
                <span ref={(el) => { headlineCharRefs.current[3] = el; }}>.</span>
              </span>
            </h2>
            <p
              className="font-sans text-base text-white/40 tracking-wide text-center mt-10"
              style={{ maxWidth: "420px", lineHeight: 1.7 }}
            >
              Ryvo is a boutique digital agency based in Madrid. We exist for brands worth building for. Small by choice. Meticulous by nature.
            </p>
          </div>

          {/* ── 4 corner stats ── */}
          {MANIFESTO_STATS.map((stat, i) => (
            <div
              key={stat.key}
              className={`absolute ${stat.position} flex flex-col ${stat.align}`}
            >
              <div className="flex items-center gap-2">
                {/* Dot on inner (center-facing) edge */}
                {stat.align === "items-end" && (
                  <span
                    ref={(el) => { statDotRefs.current[i] = el; }}
                    className="inline-block w-1.5 h-1.5 rounded-full bg-white/35 flex-shrink-0"
                  />
                )}
                <span
                  className={`font-display font-black text-white/70 ${stat.textAlign}`}
                  style={{ fontSize: "clamp(22px, 2.2vw, 36px)", lineHeight: 1 }}
                >
                  {stat.value}
                </span>
                {stat.align === "items-start" && (
                  <span
                    ref={(el) => { statDotRefs.current[i] = el; }}
                    className="inline-block w-1.5 h-1.5 rounded-full bg-white/35 flex-shrink-0"
                  />
                )}
              </div>
              <p className={`font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase mt-2 ${stat.textAlign}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
