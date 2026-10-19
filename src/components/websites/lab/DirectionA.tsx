"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Pages } from "@/i18n/pages";
import { euros } from "@/lib/numbers";
import SiteNav from "@/components/chrome/SiteNav";
import { ArrowUpRight, BookButton } from "@/components/chrome/Icons";
import PageFrame from "@/components/pages/PageFrame";
import { CtaBand, Faq } from "@/components/pages/Blocks";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { Browser, Phone } from "../Devices";
import { CASES, WORK_COPY, type Case } from "../work";
import { heroParallax, maskReveal, settle, splitLines, usePageMotion } from "./motion";
import s from "./A.module.css";

type P = Pages["websites"];
const lang = "en" as const;
const W = WORK_COPY[lang];

// Direction A, "the gallery": an editorial left-aligned hero over a deep stack
// (light, glass, a browser, a phone), each layer at its own depth; the work as
// two full spreads that alternate sides; the process as a sticky sequence; the
// prices as open, ruled figures with no cards.

function CaseSpread({ c, i }: { c: Case; i: number }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <article className={s.case} data-flip={i % 2 === 1 || undefined} aria-labelledby={`case-${c.id}`}>
      <div className={s.plinth} data-mask>
        <div className={s.plinthLight} data-mask-inner aria-hidden="true" />
        <div className={s.folderWrap}>
          <GlassFolder
            label={c.name}
            meta={W.did}
            image={c.hero}
            files={c.files}
            activeIndex={active}
            maxWidth={560}
            sizes="(min-width: 1024px) 560px, 90vw"
            words={W.words}
          />
        </div>
        <span className={s.hint} aria-hidden="true">{W.hint}</span>
      </div>
      <div className={s.caseText} data-settle-group>
        <span className={s.caseNum} data-settle>0{i + 1} / 0{CASES.length}</span>
        <h3 id={`case-${c.id}`} className={`display ${s.caseName}`} data-settle>{c.name}</h3>
        <p className={s.caseLine} data-settle>{W.lines[c.id]}</p>
        <span className="mono-label" data-settle>{W.did}</span>
        <div className={s.pages} data-settle>
          <span className={s.pagesLabel}>{W.pages}</span>
          <ul onMouseLeave={() => setActive(null)}>
            {c.files.map((f, k) => (
              <li key={f.name}>
                <a href={f.href} target="_blank" rel="noopener" className={s.pageRow} onMouseEnter={() => setActive(k)} onFocus={() => setActive(k)} onBlur={() => setActive(null)}>
                  <span className={s.pageName}>{f.name}</span>
                  <span className={s.pagePath}>{f.meta}</span>
                  <span className={s.pageArrow} aria-hidden="true"><ArrowUpRight size={12} /></span>
                  <span className="sr-only"> ({W.words.newTab})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <a href={c.url} target="_blank" rel="noopener" className={s.visit} data-settle>
          {W.visit} <span className={s.visitHost}>{c.host}</span> <ArrowUpRight size={12} />
          <span className="sr-only"> ({W.words.newTab})</span>
        </a>
      </div>
    </article>
  );
}

export default function DirectionA({ t, p, pg }: { t: Dictionary; p: P; pg: Pages }) {
  const root = useRef<HTMLDivElement>(null);
  const book = `/${lang}/book?kind=websites`;
  const people = [
    { name: "Manuel Vale", role: pg.about.roles.manuel, mono: "MV" },
    { name: "Phil Hajjar", role: pg.about.roles.phil, mono: "PH" },
  ];
  const [sastreria, his] = CASES;

  usePageMotion(root, (kit) => {
    const { gsap, ScrollTrigger, q, desk, fine } = kit;
    const el = root.current!;
    const hero = el.querySelector<HTMLElement>("[data-hero]")!;

    // ── Hero: the headline rises from its mask, the stage assembles, then
    // every layer leaves at its own depth as the page scrolls on ─────────────
    for (const h of q("[data-split]", hero)) splitLines(kit, h, { delay: h.dataset.split === "b" ? 0.2 : 0.05 });
    gsap.fromTo(q("[data-rise]", hero), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.5 });
    gsap.from(q("[data-enter]", hero), { opacity: 0, y: 80, duration: 1.6, stagger: 0.12, delay: 0.25, ease: "expo.out" });
    heroParallax(kit, hero, desk ? 440 : 150);
    gsap.to(hero.querySelector("[data-hero-copy]"), { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "25% top", end: "75% top", scrub: true } });

    // A slow lean toward the cursor, on fine pointers only.
    if (fine) {
      const stage = hero.querySelector<HTMLElement>("[data-stage]")!;
      const rx = gsap.quickTo(stage, "rotationX", { duration: 1.2, ease: "expo.out" });
      const ry = gsap.quickTo(stage, "rotationY", { duration: 1.2, ease: "expo.out" });
      const move = (e: PointerEvent) => { rx(((e.clientY / innerHeight) - 0.5) * -3); ry(((e.clientX / innerWidth) - 0.5) * 4); };
      hero.addEventListener("pointermove", move);
    }

    settle(kit, el);
    for (const m of q("[data-mask]")) maskReveal(kit, m);

    // ── The proof line and the section titles rise from their masks ──────────
    for (const h of q("[data-split-scroll]")) splitLines(kit, h, { trigger: h, start: "top 85%" });

    // ── How a project runs: the sticky counter follows the step in view ─────
    const steps = q("[data-step]");
    const counter = el.querySelector<HTMLElement>("[data-counter]");
    const fill = el.querySelector<HTMLElement>("[data-rail-fill]");
    steps.forEach((step, k) => {
      ScrollTrigger.create({
        trigger: step, start: "top 60%", end: "bottom 60%",
        onToggle: (st) => {
          if (!st.isActive) return;
          steps.forEach((x, j) => (x.dataset.on = String(j === k)));
          if (counter) counter.textContent = "0" + (k + 1);
        },
      });
    });
    if (fill) gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.querySelector("[data-steps]"), start: "top 60%", end: "bottom 60%", scrub: true } });

    // ── The price rules draw in once ─────────────────────────────────────────────────
    for (const fig of q("[data-rule]")) gsap.fromTo(fig, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: fig, start: "top 85%", once: true } });
  });

  return (
    <PageFrame lang={lang} t={t} bookHref={book} light>
      <div ref={root} className={s.page}>
        <header className={s.top}>
          <SiteNav lang={lang} t={t} bookHref={book} path="/websites" />
        </header>

        <main>
          {/* ── Hero: copy left, a deep stage of layers right ─────────────── */}
          <section className={s.hero} data-hero aria-labelledby="page-title">
            <div className={s.bg} data-depth="0.12" aria-hidden="true">
              <span className={s.discA} />
              <span className={s.ring} />
            </div>
            <div className={s.heroCopy} data-depth="-0.08">
              <div data-hero-copy className={s.heroCopyIn}>
                <span className="mono-label" data-rise>{p.label}</span>
                <h1 id="page-title" className={`display ${s.h1}`}>
                  <span className={s.line}><span data-split="a">{p.title[0]}</span></span>
                  <span className={`${s.line} ${s.dim}`}><span data-split="b">{p.title[1]}</span></span>
                </h1>
                <p className={s.sub} data-rise>{p.sub}</p>
                <div className={s.actions} data-rise><BookButton href={book} label={p.cta.button} /><a href="#work" className={s.textLink}>{W.label.charAt(0) + W.label.slice(1).toLowerCase()}</a></div>
              </div>
            </div>
            <div className={s.stage} data-stage aria-hidden="true">
              <div className={s.flutes} data-depth="0.22" />
              <div className={s.browserL} data-depth="0.42"><div data-enter><Browser img={sastreria.hero} host={sastreria.host} sizes="(min-width: 1024px) 58vw, 92vw" eager /></div></div>
              <div className={s.phoneL} data-depth="0.85"><div data-enter><Phone img={his.phone} sizes="(min-width: 1024px) 15vw, 34vw" eager /></div></div>
            </div>
          </section>

          {/* ── What we do: three ruled columns, no cards ───────────────────── */}
          <section className={s.section} aria-labelledby="what-label">
            <div className={s.inner}>
              <span id="what-label" className="mono-label">{p.whatLabel}</span>
              <div className={s.what} data-settle-group>
                {p.what.map(([title, body], i) => (
                  <div key={title} className={s.whatCol} data-settle>
                    <span className={s.num}>0{i + 1}</span>
                    <h2 className={`display ${s.whatT}`}>{title}</h2>
                    <p className={s.body}>{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Selected work: two spreads, alternating sides ──────────────── */}
          <section id="work" className={s.section} aria-labelledby="work-title">
            <div className={s.inner}>
              <div className={s.head}>
                <span className="mono-label">{W.label}</span>
                <h2 id="work-title" className={`display ${s.h2}`} data-split-scroll>{W.title[0]} <span className={s.dim}>{W.title[1]}</span></h2>
                <p className={s.lead}>{W.sub}</p>
              </div>
              <div className={s.cases}>
                {CASES.map((c, i) => <CaseSpread key={c.id} c={c} i={i} />)}
              </div>
            </div>
          </section>

          {/* ── The proof line, set large ──────────────────────────────────── */}
          <section className={s.proof} aria-label={p.proof[0]}>
            <p className={`display ${s.proofText}`} data-split-scroll>{p.proof[0]} <span className={s.dim}>{p.proof[1]}</span></p>
          </section>

          {/* ── How a project runs: a sticky counter beside the four steps ─── */}
          <section className={s.section} aria-labelledby="steps-label">
            <div className={`${s.inner} ${s.stepsGrid}`}>
              <div className={s.stepsSide}>
                <span id="steps-label" className="mono-label">{p.stepsLabel}</span>
                <div className={s.counterRow} aria-hidden="true">
                  <span className={s.counter} data-counter>01</span>
                  <span className={s.counterOf}>/ 0{p.steps.length}</span>
                </div>
                <span className={s.rail} aria-hidden="true"><span className={s.railFill} data-rail-fill /></span>
              </div>
              <ol className={s.steps} data-steps>
                {p.steps.map(([title, body], i) => (
                  <li key={title} className={s.step} data-step data-on={i === 0}>
                    <span className={s.num}>0{i + 1}</span>
                    <h3 className={`display ${s.stepT}`}>{title}</h3>
                    <p className={s.stepB}>{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── Pricing: open figures on hairlines ─────────────────────────── */}
          <section className={s.section} aria-labelledby="price-label">
            <div className={s.inner}>
              <span id="price-label" className="mono-label">{p.pricingLabel}</span>
              <div className={s.prices} data-settle-group>
                <div className={s.price} data-settle>
                  <span className={s.rule} data-rule aria-hidden="true" />
                  <span className={s.priceLabel}>{p.fromSite}</span>
                  <span className={`display ${s.priceFig}`}>{euros(1500, lang)}</span>
                  <p className={s.body}>{p.fromSiteNote}</p>
                </div>
                <div className={s.price} data-settle>
                  <span className={s.rule} data-rule aria-hidden="true" />
                  <span className={s.priceLabel}>{p.fromCare}</span>
                  <span className={`display ${s.priceFig}`}>{euros(150, lang)}<span className={s.priceUnit}>{p.perMonth}</span></span>
                  <p className={s.body}>{p.fromCareNote}</p>
                </div>
              </div>
              <div className={s.priceFoot}>
                <p className={s.note}>{p.priceNote}</p>
                <BookButton href={book} label={p.cta.button} />
              </div>
            </div>
          </section>

          {/* ── Who you work with ──────────────────────────────────────────── */}
          <section className={s.section} aria-labelledby="team-label">
            <div className={s.inner}>
              <span id="team-label" className="mono-label">{p.teamLabel}</span>
              <ul className={s.team} data-settle-group>
                {people.map((m) => (
                  <li key={m.name} className={s.person} data-settle>
                    <span className={s.mono} aria-hidden="true">{m.mono}</span>
                    <span className={s.personName}>{m.name}</span>
                    <span className={s.personRole}>{m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Faq label={p.faqLabel} items={p.faq} />
          <CtaBand
            label={pg.ctaLabel} title={p.cta.title} href={book} button={p.cta.button}
            body={<>{p.cta.body} <a href="mailto:hello@ryvodigital.com" className="text-text underline underline-offset-4">hello@ryvodigital.com</a>.</>}
          />
        </main>
      </div>
    </PageFrame>
  );
}
