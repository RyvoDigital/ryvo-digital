"use client";

import { useRef } from "react";
import type { Dictionary } from "@/i18n";
import type { Pages } from "@/i18n/pages";
import { euros } from "@/lib/numbers";
import SiteNav from "@/components/chrome/SiteNav";
import { ArrowUpRight, BookButton } from "@/components/chrome/Icons";
import PageFrame from "@/components/pages/PageFrame";
import { CtaBand, Faq } from "@/components/pages/Blocks";
import GlassFolder from "@/components/ui/glass-folder-cards";
import { Browser, Phone } from "../Devices";
import { CASES, WORK_COPY } from "../work";
import { heroParallax, settle, splitLines, usePageMotion } from "./motion";
import s from "./B.module.css";

type P = Pages["websites"];
const lang = "en" as const;
const W = WORK_COPY[lang];

// Direction B, "the studio table": a centred headline over a screen lying back
// on the desk, which turns to face you as you scroll while the phone and the
// light move at their own depths; the services as three huge words; the two
// folders side by side on one lit table, in smoked glass; the process as one
// line drawing across; the prices in a single glass panel.

export default function DirectionB({ t, p, pg }: { t: Dictionary; p: P; pg: Pages }) {
  const root = useRef<HTMLDivElement>(null);
  const book = `/${lang}/book?kind=websites`;
  const people = [
    { name: "Manuel Vale", role: pg.about.roles.manuel, mono: "MV" },
    { name: "Phil Hajjar", role: pg.about.roles.phil, mono: "PH" },
  ];
  const [sastreria, his] = CASES;

  usePageMotion(root, (kit) => {
    const { gsap, ScrollTrigger, q, desk } = kit;
    const el = root.current!;
    const hero = el.querySelector<HTMLElement>("[data-hero]")!;

    // ── Hero: the headline rises; the screen turns to face you as it comes
    // up the page; every layer travels at its own depth ─────────────────────
    for (const h of q("[data-split]", hero)) splitLines(kit, h, { delay: 0.05 });
    gsap.fromTo(q("[data-rise]", hero), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.45 });
    gsap.from(q("[data-enter]", hero), { opacity: 0, y: 120, duration: 1.8, stagger: 0.14, delay: 0.3, ease: "expo.out" });
    heroParallax(kit, hero, desk ? 380 : 140);
    const screen = hero.querySelector<HTMLElement>("[data-screen]")!;
    gsap.fromTo(screen, { rotationX: desk ? 24 : 14, scale: desk ? 0.94 : 0.97 }, {
      rotationX: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: desk ? "75% top" : "60% top", scrub: true },
    });
    gsap.to(hero.querySelector("[data-hero-copy]"), { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "10% top", end: "45% top", scrub: true } });

    // ── Words and lines rise from their masks ───────────────────────────────
    for (const h of q("[data-split-scroll]")) splitLines(kit, h, { trigger: h, start: "top 85%" });
    for (const row of q("[data-word-row]")) {
      gsap.from(row.querySelector("[data-word]"), { yPercent: 110, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: row, start: "top 85%", once: true } });
    }
    settle(kit, el);

    // ── The table: it opens from its bottom edge, the folders stand up ──────
    const table = el.querySelector<HTMLElement>("[data-table]")!;
    gsap.set(table, { clipPath: "inset(18% 4% 0% 4% round 40px)" });
    gsap.to(table, { clipPath: "inset(0% 0% 0% 0% round 40px)", ease: "none", scrollTrigger: { trigger: table, start: "top bottom", end: "top 30%", scrub: true } });

    // ── How a project runs: one line draws across, each step lights as the
    // line reaches it ─────────────────────────────────────────────────────────
    const track = el.querySelector<HTMLElement>("[data-track]")!;
    const nodes = q("[data-node]", track);
    gsap.fromTo(track.querySelector("[data-line]"), { scale: 0 }, {
      scale: 1, ease: "none",
      scrollTrigger: {
        trigger: track, start: "top 75%", end: "bottom 45%", scrub: true,
        onUpdate: (st) => nodes.forEach((n, k) => (n.dataset.on = String(st.progress >= k / nodes.length + 0.02))),
      },
    });

    ScrollTrigger.refresh();
  });

  return (
    <PageFrame lang={lang} t={t} bookHref={book} light>
      <div ref={root} className={s.page}>
        <header className={s.top}>
          <SiteNav lang={lang} t={t} bookHref={book} path="/websites" />
        </header>

        <main>
          {/* ── Hero: centred type, a screen on the desk below ─────────────── */}
          <section className={s.hero} data-hero aria-labelledby="page-title">
            <div className={s.pool} data-depth="0.08" aria-hidden="true" />
            <div className={s.flutes} data-depth="0.18" aria-hidden="true" />
            <div className={s.heroCopy} data-depth="0.55">
              <div data-hero-copy className={s.heroCopyIn}>
                <span className="mono-label" data-rise>{p.label}</span>
                <h1 id="page-title" className={`display ${s.h1}`}>
                  <span data-split>{p.title[0]} <span className={s.dim}>{p.title[1]}</span></span>
                </h1>
                <p className={s.sub} data-rise>{p.sub}</p>
                <div className={s.actions} data-rise><BookButton href={book} label={p.cta.button} /></div>
              </div>
            </div>
            <div className={s.desk} aria-hidden="true">
              <div className={s.screenL} data-depth="0.2">
                <div data-enter><div className={s.screen} data-screen><Browser img={his.hero} host={his.host} sizes="(min-width: 1024px) 64vw, 94vw" eager /></div></div>
              </div>
              <div className={s.phoneL} data-depth="0.7">
                <div data-enter><Phone img={sastreria.phone} sizes="(min-width: 1024px) 14vw, 30vw" eager /></div>
              </div>
            </div>
          </section>

          {/* ── The proof, straight after the hero ────────────────────────── */}
          <section className={s.proof} aria-label={p.proof[0]}>
            <p className={`display ${s.proofText}`} data-split-scroll>{p.proof[0]} <span className={s.dim}>{p.proof[1]}</span></p>
          </section>

          {/* ── What we do: three words, set huge ─────────────────────────── */}
          <section className={s.section} aria-labelledby="what-label">
            <div className={s.inner}>
              <span id="what-label" className="mono-label">{p.whatLabel}</span>
              <ul className={s.words}>
                {p.what.map(([title, body], i) => (
                  <li key={title} className={s.wordRow} data-word-row>
                    <span className={s.wordMask}><span className={`display ${s.word}`} data-word>{title}</span></span>
                    <span className={s.wordNum}>0{i + 1}</span>
                    <p className={s.wordBody}>{body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Selected work: two folders on one lit table ───────────────── */}
          <section id="work" className={s.section} aria-labelledby="work-title">
            <div className={s.inner}>
              <div className={s.workHead}>
                <span className="mono-label">{W.label}</span>
                <h2 id="work-title" className={`display ${s.h2}`} data-split-scroll>{W.title[0]} <span className={s.dim}>{W.title[1]}</span></h2>
                <p className={s.lead}>{W.sub}</p>
              </div>
            </div>
            <div className={s.table} data-table>
              <div className={s.tableLight} aria-hidden="true" />
              <div className={s.folders}>
                {CASES.map((c, i) => (
                  <article key={c.id} className={s.folderCol} aria-labelledby={`case-${c.id}`}>
                    <GlassFolder
                      label={c.name}
                      meta={W.words.items(c.files.length)}
                      tone="dark"
                      image={c.hero}
                      files={c.files}
                      labelPlacement="top-left"
                      maxWidth={540}
                      sizes="(min-width: 1024px) 540px, 90vw"
                      appearDelay={i * 160}
                      words={W.words}
                    />
                    <div className={s.caption}>
                      <span className={s.capNum}>0{i + 1}</span>
                      <div className={s.capText}>
                        <h3 id={`case-${c.id}`} className={s.capName}>{c.name}</h3>
                        <p className={s.capLine}>{W.lines[c.id]}</p>
                        <span className={s.capDid}>{W.did}</span>
                      </div>
                      <a href={c.url} target="_blank" rel="noopener" className={s.capVisit} aria-label={`${W.visit}: ${c.host} (${W.words.newTab})`}>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <span className={s.hint}>{W.hint}</span>
            </div>
          </section>

          {/* ── How a project runs: one line across four steps ────────────── */}
          <section className={s.section} aria-labelledby="steps-label">
            <div className={s.inner}>
              <span id="steps-label" className="mono-label">{p.stepsLabel}</span>
              <div className={s.track} data-track>
                <span className={s.trackBase} aria-hidden="true" />
                <span className={s.trackLine} data-line aria-hidden="true" />
                <ol className={s.trackList}>
                {p.steps.map(([title, body], i) => (
                  <li key={title} className={s.node} data-node data-on={false}>
                    <span className={s.dot} aria-hidden="true" />
                    <span className={s.nodeNum}>0{i + 1}</span>
                    <h3 className={`display ${s.nodeT}`}>{title}</h3>
                    <p className={s.nodeB}>{body}</p>
                  </li>
                ))}
                </ol>
              </div>
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

          {/* ── Who you work with ──────────────────────────────────────────── */}
          <section className={s.section} aria-labelledby="team-label">
            <div className={`${s.inner} ${s.teamGrid}`} data-settle-group>
              <span id="team-label" className="mono-label" data-settle>{p.teamLabel}</span>
              <ul className={s.team}>
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
