"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { Globe } from "./globe-scene";
import { CITIES, FOCUS, view, toVec, unpack } from "@/components/about/globe-shared";
import s from "./palette.module.css";

// ── 12 Two cities, on a globe ───────────────────────────────────────────────
// three.js and the dot set load only when the piece is near; the globe renders
// only while on screen. Labels are HTML (crisp mono type), placed from the
// scene's projection each frame. A mouse drag nudges it, calmly; touch is left
// to the page, so it never traps scroll. Reduced motion: one still frame, the
// arc drawn. No WebGL: the same frame drawn as a 2D dot poster.
export function CitiesGlobe() {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const km = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    let globe: Globe | null = null;
    let onScreen = false, disposed = false;
    const still = prefersReducedMotion();

    const place = (labels: { x: number; y: number; on: boolean }[], settled: boolean) => {
      labels.forEach((l, i) => {
        const t = tags.current[i];
        if (!t) return;
        t.style.transform = `translate(${l.x}px, ${l.y}px)`;
        t.dataset.on = String(settled && l.on);
      });
      if (km.current) {
        km.current.style.transform = `translate(${(labels[0].x + labels[1].x) / 2}px, ${Math.max(labels[0].y, labels[1].y) + 18}px)`;
        km.current.dataset.on = String(settled);
      }
    };

    const run = () => {
      if (!globe || still) return;
      if (onScreen && document.visibilityState === "visible") globe.start();
      else globe.stop();
    };

    const load = async () => {
      try {
        const { createGlobe } = await import("./globe-scene");
        if (disposed) return;
        globe = createGlobe(canvas, place);
        setReady(true);
        if (still) globe.still();
        run();
      } catch {
        // No WebGL: the same settled frame as a 2D dot poster.
        const { SPARSE, DENSE } = await import("@/components/about/globe-dots");
        if (!disposed) { place(drawPoster(canvas, SPARSE, DENSE), true); setReady(true); }
      }
    };

    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); load(); } }, { rootMargin: "600px 0px" });
    const seen = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    near.observe(el);
    seen.observe(el);
    const ro = new ResizeObserver(() => globe?.resize());
    ro.observe(el);
    document.addEventListener("visibilitychange", run);

    // A calm mouse drag: a small nudge that eases home on release.
    let drag: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { if (e.pointerType !== "mouse" || still) return; drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); el.dataset.drag = "true"; };
    const move = (e: PointerEvent) => { if (drag) globe?.nudge((e.clientX - drag.x) * 0.0035, (e.clientY - drag.y) * 0.0028); };
    const up = () => { if (!drag) return; drag = null; globe?.nudge(0, 0); el.dataset.drag = "false"; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    return () => {
      disposed = true;
      near.disconnect(); seen.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", run);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      globe?.dispose();
    };
  }, []);

  return (
    <div ref={box} className={`${s.stage} ${s.globe}`} data-ready={ready}>
      <canvas ref={cv} className={s.globeCanvas} role="img" aria-label="A globe turning to Iberia: Lisbon and Madrid, joined by an arc, 503 km apart" />
      {CITIES.map((c, i) => (
        <div key={c.key} ref={(n) => { tags.current[i] = n; }} className={s.globeTag} data-side={i === 0 ? "left" : "right"} data-on="false" aria-hidden="true">
          <span className={s.globeName}>{c.name}</span>
          <span className="mono-label">{c.coords}</span>
        </div>
      ))}
      <div ref={km} className={s.globeKm} data-on="false" aria-hidden="true"><span className="mono-label">503 KM</span></div>
    </div>
  );
}

// The settled frame in 2D: the same rotation and framing as the scene, dots
// drawn as discs, the arc drawn. Used only when WebGL is not available.
function drawPoster(canvas: HTMLCanvasElement, sparse: string, dense: string) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const v = view.frame(w / h);
  const f = h / (2 * Math.tan((view.fov * Math.PI) / 360));
  const yaw = (-FOCUS.lon * Math.PI) / 180, pitch = (FOCUS.lat * Math.PI) / 180;
  const proj = (p: { x: number; y: number; z: number }) => {
    const x1 = p.x * Math.cos(yaw) + p.z * Math.sin(yaw), z1 = -p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
    const y2 = p.y * Math.cos(pitch) - z1 * Math.sin(pitch), z2 = p.y * Math.sin(pitch) + z1 * Math.cos(pitch);
    const d = v.dist - z2;
    return { x: w / 2 + f * (x1 / d - v.ox / v.dist), y: h / 2 - f * (y2 / d - v.oy / v.dist), z: z2, d };
  };
  ctx.fillStyle = "rgba(205,209,217,.85)";
  for (const [set, sp] of [[sparse, 0.0068], [dense, 0.0052]] as const) {
    for (const p of unpack(set)) {
      const q = proj(toVec(p.lat, p.lon, 1));
      if (q.z < 1 / v.dist) continue;
      ctx.beginPath();
      ctx.arc(q.x, q.y, Math.max(0.6, (sp * 0.46 * f) / q.d / 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const pts = CITIES.map((c) => proj(toVec(c.lat, c.lon, 1)));
  ctx.strokeStyle = "rgba(250,251,252,.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  ctx.quadraticCurveTo((pts[0].x + pts[1].x) / 2, Math.min(pts[0].y, pts[1].y) - 60, pts[1].x, pts[1].y);
  ctx.stroke();
  return pts.map((p) => ({ x: p.x, y: p.y, on: true }));
}
