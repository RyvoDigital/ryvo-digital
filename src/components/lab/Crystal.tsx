"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { withMotion, prefersReducedMotion } from "@/lib/gsap";
import { isChromium, lensMap } from "./LiquidGlass";
import { SpecimenSet } from "./Specimens";
import c from "./crystal.module.css";

// Glass round 4: Crystal. C1 is the CSS/SVG crystal for every UI piece; C2 is
// a three.js slab for signature stages where we own the backdrop.

type Tone = "light" | "dark";

/**
 * C1: a clear slab. In Chromium the backdrop bends hard in a band at the edge
 * (a convex squircle-ish bezel, 10–16% of the short side, at least 10 px),
 * and the red, green and blue channels bend by slightly different amounts, so
 * light splits only where it bends (about 1.5 px apart at the rim, none in the
 * flat centre). Everywhere: a few percent of lift and a 1-device-pixel rim.
 */
export function CrystalPane({ tone, className = "", lift = false, style, children, as: Tag = "div", ...rest }: { tone: Tone; className?: string; lift?: boolean; style?: CSSProperties; children?: ReactNode; as?: "div" | "span" } & Record<string, unknown>) {
  const root = useRef<HTMLElement>(null);
  const slab = useRef<HTMLSpanElement>(null);
  const filt = useRef<SVGFilterElement>(null);
  const fe = useRef<SVGFEImageElement>(null);
  const dr = useRef<SVGFEDisplacementMapElement>(null);
  const dg = useRef<SVGFEDisplacementMapElement>(null);
  const db = useRef<SVGFEDisplacementMapElement>(null);
  const id = `c1${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = root.current, sl = slab.current;
    if (!el || !sl || !isChromium()) return;
    let live = false, last = "";
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h || !live) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const key = `${w}|${h}|${Math.round(r)}`;
      if (key === last) return;
      last = key;
      const m = Math.min(w, h);
      // A thick optical edge: the band, and a displacement strong enough that
      // the backdrop visibly compresses and magnifies at the rim.
      const bezel = Math.round(Math.max(10, Math.min(48, m * (m < 70 ? 0.3 : 0.15))));
      const S = Math.round(bezel * (m < 70 ? 0.9 : 1.25));
      const split = Math.min(0.08, 1.6 / Math.max(S, 1)); // ≈ 0.8 px each side at the rim: light splitting, never a coloured blot
      fe.current?.setAttribute("href", lensMap(w, h, Math.round(r), bezel, 0, true));
      for (const n of [fe.current, filt.current]) { n?.setAttribute("width", String(w)); n?.setAttribute("height", String(h)); }
      dr.current?.setAttribute("scale", String(S * (1 + split)));
      dg.current?.setAttribute("scale", String(S));
      db.current?.setAttribute("scale", String(S * (1 - split)));
      sl.style.setProperty("backdrop-filter", `url(#${id}) brightness(1.04) contrast(1.04) saturate(1.06)`);
    };
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      live = e.isIntersecting;
      if (live) measure(); else { sl.style.removeProperty("backdrop-filter"); last = ""; }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [id]);

  // The rim turns a few degrees toward a fine pointer; calm, and off with reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    return withMotion(({ gsap }) => {
      const p = { a: 135 };
      const q = gsap.quickTo(p, "a", { duration: 0.9, ease: "expo.out", onUpdate: () => el.style.setProperty("--ang", `${p.a.toFixed(1)}deg`) });
      const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); q(135 + ((e.clientX - r.left) / r.width - 0.5) * 16); };
      const leave = () => q(135);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
    });
  }, []);

  const T = Tag as "div";
  return (
    <T ref={root as React.Ref<HTMLDivElement>} className={`${c.c1} ${c[tone]} ${lift ? c.lift : ""} ${className}`} style={style} {...rest}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <filter ref={filt} id={id} x="0" y="0" width="1" height="1" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage ref={fe} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap ref={dr} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dR" />
          <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="R" />
          <feDisplacementMap ref={dg} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dG" />
          <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="G" />
          <feDisplacementMap ref={db} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="dB" />
          <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="B" />
          <feBlend in="R" in2="G" mode="screen" result="RG" />
          <feBlend in="RG" in2="B" mode="screen" />
        </filter>
      </svg>
      <span ref={slab} className={c.slab} aria-hidden="true" />
      <span className={c.rim} aria-hidden="true" />
      {children}
    </T>
  );
}

function C1Tabs({ tone }: { tone: Tone }) {
  const [on, setOn] = useState(0);
  const names = ["Automations", "Websites"];
  return (
    <CrystalPane tone={tone} className={`${c.pill} ${c.tabs}`} role="tablist" aria-label="Call type">
      <CrystalPane as="span" tone={tone} lift className={`${c.pill} ${c.thumb}`} style={{ transform: `translateX(${on * 100}%)` }} aria-hidden="true" />
      {names.map((n, i) => (
        <button key={n} role="tab" aria-selected={on === i} tabIndex={on === i ? 0 : -1} className={`${c.tab} ${c.type}`} onClick={() => setOn(i)}
          onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { setOn(1 - i); (e.currentTarget.parentElement?.querySelectorAll("button")[1 - i] as HTMLButtonElement | undefined)?.focus(); } }}>
          {n}
        </button>
      ))}
    </CrystalPane>
  );
}

