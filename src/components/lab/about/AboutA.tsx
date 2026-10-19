"use client";

import { useEffect, useRef } from "react";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";
import { BookButton } from "@/components/chrome/Icons";
import WordReveal, { Words } from "@/components/chrome/WordReveal";
import { startMotion, refreshWhenSettled } from "@/components/automations/motion";
import { CITIES } from "../globe-shared";
import RouteGlobe from "./RouteGlobe";
import { proofFigure, type AboutContent } from "./content";
import s from "./AboutA.module.css";

// Direction A: proof, then the route. An editorial long page in one column of
// thought: the figure first (giant, counting once), the statement, the team as
// a calm split with a rail per side (a dot where a person works), and the
// globe last, as the close: a sticky stage where the scroll draws Lisbon →
// Madrid and the page's own rail fills with it. Quiet everywhere else.
export default function AboutA({ c }: { c: AboutContent }) {
  const { lang, t, p, people, cities, book, cta } = c;
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const ends = useRef<(HTMLDivElement | null)[]>([]);
  const fig = proofFigure(p.proof);

  // The page's echo of the arc: its rail fills as the globe draws, Madrid
  // lights when the route arrives. Written straight to the DOM, every frame.
  const onArc = (a: number) => {
    // A vertical rail on wide screens, a horizontal one on phones.
    if (fill.current) fill.current.style.transform = window.innerWidth >= 1024 ? `scaleY(${a})` : `scaleX(${a})`;
    const m = ends.current[1];
    if (m) { const on = String(a >= 1); if (m.dataset.on !== on) m.dataset.on = on; }
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    startMotion().then((m) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger, SplitText, reduced } = m;
      el.dataset.motion = reduced ? "reduced" : "on";
      if (reduced) return;
      const ctx = gsap.context(() => {
        const q = (sel: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<HTMLElement>(sel));
        const once = (trigger: Element, start: string, fn: () => void) => ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });

        // ── Hero: the figure rises out of its mask and counts, once ─────────
        const hero = el.querySelector<HTMLElement>("[data-hero]")!;
        const count = hero.querySelector<HTMLElement>("[data-count]")!;
        const o = { v: 0 };
        count.textContent = fig.format(0) + "+";
        hero.dataset.ready = "true";
        gsap.fromTo(hero.querySelector("[data-fig]"), { yPercent: 104 }, { yPercent: 0, duration: 1.4, ease: "expo.out", delay: 0.05 });
        gsap.to(o, { v: fig.to, duration: 2.4, ease: "expo.out", delay: 0.25, onUpdate: () => { count.textContent = fig.format(Math.round(o.v / 10) * 10) + "+"; }, onComplete: () => { count.textContent = p.proof; } });
        gsap.fromTo(q("[data-rise]", hero), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, delay: 0.55, ease: "expo.out" });
        // Leaving: a slow parallax, the figure drifting slower than the page.
        gsap.to(hero.querySelector("[data-fig-wrap]"), { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(q("[data-hero-copy]", hero), { y: -36, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "30% top", end: "bottom 10%", scrub: true } });

        // ── Headlines rise out of their masks ───────────────────────────────
        for (const h of q("[data-split]")) {
          SplitText.create(h, {
            type: "lines", mask: "lines", autoSplit: true,
            onSplit(self) {
              h.dataset.ready = "true";
              return gsap.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 82%", once: true } });
            },
          });
        }

        // ── The team: the rails draw, then each person settles in ───────────
        const team = el.querySelector<HTMLElement>("[data-team]")!;
        const rails = q("[data-rail]", team), dots = q("[data-dot]", team), rows = q("[data-person]", team), heads = q("[data-side-head]", team);
        gsap.set(rails, { scaleY: 0 });
        gsap.set(dots, { scale: 0 });
        gsap.set([...heads, ...rows], { opacity: 0, y: 24 });
        once(team, "top 72%", () => {
          gsap.to(heads, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 });
          gsap.to(rails, { scaleY: 1, duration: 1.8, ease: "expo.inOut", delay: 0.15 });
          gsap.to(rows, { opacity: 1, y: 0, duration: 1.3, stagger: 0.14, delay: 0.35 });
          gsap.to(dots, { scale: 1, duration: 0.9, stagger: 0.1, delay: 0.7, ease: "expo.out" });
        });
        // The monograms drift a little slower than their rows (a subtle depth).
        for (const mono of q("[data-mono]", team)) {
          gsap.fromTo(mono, { yPercent: 14 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: mono, start: "top bottom", end: "bottom top", scrub: true } });
        }

        // ── The route: the stage's text settles in as the sticky arrives ────
        const stage = route.current!;
        const rIn = q("[data-route-in]", stage);
        gsap.set(rIn, { opacity: 0, y: 20 });
        once(stage, "top 45%", () => gsap.to(rIn, { opacity: 1, y: 0, duration: 1.2, stagger: 0.09 }));

        // ── The close ───────────────────────────────────────────────────────
        const close = el.querySelector<HTMLElement>("[data-close]")!;
        const cIn = q("[data-close-in]", close);
        gsap.set(cIn, { opacity: 0, y: 18 });
        once(close, "top 62%", () => gsap.to(cIn, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.3 }));
      }, el);
      refreshWhenSettled(m);
      revert = () => ctx.revert();
    });
    return () => { cancelled = true; revert?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [lisbon, madrid] = CITIES;

  return (
    <div ref={root} className={s.page}>
      <header className={s.top}>
        <SiteNav lang={lang} t={t} bookHref={book} path="/about" />
      </header>

      <main>
        {/* ── Hero: the figure ─────────────────────────────────────────────── */}
        <section className={s.hero} data-hero aria-labelledby="about-title">
          <div className={s.heroGlow} aria-hidden="true" />
          <div className={s.heroTop} data-hero-copy>
            <span className="mono-label" data-rise>{p.label}</span>
            <span className="mono-label" data-rise>{t.footer.place}</span>
          </div>
          <h1 id="about-title" className={s.h1}>
            <span className={s.figWrap} data-fig-wrap>
              <span className={s.figMask}>
                <span className={`display chrome-text ${s.fig}`} data-fig aria-hidden="true">
                  <span className={s.figGhost}>{p.proof}</span>
                  <span className={s.figCount} data-count>{p.proof}</span>
                </span>
              </span>
            </span>
            <span className="sr-only">{p.proof} </span>
            <span className={`display ${s.figLabel}`} data-hero-copy><span data-rise className="block">{p.proofLabel}</span></span>
          </h1>
          <div className={s.heroBody} data-hero-copy>
            <p className={s.lead} data-rise>{p.proofBody}</p>
            <div data-rise><BookButton href={book} label={t.nav.book} /></div>
          </div>
        </section>

        {/* ── The statement ───────────────────────────────────────────────── */}
        <section className={s.statement} aria-labelledby="built-title">
          <div className={s.stmtHead}>
            <h2 id="built-title" className={`display ${s.h2}`} data-split>
              <span className="block">{p.title[0]}</span>
              <span className={`block ${s.dim}`}>{p.title[1]}</span>
            </h2>
          </div>
          <WordReveal as="p" className={s.intro} start="top 85%" end="bottom 45%"><Words text={p.intro} /></WordReveal>
        </section>

        {/* ── The team: one rail per side, a dot where each person works ───── */}
        <section className={s.team} data-team aria-labelledby="team-label">
          <span id="team-label" className="mono-label">{p.teamLabel}</span>
          <div className={s.grid}>
            {p.sides.map((side, k) => (
              <div key={side} className={s.sideHead} data-side-head style={{ gridColumn: k + 1 }}>
                <span className={s.sideIdx}>0{k + 1}</span>
                <span className={s.sideName}>{side}</span>
              </div>
            ))}
            <span className={s.rail} data-rail style={{ gridColumn: 1 }} aria-hidden="true" />
            <span className={s.rail} data-rail style={{ gridColumn: 2 }} aria-hidden="true" />
            {people.map((m, i) => {
              const both = m.sides[0] && m.sides[1];
              return (
                <article key={m.key} className={s.person} data-person data-both={both} style={{ gridColumn: both ? "1 / -1" : m.sides[0] ? 1 : 2, gridRow: i + 2 }}>
                  {m.sides.map((on, k) => on && <span key={k} className={s.dot} data-dot data-col={k} aria-hidden="true" />)}
                  <span className={`display ${s.mono}`} data-mono aria-hidden="true">{m.mono}</span>
                  <div className={s.pText}>
                    <h3 className={`display ${s.pName}`}>{m.name}</h3>
                    <span className="mono-label">{m.role}</span>
                    {m.line && <p className={s.pLine}>{m.line}</p>}
                    <ul className={s.pSides}>
                      {m.sides.map((on, k) => on && <li key={k}>{p.sides[k]}</li>)}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Where we work: the signature ────────────────────────────────── */}
        <section ref={route} className={s.route} aria-labelledby="where-label">
          <div className={s.sticky}>
            <RouteGlobe
              track={route} range={["top top", "bottom bottom"]} framing="right" names={cities} tags={false} onArc={onArc}
              className={s.globe} label={`${cities[0]} – ${cities[1]}: ${lisbon.coords}, ${madrid.coords}`}
            />
            <div className={s.routeText}>
              <span id="where-label" className="mono-label" data-route-in>{p.citiesLabel}</span>
              <div className={s.ledger} data-route-in>
                <div className={s.end} ref={(n) => { ends.current[0] = n; }} data-on="true">
                  <span className={`display ${s.city}`}>{cities[0]}</span>
                  <span className="mono-label">{lisbon.coords}</span>
                </div>
                <div className={s.track} aria-hidden="true">
                  <span className={s.trackFill} ref={fill} />
                  <span className={`mono-label ${s.trackKm}`}>503 KM</span>
                </div>
                <div className={s.end} ref={(n) => { ends.current[1] = n; }} data-on="false">
                  <span className={`display ${s.city}`}>{cities[1]}</span>
                  <span className="mono-label">{madrid.coords}</span>
                </div>
              </div>
            </div>
            <p className={s.company} data-route-in>{p.company}</p>
          </div>
        </section>

        {/* ── The close ──────────────────────────────────────────────────── */}
        <section className={s.close} data-close aria-labelledby="cta-title">
          <div className={s.closeGlow} aria-hidden="true" />
          <span className="mono-label" data-close-in>{cta.label}</span>
          <h2 id="cta-title" className={`display ${s.closeH2}`} data-split>
            <span className="block">{cta.title[0]}</span>
            <span className={`block ${s.dim}`}>{cta.title[1]}</span>
          </h2>
          <p className={s.closeBody} data-close-in>{cta.body}</p>
          <div data-close-in><BookButton href={book} label={t.nav.book} /></div>
        </section>
      </main>

      <SiteFooter lang={lang} t={t} bookHref={book} />
    </div>
  );
}
