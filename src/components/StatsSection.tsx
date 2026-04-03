"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Stats config ─────────────────────────────────────────────────────────────
const STATS = [
  {
    key: "satisfaction",
    value: "100%",
    label: "Client satisfaction",
    position: "top-[18%] left-[8%]",
    align: "items-start",
    textAlign: "text-left",
  },
  {
    key: "custom",
    value: "Custom",
    label: "Built, never templated",
    position: "top-[22%] right-[8%]",
    align: "items-end",
    textAlign: "text-right",
  },
  {
    key: "load",
    value: "< 2s",
    label: "Average load time",
    position: "bottom-[22%] left-[12%]",
    align: "items-start",
    textAlign: "text-left",
  },
  {
    key: "response",
    value: "< 24h",
    label: "Response guaranteed",
    position: "bottom-[18%] right-[8%]",
    align: "items-end",
    textAlign: "text-right",
  },
];

// SVG lines: pairs of stat indices to connect [from, to]
// Creates an X cross — 100% → <24h diagonal + Custom → <2s diagonal
const LINE_PAIRS = [
  [0, 3], // 100% → <24h (top-left to bottom-right)
  [1, 2], // Custom → <2s (top-right to bottom-left)
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Measure dot positions and set SVG line endpoints ─────────────────────
  useEffect(() => {
    const updateLines = () => {
      LINE_PAIRS.forEach(([fromIdx, toIdx], i) => {
        const lineEl = lineRefs.current[i];
        const fromDot = dotRefs.current[fromIdx];
        const toDot = dotRefs.current[toIdx];
        if (!lineEl || !fromDot || !toDot) return;

        const fromRect = fromDot.getBoundingClientRect();
        const toRect = toDot.getBoundingClientRect();

        const x1 = ((fromRect.left + fromRect.width / 2) / window.innerWidth * 100).toFixed(2);
        const y1 = ((fromRect.top + fromRect.height / 2) / window.innerHeight * 100).toFixed(2);
        const x2 = ((toRect.left + toRect.width / 2) / window.innerWidth * 100).toFixed(2);
        const y2 = ((toRect.top + toRect.height / 2) / window.innerHeight * 100).toFixed(2);

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

  // ── GSAP staggered fade-in on scroll ─────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = statRefs.current.filter(Boolean);
    const svgEl = section.querySelector("svg");

    gsap.set([...items, svgEl], { opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      toggleActions: "play none none none",
      onEnter: () => {
        gsap.to(svgEl, { opacity: 1, duration: 1, ease: "power2.out", delay: 0.2 });
        gsap.to(items, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#080808] h-screen overflow-hidden"
    >
      {/* ── SVG connector lines ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ overflow: "visible" }}
      >
        {LINE_PAIRS.map(([fromIdx, toIdx], i) => (
          <line
            key={`${fromIdx}-${toIdx}`}
            ref={(el) => { lineRefs.current[i] = el; }}
            x1="50%" y1="20%"
            x2="50%" y2="80%"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}
        {/* Anchor dots at each stat */}
        {STATS.map((_, i) => {
          const dot = dotRefs.current[i];
          if (!dot) return null;
          return null; // dots rendered inline, circles drawn separately below
        })}
      </svg>

      {/* ── Stats ── */}
      {STATS.map((stat, i) => (
        <div
          key={stat.key}
          ref={(el) => { statRefs.current[i] = el; }}
          className={`absolute ${stat.position} flex flex-col ${stat.align}`}
        >
          {/* Value — dot on inner (center-facing) edge */}
          <div className="flex items-center gap-3">
            {stat.align === "items-end" && (
              <span
                ref={(el) => { dotRefs.current[i] = el; }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0"
              />
            )}
            <span
              className={`font-display font-black text-white leading-none ${stat.textAlign}`}
              style={{ fontSize: "clamp(40px, 5vw, 80px)" }}
            >
              {stat.value}
            </span>
            {stat.align === "items-start" && (
              <span
                ref={(el) => { dotRefs.current[i] = el; }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0"
              />
            )}
          </div>
          {/* Label */}
          <p className={`font-mono text-[10px] tracking-[0.25em] text-white/30 uppercase mt-3 ${stat.textAlign}`}>
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}
