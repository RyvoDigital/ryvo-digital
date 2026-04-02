"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ─────────────────────────────────────────────────────────────
const SEGMENTS = [
  { dir: "petal0", count: 192 }, // Full sphere → Design petal
  { dir: "petal1", count: 192 }, // Design → Build petal
  { dir: "petal2", count: 192 }, // Build → Maintain petal
];
const TOTAL_FRAMES = SEGMENTS.reduce((s, seg) => s + seg.count, 0); // 576

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
// 700vh total: first 100vh = slide-up + title, remaining 600vh = frame animation
const SLIDE_END = 100 / 700; // ≈ 0.143

// ─── Text sections ────────────────────────────────────────────────────────────
const TEXT_SECTIONS = [
  {
    key: "design",
    enter: 0.14,
    leave: 0.40,
    number: "01",
    label: "Design",
    lines: ["We craft", "experiences", "that define brands."],
    bullets: [
      "Brand identity & visual systems",
      "UI/UX design & prototyping",
      "Motion & interaction design",
    ],
    // Bottom-right — petal curls left, open dark space on the right
    position: "bottom-16 right-14",
    align: "items-end",
    textAlign: "text-right",
    cta: false,
  },
  {
    key: "build",
    enter: 0.43,
    leave: 0.68,
    number: "02",
    label: "Build",
    lines: ["We engineer", "digital products", "that perform."],
    bullets: [
      "Custom Next.js & React development",
      "Performance & Core Web Vitals",
      "Animations & immersive interfaces",
    ],
    // Upper-left — petal ridge is centered, diagonal tension with top-left text
    position: "top-[22%] left-12",
    align: "items-start",
    textAlign: "text-left",
    cta: false,
  },
  {
    key: "maintain",
    enter: 0.71,
    leave: 1.02,
    number: "03",
    label: "Maintain",
    lines: ["We grow", "your presence", "over time."],
    bullets: [
      "Ongoing updates & iterations",
      "Analytics & conversion optimisation",
      "Priority support & evolution",
    ],
    // Upper-right — petals fan bottom-left to upper-right, text anchors upper-right corner
    position: "top-24 right-14",
    align: "items-end",
    textAlign: "text-right",
    cta: false,
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
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const panel = panelRef.current;
    if (!canvas || !container || !panel) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // ── Canvas sizing ────────────────────────────────────────────────────────
    const setCanvasSize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // ── Cover-scaled draw — zoom 7% to crop VEO watermark from corners ───────
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

    // ── Sub-frame blending ───────────────────────────────────────────────────
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

    // ── Frame loading ────────────────────────────────────────────────────────
    const loadOneFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { framesRef.current[index] = img; resolve(); };
        img.onerror = () => resolve();
        img.src = getFrameSrc(index);
      });

    loadOneFrame(0).then(() => drawFrame(0));
    Promise.all(
      Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => loadOneFrame(i + 1))
    );

    // ── GSAP ScrollTrigger ───────────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Slide-up: panel rises from translateY(100vh) → 0
        const slideT = Math.min(1, p / SLIDE_END);
        panel.style.transform = `translateY(${(1 - slideT) * 100}vh)`;

        // "SERVICES" title: fades in during first half of slide, out during second half
        const title = titleRef.current;
        if (title) {
          let titleOpacity = 0;
          if (slideT <= 0.45) {
            titleOpacity = slideT / 0.45;
          } else if (slideT <= 0.75) {
            titleOpacity = 1;
          } else {
            titleOpacity = 1 - (slideT - 0.75) / 0.25;
          }
          title.style.opacity = String(Math.max(0, Math.min(1, titleOpacity)));
        }

        // Frame animation (linear — starts after slide completes)
        const frameP = Math.max(0, (p - SLIDE_END) / (1 - SLIDE_END));
        const exactIndex = Math.min(frameP * (TOTAL_FRAMES - 1), TOTAL_FRAMES - 1);
        const roundedIndex = Math.floor(exactIndex);

        if (roundedIndex !== currentFrameRef.current || exactIndex % 1 > 0.01) {
          currentFrameRef.current = roundedIndex;
          requestAnimationFrame(() => drawFrame(exactIndex));
        }

        // Text opacity
        TEXT_SECTIONS.forEach((section, i) => {
          const el = textRefs.current[i];
          if (!el) return;
          const opacity = sectionOpacity(p, section.enter, section.leave);
          el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
        });
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
      style={{ height: "700vh" }}
      className="relative bg-[#080808]"
    >
      {/* ── "SERVICES" title — lives on the black background, visible while panel slides up ── */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <div
          ref={titleRef}
          style={{ opacity: 0 }}
        >
          <h1
            className="font-display font-black text-white tracking-tight select-none"
            style={{ fontSize: "clamp(56px, 10vw, 130px)", letterSpacing: "-0.03em" }}
          >
            Services
          </h1>
        </div>
      </div>

      {/* ── Sliding panel — rises over the title screen ── */}
      <div
        ref={panelRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-[#080808]"
        style={{ transform: "translateY(100vh)", zIndex: 2 }}
      >
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
            style={{ opacity: 0 }}
          >
            <div className={`absolute ${section.position} flex flex-col ${section.align}`}>
              {/* Service number */}
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase mb-2">
                {section.number}
              </p>
              {/* Service label */}
              <p className="font-display font-bold text-[#4F6EF7] tracking-widest uppercase text-sm mb-6">
                {section.label}
              </p>
              {/* Heading lines */}
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
              {/* Bullets */}
              <ul className="mt-6 flex flex-col gap-2">
                {section.bullets.map((b, j) => (
                  <li
                    key={j}
                    className={`font-sans text-sm text-white/40 tracking-wide ${section.textAlign}`}
                  >
                    {b}
                  </li>
                ))}
              </ul>
              {/* CTA — Maintain section only */}
              {section.cta && (
                <a
                  href="#"
                  className="mt-8 font-sans text-sm font-medium px-5 py-2.5 rounded-full tracking-wide
                    text-white/90 transition-all duration-300 pointer-events-auto
                    backdrop-blur-md bg-white/10 border border-white/20
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_24px_rgba(0,0,0,0.3)]
                    hover:bg-white/15 hover:border-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_32px_rgba(0,0,0,0.4)]
                    self-end"
                >
                  Get a website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
