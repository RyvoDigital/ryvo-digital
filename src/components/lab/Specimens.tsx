"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { isChromium, lensMap } from "./LiquidGlass";
import s from "./specimens.module.css";

// Glass round 3 (RESEARCH.md §B): three borderless materials, one set each.
// Nothing outlines a shape. The edge is light and shadow: one top hairline
// that fades before the corners, and three very soft shadow layers.

export type Kind = "satin" | "crystal" | "smoked";
export type Tone = "light" | "dark";

/** One pane of glass. Crystal alone bends the backdrop, softly, at the very edge. */
function Pane({ kind, tone, className = "", lift = false, style, children, as: Tag = "div", ...rest }: { kind: Kind; tone: Tone; className?: string; lift?: boolean; style?: CSSProperties; children?: ReactNode; as?: "div" | "span" } & Record<string, unknown>) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLSpanElement>(null);
  const fe = useRef<SVGFEImageElement>(null);
  const filt = useRef<SVGFilterElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const id = `cr${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = root.current, b = bg.current;
    if (kind !== "crystal" || !el || !b || !isChromium()) return;
    let live = false, last = "";
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h || !live) return;
      const cs = getComputedStyle(el);
      // A squircle corner sits inside a circle of the same radius; the bend is
      // kept low, so a circular lens profile is close enough at the edge.
      const r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2) * (CSS.supports("corner-shape", "squircle") ? 0.7 : 1);
      const key = `${w}|${h}|${Math.round(r)}`;
      if (key === last) return;
      last = key;
      const bezel = Math.round(Math.min(16, Math.max(6, Math.min(w, h) * 0.2)));
      fe.current?.setAttribute("href", lensMap(w, h, Math.round(r), bezel, 0));
      for (const n of [fe.current, filt.current]) { n?.setAttribute("width", String(w)); n?.setAttribute("height", String(h)); }
      // Barely: enough to feel the edge, never a seam (pills bend least).
      disp.current?.setAttribute("scale", String(Math.round(bezel * (h < 60 ? 0.28 : 0.42))));
      b.style.setProperty("backdrop-filter", `url(#${id})`);
    };
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      live = e.isIntersecting;
      if (live) measure(); else { b.style.removeProperty("backdrop-filter"); last = ""; }
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, [kind, id]);

  const T = Tag as "div";
  return (
    <T ref={root as React.Ref<HTMLDivElement>} className={`${s.pane} ${s[kind]} ${s[tone]} ${lift ? s.lift : ""} ${className}`} style={style} {...rest}>
      {kind === "crystal" && (
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
          <filter ref={filt} id={id} x="0" y="0" width="1" height="1" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage ref={fe} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      {/* The hairline lives inside the clipped background, so it can never
          run past the shape where a squircle corner curves away. */}
      <span ref={bg} className={s.bg} aria-hidden="true"><span className={s.hair} /></span>
      {children}
    </T>
  );
}

function Tabs({ kind, tone }: { kind: Kind; tone: Tone }) {
  const [on, setOn] = useState(0);
  const names = ["Automations", "Websites"];
  return (
    <Pane kind={kind} tone={tone} className={`${s.pill} ${s.tabs}`} role="tablist" aria-label="Call type">
      <Pane as="span" kind={kind} tone={tone} lift className={`${s.pill} ${s.thumb}`} style={{ transform: `translateX(${on * 100}%)` }} aria-hidden="true" />
      {names.map((n, i) => (
        <button key={n} role="tab" aria-selected={on === i} tabIndex={on === i ? 0 : -1} className={s.tab} onClick={() => setOn(i)}
          onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { setOn(1 - i); (e.currentTarget.parentElement?.querySelectorAll("button")[1 - i] as HTMLButtonElement | undefined)?.focus(); } }}>
          {n}
        </button>
      ))}
    </Pane>
  );
}

function SwitchRow({ kind, tone, label, initial }: { kind: Kind; tone: Tone; label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const lid = useId();
  return (
    <Pane kind={kind} tone={tone} lift className={`${s.pill} ${s.swRow}`} data-on={on} onClick={() => setOn(!on)}>
      <span id={lid} className={s.swLabel}>{label}</span>
      <button type="button" role="switch" aria-checked={on} aria-labelledby={lid} className={s.sw} onClick={(e) => { e.stopPropagation(); setOn(!on); }}>
        <span className={s.knob} aria-hidden="true" />
      </button>
    </Pane>
  );
}

/** The same set, in one material, over one backdrop. */
export function SpecimenSet({ kind, tone }: { kind: Kind; tone: Tone }) {
  return (
    <div className={s.set} data-kind={kind}>
      <Pane kind={kind} tone={tone} lift className={s.card}>
        <span className={s.kicker}>Inbound concierge</span>
        <h3 className={s.cardTitle}>Every enquiry, answered.</h3>
        <p className={s.cardText}>In a few seconds, in the buyer&rsquo;s language, and the viewing booked. Price and negotiation stay with your team.</p>
      </Pane>
      <Tabs kind={kind} tone={tone} />
      <SwitchRow kind={kind} tone={tone} label="Inbound concierge" initial />
      <SwitchRow kind={kind} tone={tone} label="Buyer follow-up" initial={false} />
      <div className={s.setRow}>
        <Pane as="span" kind={kind} tone={tone} lift className={`${s.pill} ${s.chip}`}><span className={s.dot} aria-hidden="true" /><span>Launch pricing</span></Pane>
      </div>
    </div>
  );
}

const KINDS: { kind: Kind; name: string; line: string }[] = [
  { kind: "satin", name: "A · Satin", line: "Acid-etched frost: a soft, even blur and a whisper of white. Quiet and tactile." },
  { kind: "crystal", name: "B · Crystal", line: "Almost invisible: no blur, a soft bend at the very edge, one hairline of light." },
  { kind: "smoked", name: "C · Smoked", line: "Deep tinted glass, like a watch crystal at night. Discreet and heavy." },
];

const BACKDROPS: { key: "room" | "glow" | "object"; label: string; tone: Tone }[] = [
  { key: "room", label: "1 · Over the light room photo", tone: "light" },
  { key: "glow", label: "2 · Over the mercury glow on obsidian", tone: "dark" },
  { key: "object", label: "3 · Over a chrome object", tone: "dark" },
];

export function Specimens() {
  return (
    <>
      <div className={s.heads}>
        {KINDS.map((k) => (
          <div key={k.kind} className={s.head}>
            <h2 className={s.headName}>{k.name}</h2>
            <p className={s.headLine}>{k.line}</p>
          </div>
        ))}
      </div>
      {BACKDROPS.map((b) => (
        <section key={b.key} id={`bd-${b.key}`} aria-label={b.label}>
          <p className={`mono-label ${s.rowLabel}`}>{b.label}</p>
          <div className={s.row}>
            {KINDS.map((k) => (
              <div key={k.kind} id={`${b.key}-${k.kind}`} className={`${s.panel} ${s[b.key]}`}>
                <span className={`mono-label ${s.cellLabel}`} style={{ color: b.tone === "light" ? "#3a3e44" : undefined }}>{k.name}</span>
                {b.key === "glow" && <span className={s.glowRing} aria-hidden="true" />}
                {b.key === "object" && <img className={s.objectImg} src="/media/objects/02-reactivation-800.webp" alt="" />}
                <SpecimenSet kind={k.kind} tone={b.tone} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
