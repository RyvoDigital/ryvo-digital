"use client";

import { useEffect, useRef } from "react";
import SiteNav from "@/components/chrome/SiteNav";
import PageFrame from "@/components/pages/PageFrame";
import { BookButton } from "@/components/chrome/Icons";
import WordReveal, { Words } from "@/components/chrome/WordReveal";
import { startMotion, refreshWhenSettled } from "@/components/automations/motion";
import { CITIES } from "./globe-shared";
import RouteGlobe from "./RouteGlobe";
import type { AboutContent } from "./content";
import s from "./AboutPage.module.css";

// /about (direction B, approved 19 Oct 2026): the route opens. The page starts on the globe: the headline
// over it, the globe turning in under it, and the first screen of scroll draws
// Lisbon → Madrid as the camera closes on Iberia. Then a two-column reading
// layout: a sticky rail on the left (a giant chapter numeral that rolls, the
// index, the company line), the chapters on the right: the figure wiped in,
// the statement, the team as a ledger of people by side, the two cities.
export default function AboutPage({ c }: { c: AboutContent }) {
  const { lang, t, p, people, cities, book, cta } = c;
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const chapters = [p.proof, p.teamLabel, p.citiesLabel];

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
        const h = hero.current!;

        // ── Hero: the headline rises; while the route draws it drifts up ───
        for (const t of q("[data-split]")) {
          const first = h.contains(t);
          SplitText.create(t, {
            type: "lines", mask: "lines", autoSplit: true,
            onSplit(self) {
              t.dataset.ready = "true";
              return gsap.from(self.lines, { yPercent: 108, duration: 1.3, stagger: 0.08, ease: "expo.out", delay: first ? 0.1 : 0, scrollTrigger: first ? undefined : { trigger: t, start: "top 84%", once: true } });
            },
          });
        }
        gsap.fromTo(q("[data-rise]", h), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.5 });
        gsap.to(h.querySelector("[data-hero-head]"), { yPercent: -22, opacity: 0.0, ease: "none", scrollTrigger: { trigger: h, start: "top top", end: "65% top", scrub: true } });
        gsap.to(h.querySelector("[data-hero-foot]"), { opacity: 0, ease: "none", scrollTrigger: { trigger: h, start: "55% top", end: "bottom bottom", scrub: true } });

        // ── The rail: the numeral rolls to the chapter in view ──────────────
        const roll = el.querySelector<HTMLElement>("[data-roll]")!;
        const items = q("[data-index]");
        const go = (i: number) => {
          roll.style.transform = `translate3d(0, ${-i * 100 / chapters.length}%, 0)`;
          items.forEach((a, k) => (a.dataset.active = String(k === i)));
        };
        q("[data-chapter]").forEach((ch, i) => {
          ScrollTrigger.create({ trigger: ch, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && go(i) });
        });
        // A slow parallax on the rail's numeral: it drifts against the page.
        gsap.fromTo(el.querySelector("[data-rail-num]"), { y: 40 }, { y: -40, ease: "none", scrollTrigger: { trigger: el.querySelector("[data-body]"), start: "top bottom", end: "bottom top", scrub: true } });

        // ── 01 · the figure wipes in, left to right, with the scroll ────────
        const fig = el.querySelector<HTMLElement>("[data-wipe]")!;
        gsap.fromTo(fig, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: fig, start: "top 88%", end: "top 40%", scrub: 0.6 } });
        gsap.fromTo(el.querySelector("[data-wipe-edge]"), { left: "0%", opacity: 1 }, { left: "100%", opacity: 0, ease: "none", scrollTrigger: { trigger: fig, start: "top 88%", end: "top 40%", scrub: 0.6 } });

        // ── Simple pieces settle in once ────────────────────────────────────
        for (const sec of q("[data-chapter], [data-close]")) {
          const its = q("[data-in]", sec);
          if (!its.length) continue;
          gsap.set(its, { opacity: 0, y: 22 });
          once(sec, "top 74%", () => gsap.to(its, { opacity: 1, y: 0, duration: 1.15, stagger: 0.07 }));
        }

        // ── 02 · the ledger: rows rule in, then the marks light ─────────────
        const ledger = el.querySelector<HTMLElement>("[data-ledger]")!;
        const rules = q("[data-rule]", ledger), rows = q("[data-row]", ledger), marks = q("[data-mark]", ledger);
        gsap.set(rules, { scaleX: 0 });
        gsap.set(rows, { opacity: 0, y: 18 });
        gsap.set(marks, { scale: 0 });
        once(ledger, "top 76%", () => {
          gsap.to(rules, { scaleX: 1, duration: 1.5, stagger: 0.12, ease: "expo.inOut" });
          gsap.to(rows, { opacity: 1, y: 0, duration: 1.3, stagger: 0.12, delay: 0.2 });
          gsap.to(marks, { scale: 1, duration: 0.8, stagger: 0.08, delay: 0.6 });
        });

        // ── 03 · the small route draws as it arrives ────────────────────────
        const path = el.querySelector<SVGPathElement>("[data-mini-route]");
        if (path) {
          const len = path.getTotalLength();
          gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: path, start: "top 80%", once: true } });
        }
      }, el);
      refreshWhenSettled(m);
      revert = () => ctx.revert();
    });
    return () => { cancelled = true; revert?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [lisbon, madrid] = CITIES;

  return (
    <PageFrame lang={lang} t={t} bookHref={book}>
    <div ref={root} className={s.page}>
      <header className={s.top}>
        <SiteNav lang={lang} t={t} bookHref={book} path="/about" />
      </header>

      <main>
        {/* ── Hero: where we work, drawn as you scroll ─────────────────────── */}
        <section ref={hero} className={s.hero} data-hero aria-labelledby="about-title">
          <div className={s.sticky}>
            <RouteGlobe
              track={hero} range={["top top", "bottom bottom"]} framing="hero" names={cities} km={p.km} eager
              className={s.globe} label={`${cities[0]} – ${cities[1]}: ${lisbon.coords}, ${madrid.coords}`}
            />
            <div className={s.heroHead} data-hero-head>
              <span className="mono-label" data-rise>{p.label}</span>
              <h1 id="about-title" className={`display ${s.h1}`} data-split>
                <span className="block">{p.title[0]}</span>
                <span className={`block ${s.dim}`}>{p.title[1]}</span>
              </h1>
            </div>
            <dl className={s.heroFoot} data-hero-foot>
              <dt className="mono-label" data-rise>{p.citiesLabel}</dt>
              {[lisbon, madrid].map((cty, i) => (
                <dd key={cty.key} className={s.coord} data-rise>
                  <span className={s.coordName}>{cities[i]}</span>
                  <span className="mono-label">{cty.coords}</span>
                </dd>
              ))}
            </dl>
          </div>
        </section>

        {/* ── The reading layout: the rail, then the chapters ──────────────── */}
        <div className={s.body} data-body>
          <aside className={s.rail} aria-label={p.label}>
            <div className={s.railIn}>
              <div className={s.numMask} data-rail-num aria-hidden="true">
                <div className={s.roll} data-roll>
                  {chapters.map((_, i) => <span key={i} className={`display chrome-text ${s.num}`}>0{i + 1}</span>)}
                </div>
              </div>
              <ol className={s.index}>
                {chapters.map((name, i) => (
                  <li key={name}>
                    <a href={`#ch-${i + 1}`} className={s.indexItem} data-index data-active={i === 0}>
                      <span className={s.indexNum}>0{i + 1}</span>
                      <span>{name}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <p className={s.company}>{p.company}</p>
            </div>
          </aside>

          <div className={s.chapters}>
            {/* 01 · the figure */}
            <section id="ch-1" className={s.chapter} data-chapter aria-labelledby="proof-title">
              <span className={s.chHead} aria-hidden="true">01</span>
              <h2 id="proof-title" className={s.proofH}>
                <span className={s.wipe}>
                  <span className={`display chrome-text ${s.fig}`} data-wipe>{p.proof}</span>
                  <span className={s.wipeEdge} data-wipe-edge aria-hidden="true" />
                </span>
                <span className={`display ${s.figLabel}`} data-in>{p.proofLabel}</span>
              </h2>
              <p className={s.lead} data-in>{p.proofBody}</p>
            </section>

            {/* 02 · the statement and the team */}
            <section id="ch-2" className={s.chapter} data-chapter aria-labelledby="team-title">
              <span className={s.chHead} aria-hidden="true">02</span>
              <h2 id="team-title" className="mono-label" data-in>{p.teamLabel}</h2>
              <WordReveal as="p" className={s.intro} start="top 85%" end="bottom 50%"><Words text={p.intro} /></WordReveal>

              <table className={s.ledger} data-ledger>
                <thead>
                  <tr>
                    <th scope="col" className={s.lhPerson}><span className="sr-only">{p.teamLabel}</span></th>
                    {p.sides.map((side, k) => (
                      <th key={side} scope="col" className={s.lhSide}><span className={s.sideIdx}>{String.fromCharCode(65 + k)}</span>{side}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {people.map((m) => (
                    <tr key={m.key} className={s.row}>
                      <th scope="row" className={s.who}>
                        <span className={s.rule} data-rule aria-hidden="true" />
                        <span data-row className={s.whoIn}>
                          <span className={`display ${s.mono}`} aria-hidden="true">{m.mono}</span>
                          <span className={s.whoText}>
                            <span className={`display ${s.name}`}>{m.name}</span>
                            <span className="mono-label">{m.role}</span>
                            {m.line && <span className={s.line}>{m.line}</span>}
                          </span>
                        </span>
                      </th>
                      {m.sides.map((on, k) => (
                        <td key={k} className={s.cell} data-on={on}>
                          <span className={s.rule} data-rule aria-hidden="true" />
                          {on ? <><span className={s.mark} data-mark aria-hidden="true" /><span className={s.cellLabel}>{p.sides[k]}</span></> : <span className={s.none} aria-hidden="true" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 03 · the two cities, once more, small */}
            <section id="ch-3" className={s.chapter} data-chapter aria-labelledby="where-title">
              <span className={s.chHead} aria-hidden="true">03</span>
              <h2 id="where-title" className="mono-label" data-in>{p.citiesLabel}</h2>
              <div className={s.cities} data-in>
                <div className={s.cityCol}>
                  <span className={`display ${s.city}`}>{cities[0]}</span>
                  <span className="mono-label">{lisbon.coords}</span>
                </div>
                <svg className={s.mini} viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 52 C 70 4, 170 4, 236 40" fill="none" stroke="currentColor" strokeWidth="1.2" data-mini-route vectorEffect="non-scaling-stroke" />
                </svg>
                <div className={s.cityCol}>
                  <span className={`display ${s.city}`}>{cities[1]}</span>
                  <span className="mono-label">{madrid.coords}</span>
                </div>
              </div>
              <span className={`mono-label ${s.km}`} data-in>{p.km}</span>
              <p className={s.companyInline}>{p.company}</p>
            </section>
          </div>
        </div>

        {/* ── The close: a split, the call on the left, the ask on the right ─ */}
        <section className={s.close} data-close aria-labelledby="cta-title">
          <div className={s.closeGlow} aria-hidden="true" />
          <div className={s.closeA}>
            <span className="mono-label" data-in>{cta.label}</span>
            <h2 id="cta-title" className={`display ${s.closeH2}`} data-split>
              <span className="block">{cta.title[0]}</span>
              <span className={`block ${s.dim}`}>{cta.title[1]}</span>
            </h2>
          </div>
          <div className={s.closeB}>
            <p className={s.lead} data-in>{cta.body}</p>
            <div data-in><BookButton href={book} label={t.nav.book} /></div>
          </div>
        </section>
      </main>
    </div>
    </PageFrame>
  );
}
