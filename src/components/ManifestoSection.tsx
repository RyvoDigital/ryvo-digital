"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ─────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 192;

function getFrameSrc(index: number): string {
  return `/frames/about/frame_${String(index + 1).padStart(4, "0")}.webp`;
}

// ─── Text opacity ─────────────────────────────────────────────────────────────
const FADE_RANGE = 0.035;
const TEXT_ENTER = 0.30;
const TEXT_LEAVE = 1.05; // never leaves

function textOpacity(p: number): number {
  if (p < TEXT_ENTER) return 0;
  if (p <= TEXT_ENTER + FADE_RANGE) return (p - TEXT_ENTER) / FADE_RANGE;
  return 1;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManifestoSection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
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

    // ── Cover-scaled draw — 7% zoom crops any watermark from edges ───────────
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
    Promise.all(Array.from({ length: TOTAL_FRAMES - 1 }, (_, i) => loadOneFrame(i + 1)));

    // ── GSAP ScrollTrigger ───────────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Frame playback — linear
        const exactIndex = Math.min(p * (TOTAL_FRAMES - 1), TOTAL_FRAMES - 1);
        const roundedIndex = Math.floor(exactIndex);

        if (roundedIndex !== currentFrameRef.current || exactIndex % 1 > 0.01) {
          currentFrameRef.current = roundedIndex;
          requestAnimationFrame(() => drawFrame(exactIndex));
        }

        // Text opacity
        const el = textRef.current;
        if (el) {
          el.style.opacity = String(Math.max(0, Math.min(1, textOpacity(p))));
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
      ref={containerRef}
      style={{ height: "400vh" }}
      className="relative bg-[#080808]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#080808]">
        {/* ── Canvas ── */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* ── Dark overlay ── */}
        <div className="absolute inset-0 bg-[#080808]/35 z-10 pointer-events-none" />

        {/* ── Manifesto text ── */}
        <div
          ref={textRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          style={{ opacity: 0 }}
        >
          {/* Manifesto headline */}
          <h2
            className="font-display font-black text-white text-center leading-none select-none"
            style={{ fontSize: "clamp(48px, 7vw, 110px)", letterSpacing: "-0.02em" }}
          >
            <span className="block">YOUR VISION.</span>
            <span className="block opacity-70">ENGINEERED</span>
            <span className="block opacity-30">TO LAST.</span>
          </h2>

          {/* About description */}
          <p
            className="font-sans text-base text-white/40 tracking-wide text-center mt-10"
            style={{ maxWidth: "420px", lineHeight: 1.7 }}
          >
            Ryvo is a boutique digital agency based in Madrid. We exist for brands worth building for. Small by choice. Meticulous by nature.
          </p>
        </div>
      </div>
    </section>
  );
}