function C1Switch({ tone, label, initial }: { tone: Tone; label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const lid = useId();
  return (
    <CrystalPane tone={tone} lift className={`${c.pill} ${c.swRow}`} data-on={on} onClick={() => setOn(!on)}>
      <span id={lid} className={`${c.swLabel} ${c.type}`}>{label}</span>
      <button type="button" role="switch" aria-checked={on} aria-labelledby={lid} className={c.sw} onClick={(e) => { e.stopPropagation(); setOn(!on); }}>
        <span className={c.knob} aria-hidden="true" />
      </button>
    </CrystalPane>
  );
}

export function C1Set({ tone, shade = true }: { tone: Tone; shade?: boolean }) {
  return (
    <div className={c.set} data-kind="c1">
      <CrystalPane tone={tone} lift className={c.card}>
        <div className={`${c.type} ${shade ? c.shade : ""}`} style={{ position: "relative", display: "grid", gap: 10 }}>
          <span className={c.kicker}>Inbound concierge</span>
          <h3 className={c.cardTitle}>Every enquiry, answered.</h3>
          <p className={c.cardText}>In a few seconds, in the buyer&rsquo;s language, and the viewing booked. Price and negotiation stay with your team.</p>
        </div>
      </CrystalPane>
      <C1Tabs tone={tone} />
      <C1Switch tone={tone} label="Inbound concierge" initial />
      <C1Switch tone={tone} label="Buyer follow-up" initial={false} />
      <div className={c.setRow}>
        <CrystalPane as="span" tone={tone} lift className={`${c.pill} ${c.chip}`}><span className={c.dot} aria-hidden="true" /><span className={c.type}>Launch pricing</span></CrystalPane>
      </div>
    </div>
  );
}

// ── C2: a three.js crystal slab over a backdrop we own ─────────────────────
type Backdrop = "object" | "glow" | "room";

export function C2Stage({ backdrop }: { backdrop: Backdrop }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    let stage: { start: () => void; stop: () => void; resize: () => void; dispose: () => void; still: () => void } | null = null;
    let onScreen = false, disposed = false;
    const still = prefersReducedMotion();
    const run = () => { if (!stage || still) return; if (onScreen && document.visibilityState === "visible") stage.start(); else stage.stop(); };
    const load = async () => {
      try {
        const { createCrystal } = await import("./crystal-scene");
        if (disposed) return;
        stage = await createCrystal(canvas, backdrop);
        if (disposed) { stage.dispose(); return; }
        setReady(true);
        if (still) stage.still();
        run();
      } catch { /* no WebGL: the poster stays */ }
    };
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); load(); } }, { rootMargin: "500px 0px" });
    const seen = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    near.observe(el); seen.observe(el);
    const ro = new ResizeObserver(() => stage?.resize());
    ro.observe(el);
    document.addEventListener("visibilitychange", run);
    return () => { disposed = true; near.disconnect(); seen.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", run); stage?.dispose(); };
  }, [backdrop]);
  const poster = backdrop === "room" ? "/media/websites/gallery-1000.webp" : backdrop === "object" ? "/media/objects/02-reactivation-800.webp" : undefined;
  return (
    <div ref={box} className={`${c.stage} ${backdrop === "room" ? c.light : c.dark}`} data-ready={ready} data-kind="c2">
      {poster && <div className={c.poster} style={{ backgroundImage: `url(${poster})`, backgroundSize: backdrop === "object" ? "70%" : "cover" }} aria-hidden="true" />}
      <canvas ref={cv} aria-hidden="true" />
      <div className={c.slabText}>
        <h3 className={c.cardTitle}>Every enquiry, answered.</h3>
        <p className={c.cardText}>In a few seconds, in the buyer&rsquo;s language, and the viewing booked.</p>
      </div>
    </div>
  );
}

const COLUMNS = [
  { key: "b", name: "B · Crystal (round 3)", line: "The pick, as it was: clear, a soft edge bend, one hairline." },
  { key: "c1", name: "C1 · CSS crystal", line: "Zero blur, a thick refracting edge, light split only in the bend, a 1 px rim. For every UI piece." },
  { key: "c2", name: "C2 · WebGL crystal", line: "A real three.js slab: transmission, ior 1.75, dispersion. For stages where we own the backdrop." },
];

const ROWS: { key: Backdrop; label: string; tone: Tone }[] = [
  { key: "object", label: "1 · Over a chrome object (the main test)", tone: "dark" },
  { key: "glow", label: "2 · Over the mercury glow on obsidian", tone: "dark" },
  { key: "room", label: "3 · Over the light room photo", tone: "light" },
];

export function CrystalRound() {
  return (
    <>
      <div className={c.heads}>
        {COLUMNS.map((col) => (
          <div key={col.key} className={c.head}>
            <h2 className={c.headName}>{col.name}</h2>
            <p className={c.headLine}>{col.line}</p>
          </div>
        ))}
      </div>
      {ROWS.map((row) => (
        <section key={row.key} id={`r4-${row.key}`} aria-label={row.label}>
          <p className={`mono-label ${c.rowLabel}`}>{row.label}</p>
          <div className={c.row}>
            {(["b", "c1"] as const).map((k) => (
              <div key={k} id={`r4-${row.key}-${k}`} className={`${c.panel} ${c[row.key]}`}>
                <span className={`mono-label ${c.cellLabel}`}>{COLUMNS.find((x) => x.key === k)!.name}</span>
                {row.key === "room" ? (
                  k === "b" ? <SpecimenSet kind="crystal" tone={row.tone} /> : <C1Set tone={row.tone} />
                ) : (
                  <div className={`${c.stack} ${row.key === "object" ? c.stackObj : ""}`}>
                    {row.key === "glow" && <span className={c.stackRing} aria-hidden="true" />}
                    {k === "b" ? <SpecimenSet kind="crystal" tone={row.tone} /> : <C1Set tone={row.tone} />}
                  </div>
                )}
              </div>
            ))}
            <div id={`r4-${row.key}-c2`}>
              <C2Stage backdrop={row.key} />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
