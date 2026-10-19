"use client";

import { useRef } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Pages } from "@/i18n/pages";
import { euros } from "@/lib/numbers";
import TopBar from "@/components/chrome/TopBar";
import { ArrowUpRight, BookButton } from "@/components/chrome/Icons";
import PageFrame from "@/components/pages/PageFrame";
import { CtaBand } from "@/components/pages/Blocks";
import Faq from "@/components/pages/Faq";
import GlassFolder from "@/components/ui/glass-folder-cards";
import Anatomy from "./Anatomy";
import { CASES } from "./work";
import { settle, splitLines, usePageMotion } from "./motion";
import s from "./WebsitesPage.module.css";

type P = Pages["websites"];

// /websites, the light page (step 2, round 2). The hero's signature is the
// anatomy of a website, taken apart by the scroll; then what we do, how a
// project runs (a sticky counter), the two people behind every site, the
// client work (small and quiet), the prices in one glass panel, questions and
// the close. Motion rides the site's own scroll (Lenis on gsap.ticker); with
// reduced motion everything is in place and the anatomy is a still exploded view.

export default function WebsitesPage({ lang, t, p, ctaLabel }: { lang: Locale; t: Dictionary; p: P; ctaLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const book = `/${lang}/book?kind=websites`;
  const w = p.work;
  const folderWords = {
    open: w.open,
    close: w.close,
    items: (n: number) => `${n} ${n === 1 ? w.page : w.pages}`,
    newTab: p.team.newTab,
  };

  usePageMotion(root, (kit) => {
    const { gsap, ScrollTrigger, q, desk, fine } = kit;
    const el = root.current!;
    const hero = el.querySelector<HTMLElement>("[data-hero]")!;
    const anatomy = hero.querySelector<HTMLElement>("[data-anatomy]")!;
    const stage = hero.querySelector<HTMLElement>("[data-stage]")!;

    // ── Hero: the headline rises from its mask (the anatomy assembles itself
    // in CSS, from the first paint) ──────────────────────────────────────────
    for (const h of q("[data-split]", hero)) splitLines(kit, h, { delay: h.dataset.split === "b" ? 0.2 : 0.05 });
    gsap.fromTo(q("[data-rise]", hero), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.5 });

    // ── The scroll takes the page apart, and scrolling back puts it together.
    // Wide: over the first half of the hero, while the stage drifts down a
    // little so the stack stays in view; the copy fades. Phones: as the
    // stage itself crosses the screen, with less depth (Anatomy.module.css).
    gsap.fromTo(anatomy, { "--p": 0 }, {
      "--p": 1, ease: "none",
      scrollTrigger: desk
        ? { trigger: hero, start: "top top", end: "45% top", scrub: true }
        : { trigger: anatomy, start: "top 54%", end: "top 4%", scrub: true },
    });
    if (desk) {
      gsap.to(stage, { y: () => hero.offsetHeight * 0.12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      gsap.to(hero.querySelector("[data-hero-copy]"), { opacity: 0, y: -30, ease: "none", scrollTrigger: { trigger: hero, start: "20% top", end: "60% top", scrub: true } });
    }

    // A very gentle lean of the whole stack toward the pointer.
    if (fine && desk) {
      const tilt = hero.querySelector<HTMLElement>("[data-anatomy-tilt]")!;
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.4, ease: "expo.out" });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.4, ease: "expo.out" });
      const move = (e: PointerEvent) => { rx(((e.clientY / innerHeight) - 0.5) * -5); ry(((e.clientX / innerWidth) - 0.5) * 7); };
      const leave = () => { rx(0); ry(0); };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
    }

    settle(kit, el);
    // The questions settle in as on /automations.
    for (const sec of q("[data-section='faq']")) {
      const items = q("[data-reveal]", sec);
      gsap.set(items, { opacity: 0, y: 24 });
      kit.once(sec, "top 78%", () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.06, ease: "expo.out" }));
    }
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
  });

  return (
    <PageFrame lang={lang} t={t} bookHref={book} light>
      <div ref={root} className={s.page}>
        <TopBar lang={lang} t={t} bookHref={book} />

        <main>
          {/* ── Hero: the copy, and the anatomy of a website beside it ──────── */}
          <section className={s.hero} data-hero aria-labelledby="page-title">
            <div className={s.bg} aria-hidden="true">
              <span className={s.discA} />
              <span className={s.ring} />
            </div>
            <div className={s.heroCopy}>
              <div data-hero-copy className={s.heroCopyIn}>
                <span className="mono-label" data-rise>{p.label}</span>
                <h1 id="page-title" className={`display ${s.h1}`}>
                  <span className={s.line}><span data-split="a">{p.title[0]}</span></span>
                  <span className={`${s.line} ${s.dim}`}><span data-split="b">{p.title[1]}</span></span>
                </h1>
                <p className={s.sub} data-rise>{p.sub}</p>
                <div className={s.actions} data-rise><BookButton href={book} label={p.cta.button} /></div>
              </div>
            </div>
            <div className={s.stage} data-stage>
              <Anatomy label={p.anatomy.label} names={p.anatomy.layers} />
            </div>
          </section>

          {/* ── What we do: three ruled columns ─────────────────────────────── */}
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

          {/* ── The team: the two people behind every site ─────────────────── */}
          <section className={s.section} aria-labelledby="team-title">
            <div className={s.inner}>
              <div className={s.teamHead}>
                <span className="mono-label">{p.teamLabel}</span>
                <h2 id="team-title" className={`display ${s.h2}`} data-split-scroll>{p.team.title[0]} <span className={s.dim}>{p.team.title[1]}</span></h2>
              </div>
              <div className={s.people}>
                {p.team.people.map((m) => (
                  <article key={m.name} className={s.person} aria-labelledby={`person-${m.mono}`}>
                    {/* the portrait frame: a monogram until the photographs arrive
                        (an <img> drops into the same frame, object-fit: cover) */}
                    <figure className={s.portrait} aria-hidden="true">
                      <span className={s.monogram}>{m.mono}</span>
                    </figure>
                    <header className={s.personHead} data-settle-group>
                      <h3 id={`person-${m.mono}`} className={`display ${s.personName}`} data-settle>{m.name}</h3>
                      <span className={s.personRole} data-settle>{m.role}</span>
                    </header>
                    <div className={s.personBody} data-settle-group>
                      <blockquote className={s.quote} data-settle><p>{m.lead}</p></blockquote>
                      <p className={s.bio} data-settle>{m.bio}</p>
                      <dl className={s.facts} data-settle>
                        {m.facts.map(([value, label]) => (
                          <div key={label} className={s.fact}>
                            <dt className={s.factLabel}>{label}</dt>
                            <dd className={s.factValue}>{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <a href={m.href} target="_blank" rel="noopener" className={s.linkedin} data-settle>
                        {p.team.linkedin} <ArrowUpRight size={12} />
                        <span className="sr-only"> ({m.name}, {p.team.newTab})</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <p className={s.shared}>{p.team.shared}</p>
            </div>
          </section>

          {/* ── Selected work: small and quiet ─────────────────────────────── */}
          <section className={s.section} aria-labelledby="work-title">
            <div className={`${s.inner} ${s.workSection}`}>
              <h2 id="work-title" className={s.workTitle}>{w.title}</h2>
              <div className={s.work}>
                {CASES.map((c, i) => (
                  <article key={c.id} className={s.workItem} aria-label={c.name}>
                    <GlassFolder
                      label={c.name}
                      meta={folderWords.items(c.files.length)}
                      image={c.hero}
                      files={c.files}
                      maxWidth={340}
                      sizes="(min-width: 768px) 340px, 300px"
                      appearDelay={i * 140}
                      words={folderWords}
                    />
                    <div className={s.workCap}>
                      <p className={s.workLine}>{w.lines[c.id as keyof typeof w.lines]}</p>
                      <span className={s.workDid}>{w.did}</span>
                      <a href={c.url} target="_blank" rel="noopener" className={s.workVisit}>
                        {w.visit} <ArrowUpRight size={11} />
                        <span className="sr-only"> ({c.host}, {p.team.newTab})</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <span className={s.workHint}>{w.hint}</span>
            </div>
          </section>

          {/* ── Pricing: one glass panel over the light ────────────────────── */}
          <section className={s.section} aria-labelledby="price-label">
            <div className={s.inner}>
              <div className={s.priceStage}>
                <span className={s.priceOrb} aria-hidden="true" />
                <div className={s.pricePanel} data-settle-group>
                  <span id="price-label" className={`mono-label ${s.priceHead}`} data-settle>{p.pricingLabel}</span>
                  <div className={s.priceHalves}>
                    <div className={s.priceHalf} data-settle>
                      <span className={s.priceLabel}>{p.fromSite}</span>
                      <span className={`display ${s.priceFig}`}>{euros(1500, lang)}</span>
                      <p className={s.priceNoteOne}>{p.fromSiteNote}</p>
                    </div>
                    <div className={s.priceHalf} data-settle>
                      <span className={s.priceLabel}>{p.fromCare}</span>
                      <span className={`display ${s.priceFig}`}>{euros(150, lang)}<span className={s.priceUnit}>{p.perMonth}</span></span>
                      <p className={s.priceNoteOne}>{p.fromCareNote}</p>
                    </div>
                  </div>
                  <div className={s.priceFoot} data-settle>
                    <p className={s.note}>{p.priceNote}</p>
                    <BookButton href={book} label={p.cta.button} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Faq label={p.faqLabel} items={p.faq} line={p.cta.body.split(". ")[0] + "."} book={p.cta.button} bookHref={book} />
          <CtaBand
            label={ctaLabel} title={p.cta.title} href={book} button={p.cta.button}
            body={<>{p.cta.body} <a href="mailto:hello@ryvodigital.com" className="text-text underline underline-offset-4">hello@ryvodigital.com</a>.</>}
          />
        </main>
      </div>
    </PageFrame>
  );
}
