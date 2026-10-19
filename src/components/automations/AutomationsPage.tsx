"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import type { Pages } from "@/i18n/pages";
import TopBar from "@/components/chrome/TopBar";
import { BookButton } from "@/components/chrome/Icons";
import Pricing from "@/components/home/Pricing";
import SiteFooter from "@/components/chrome/SiteFooter";
import FloatingNav from "@/components/chrome/FloatingNav";
import StickyBook from "@/components/chrome/StickyBook";
import WordReveal, { Words } from "@/components/chrome/WordReveal";
import Signature from "./Signature";
import HeroScene from "./HeroScene";
import BrandFilm from "./BrandFilm";
import Report from "./Report";
import Faq from "@/components/pages/Faq";
import Expander from "@/components/ui/Expander";
import Dock from "./Dock";
import { objectSrc } from "./objects";
import { refreshWhenSettled, startMotion } from "./motion";
import s from "./AutomationsPage.module.css";

type P = Pages["automations"];


// A point: its title, then its description. A long point (over 140
// characters) that has more than one sentence shows its first sentence, and
// the rest on tap (the site's expander), word for word: nothing is cut or
// reworded.
const LONG = 140;
const isLong = (text: string) => text.length > LONG;

function Point({ title, text, ui }: { title: string; text: string; ui: P["ui"] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const parts = isLong(text) ? text.match(/^(.+?[.!?])\s+(.+)$/) : null;
  return (
    <li className={s.point} data-point>
      <span className={s.ptRule} data-pt-rule aria-hidden="true" />
      <strong className={s.ptTitle}>{title}</strong>
      <div className={s.pointText}>
        {parts ? (
          <>
            {parts[1]}{" "}
            <button type="button" className={s.ptMore} aria-expanded={open} aria-controls={id} aria-label={open ? ui.less : ui.more} onClick={() => setOpen((o) => !o)}>
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
            <Expander open={open} id={id} className={s.ptRest}><span className={s.ptRestText}>{parts[2]}</span></Expander>
          </>
        ) : text}
      </div>
    </li>
  );
}

function ObjectPicture({ i }: { i: number }) {
  const set = (ext: "avif" | "webp") => [480, 800].map((w) => `${objectSrc(i, w as 480, ext)} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes="(min-width: 1024px) 220px, 34vw" />
      <img src={objectSrc(i, 480, "webp")} srcSet={set("webp")} sizes="(min-width: 1024px) 220px, 34vw" width={480} height={480} alt="" loading="lazy" decoding="async" className={s.objImg} />
    </picture>
  );
}

export default function AutomationsPage({ lang, t, p, ctaLabel }: { lang: Locale; t: Dictionary; p: P; ctaLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const names = t.automationNames;
  const ui = p.ui;
  const book = `/${lang}/book`;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const off: (() => void)[] = []; // DOM listeners (gsap's revert does not remove them)

    startMotion().then((m) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger, SplitText, reduced } = m;
      el.dataset.motion = reduced ? "reduced" : "on";
      if (reduced) return; // Everything is already in place: no smoothing, no scrubs, no autoplay.

      const ctx = gsap.context(() => {
        const q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<T>(sel) as NodeListOf<T>);
        const once = (trigger: Element, start: string, fn: () => void) => ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
        const fine = matchMedia("(pointer: fine)").matches;
        const desk = matchMedia("(min-width: 1024px)").matches;

        // ── Hero: the headline rises out of its mask; leaving, it eases away ─
        const hero = el.querySelector<HTMLElement>("[data-hero]")!;
        for (const h of q("[data-split]", hero)) {
          SplitText.create(h, {
            type: "lines", mask: "lines", autoSplit: true,
            onSplit(self) {
              h.dataset.ready = "true";
              return gsap.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.075, ease: "expo.out", delay: h.dataset.split === "b" ? 0.25 : 0.05 });
            },
          });
        }
        gsap.fromTo(q("[data-hero-rise]", hero), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.45, ease: "expo.out" });
        gsap.to(q("[data-hero-copy]", hero), { y: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom 15%", scrub: true } });
        gsap.to(hero.querySelector("[data-hero-stage]"), { y: -60, opacity: 0, scale: 0.97, ease: "none", scrollTrigger: { trigger: hero, start: "35% top", end: "bottom top", scrub: true } });

        // ── Simple sections settle in once ─────────────────────────────────
        for (const sec of q("[data-section]")) {
          const items = q("[data-reveal]", sec);
          if (!items.length) continue; // (the intro has the word reveal instead)
          gsap.set(items, { opacity: 0, y: 24 });
          once(sec, "top 78%", () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.06, ease: "expo.out" }));
        }

        // ── The brand film: the device rises into place ─────────────────────
        const film = el.querySelector<HTMLElement>("[data-film-section]")!;
        gsap.set(q("[data-reveal]", film), { opacity: 0, y: 16 });
        once(film, "top 75%", () => gsap.to(q("[data-reveal]", film), { opacity: 1, y: 0, duration: 1.1, ease: "expo.out" }));
        gsap.fromTo(film.querySelector("[data-device]"), { y: 80, scale: 0.95 }, { y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: film, start: "top bottom", end: "top 20%", scrub: true } });

        // ── Five spreads, each with its own entrance ───────────────────────
        const dockLinks = q<HTMLAnchorElement>("[data-dock-link]");
        const setDock = (i: number) => dockLinks.forEach((a, k) => (a.dataset.active = String(k === i)));
        for (const node of q("[data-spread]")) {
          const i = Number(node.dataset.spread);
          const numeral = node.querySelector<HTMLElement>("[data-numeral]")!;
          const head = q("[data-head]", node);
          const obj = node.querySelector<HTMLElement>("[data-obj]")!;
          const pts = q("[data-point]", node);
          const rules = q("[data-pt-rule]", node);
          const float = node.querySelector<HTMLElement>("[data-float]")!;
          const tilt = node.querySelector<HTMLElement>("[data-tilt]")!;
          gsap.set(head, { opacity: 0, y: 22 });
          gsap.set(obj, { opacity: 0 });
          const headIn = (d = 0) => gsap.to(head, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: "expo.out", delay: d });
          let enter: () => void;
          if (i === 0) {
            // 01 · the numeral slides in from the edge.
            gsap.set(numeral, { x: "-40vw", opacity: 0 });
            enter = () => { gsap.to(numeral, { x: 0, opacity: 1, duration: 1.5, ease: "expo.out" }); headIn(0.15); gsap.to(obj, { opacity: 1, duration: 1.2, delay: 0.3 }); };
          } else if (i === 1) {
            // 02 · the numeral rises softly.
            gsap.set(numeral, { opacity: 0, y: 30 });
            enter = () => { gsap.to(numeral, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" }); headIn(0.1); gsap.to(obj, { opacity: 1, duration: 1.2, delay: 0.2 }); };
          } else if (i === 2) {
            // 03 · the numeral rises out of its own mask.
            gsap.set(numeral, { yPercent: 100 });
            enter = () => { gsap.to(numeral, { yPercent: 0, duration: 1.3, ease: "expo.out" }); headIn(0.2); gsap.to(obj, { opacity: 1, duration: 1.2, delay: 0.25 }); };
          } else if (i === 3) {
            // 04 · the numeral slides back; the object turns into place.
            gsap.set(numeral, { opacity: 0, x: 40 });
            gsap.set(obj, { rotation: -18 });
            enter = () => { gsap.to(numeral, { opacity: 1, x: 0, duration: 1.2, ease: "expo.out" }); headIn(0.1); gsap.to(obj, { opacity: 1, rotation: 0, duration: 1.5, ease: "expo.out", delay: 0.15 }); };
          } else {
            // 05 · the numeral settles from a soft focus.
            gsap.set(numeral, { opacity: 0, scale: 1.3, filter: "blur(14px)", transformOrigin: "0% 60%" });
            enter = () => { gsap.to(numeral, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out", clearProps: "filter" }); headIn(0.15); gsap.to(obj, { opacity: 1, duration: 1.2, delay: 0.2 }); };
          }
          once(node, "top 72%", enter);
          // The points, the same in every spread: a slow stagger, each row's
          // hairline drawing first, then its words.
          const list = node.querySelector<HTMLElement>("[data-points]")!;
          gsap.set(pts, { opacity: 0, y: 22 });
          gsap.set(rules, { scaleX: 0 });
          once(list, "top 84%", () => {
            gsap.to(rules, { scaleX: 1, duration: 1.6, stagger: 0.2, ease: "expo.inOut" });
            gsap.to(pts, { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "expo.out", delay: 0.25 });
          });

          const bob = gsap.to(float, { y: -8, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
          ScrollTrigger.create({ trigger: node, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? bob.play() : bob.pause()) });
          ScrollTrigger.create({ trigger: node, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(i) });
          if (fine) {
            gsap.set(tilt, { transformPerspective: 800 });
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.1, ease: "expo.out" });
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.1, ease: "expo.out" });
            const move = (e: PointerEvent) => {
              const r = node.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 14);
              rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
            };
            const leave = () => { rx(0); ry(0); };
            node.addEventListener("pointermove", move, { passive: true });
            node.addEventListener("pointerleave", leave);
            off.push(() => { node.removeEventListener("pointermove", move); node.removeEventListener("pointerleave", leave); });
          }
        }

        // ── "Switched on only after its checks": the words light as you read ─
        const checks = el.querySelector<HTMLElement>("[data-checks]")!;
        gsap.fromTo(q("[data-word]", checks), { opacity: 0.16 }, { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: checks, start: "top 78%", end: "bottom 52%", scrub: true } });

        // ── The report: figures count up, bars grow, the dividers draw ─────
        const report = el.querySelector<HTMLElement>("[data-report]")!;
        const card = report.querySelector<HTMLElement>("[data-report-card]")!;
        const counts = q("[data-count]", report);
        const bars = q("[data-bar]", report);
        const rRules = q("[data-draw]", report);
        counts.forEach((c) => (c.textContent = "0"));
        gsap.set(bars, { scaleX: 0 });
        gsap.set(rRules, desk ? { scaleY: 0 } : { scaleX: 0 });
        gsap.set(card, { opacity: 0, y: 40 });
        once(report, "top 70%", () => {
          gsap.to(card, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" });
          gsap.to(rRules, { ...(desk ? { scaleY: 1 } : { scaleX: 1 }), duration: 1.2, stagger: 0.15, ease: "expo.inOut", delay: 0.3 });
          gsap.to(bars, { scaleX: 1, duration: 1.4, stagger: 0.1, ease: "expo.out", delay: 0.55 });
          counts.forEach((c, k) => {
            const to = Number(c.dataset.count); const o = { v: 0 };
            gsap.to(o, { v: to, duration: 1.6, ease: "expo.out", delay: 0.4 + k * 0.04, onUpdate: () => { c.textContent = String(Math.round(o.v)); } });
          });
        });

        // ── The closing call ───────────────────────────────────────────────
        const cta = el.querySelector<HTMLElement>("[data-cta]")!;
        const h2 = cta.querySelector<HTMLElement>("[data-cta-split]")!;
        const ctaRise = q("[data-cta-rise]", cta);
        gsap.set(ctaRise, { opacity: 0, y: 18 });
        SplitText.create(h2, {
          type: "lines", mask: "lines", autoSplit: true,
          onSplit(self) {
            h2.dataset.ready = "true";
            return gsap.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: cta, start: "top 60%", once: true } });
          },
        });
        once(cta, "top 55%", () => gsap.to(ctaRise, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.35, ease: "expo.out" }));

        // (The footer runs its own motion: SiteFooter.)

        // ── The dock: the five spreads' own index, in range only while they
        // are on screen; shown while scrolling up (to jump), hidden while
        // reading or scrolling down. The site's pill stays the navigation ────
        const dock = el.querySelector<HTMLElement>("[data-dock]")!;
        const first = el.querySelector("[data-spread='0']")!, last = el.querySelector("[data-spread='4']")!;
        ScrollTrigger.create({ trigger: first, start: "top 60%", endTrigger: last, end: "bottom 40%", onToggle: (st) => (dock.dataset.show = String(st.isActive)) });
        ScrollTrigger.create({
          trigger: first, start: "top 60%", endTrigger: last, end: "bottom 40%",
          onUpdate: (st) => {
            dock.dataset.up = String(st.direction < 0);
            clearTimeout(idle);
            idle = setTimeout(() => (dock.dataset.up = "false"), 2200);
          },
        });
        gsap.fromTo(dock.querySelector("[data-dock-progress]"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: first, start: "top 60%", endTrigger: last, end: "bottom 40%", scrub: true } });
      }, el);

      refreshWhenSettled(m);
      revert = () => { ctx.revert(); clearTimeout(idle); off.forEach((f) => f()); };
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  const words = p.checks.split(" ");

  return (
    <div ref={root} className={s.page}>
      <TopBar lang={lang} t={t} bookHref={book} />

      <main>
        {/* ── Hero: one screen; the headline reads across the top band ────── */}
        <section id="top" className={s.hero} data-hero aria-labelledby="automations-title">
          <div className={s.heroA}>
            {/* The scroll fade moves these wrappers; the rise and the line split
                move what is inside them, so no element has two owners. */}
            <span className={s.heroLabel} data-hero-copy><span className="mono-label" data-hero-rise>{p.label}</span></span>
            <h1 id="automations-title" className={`display ${s.h1}`}>
              <span className={s.h1Part} data-hero-copy><span data-split="a">{p.title[0]} {p.title[1]}</span></span>{" "}
              <span className={`${s.h1Part} ${s.h1B}`} data-hero-copy><span data-split="b">{p.title[2]} {p.title[3]}</span></span>
            </h1>
          </div>
          <div className={s.heroStage} data-hero-stage>
            <HeroScene names={names} taglines={p.items.map((it) => it.tagline)} label={ui.scene} marks={ui.index} />
          </div>
          <div className={s.heroActions} data-hero-copy>
            <span className={s.actions} data-hero-rise>
              <BookButton href={book} label={t.nav.book} />
              <Link href={`/${lang}#demo`} className={s.textLink}>{p.see}</Link>
            </span>
          </div>
        </section>

        {/* ── The sub, then the brand film, then the index ───────────────── */}
        <section className={s.intro} data-section="intro" aria-label={ui.intro}>
          {/* The homepage's scroll word reveal: same component, same timing. */}
          <WordReveal as="p" className={s.introText}><Words text={p.sub} /></WordReveal>
        </section>

        <BrandFilm lang={lang} label={ui.film} alt={ui.filmAlt} play={ui.play} pause={ui.pause} />

        <nav className={s.index} data-section="index" aria-label={ui.index}>
          <ol className={s.indexList}>
            {names.map((n, i) => (
              <li key={n} data-reveal>
                <a href={`#a0${i + 1}`} className={s.indexItem}>
                  <span className={s.indexNum}>0{i + 1}</span>
                  <span className={s.indexName}>{n}</span>
                  <span className={s.indexLine}>{p.items[i].tagline}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Five editorial spreads ─────────────────────────────────────── */}
        {names.map((n, i) => {
          const pts = p.items[i].points;
          return (
            <section key={n} id={`a0${i + 1}`} className={s.spread} data-spread={i} aria-labelledby={`a0${i + 1}-name`}>
              <span className={s.numeralMask} aria-hidden="true"><span className={`${s.numeral} chrome-text`} data-numeral>0{i + 1}</span></span>
              <div className={s.spreadHead}>
                <span className={s.stageNum} data-head>0{i + 1} / 05</span>
                <h2 id={`a0${i + 1}-name`} className={`display ${s.spreadName}`} data-head>{n}</h2>
                <p className={s.spreadLead} data-head>{p.items[i].tagline}</p>
              </div>
              <div className={s.spreadObj} data-obj aria-hidden="true">
                <div className={s.objGlow} />
                <div className={s.objTilt} data-tilt><div data-float><ObjectPicture i={i} /></div></div>
              </div>
              <ul className={s.pointGrid} data-points>
                {pts.map((pt, k) => <Point key={pt} title={ui.pointTitles[i][k]} text={pt} ui={ui} />)}
              </ul>
            </section>
          );
        })}

        {/* ── Checks ─────────────────────────────────────────────────────── */}
        <section className={s.checks} data-checks aria-label={ui.checks}>
          <p className={s.checksText}>
            {words.map((w, k) => <span key={k} data-word>{w}{k < words.length - 1 ? " " : ""}</span>)}
          </p>
        </section>

        <Report p={p} rep={t.how.report} />

        {/* ── Pricing: the homepage's own picker, with each row's amount ──── */}
        <div className={s.pricingHome}>
          <Pricing lang={lang} t={{ ...t.pricing, label: p.pricingLabel }} names={names} bookHref={book} addOns />
        </div>

        <Faq label={p.faqLabel} items={p.faq} line={p.cta.body.split(". ").slice(-1)[0]} book={t.nav.book} bookHref={book} />

        {/* ── Closing: the mercury ───────────────────────────────────────── */}
        <section className={s.cta} data-cta aria-labelledby="cta-title">
          <div className={s.ctaStage}>
            <Signature sig="chrome" kind="cta" objects={[0]} poster={0} label={ui.ctaArt} />
          </div>
          <div className={s.ctaText}>
            <span className="mono-label" data-cta-rise>{ctaLabel}</span>
            <h2 id="cta-title" className={`display ${s.ctaH2}`} data-cta-split>
              <span className={s.h1Line}>{p.cta.title[0]}</span>
              <span className={s.h1Line} data-dim="true">{p.cta.title[1]}</span>
            </h2>
            <p className={s.ctaBody} data-cta-rise>{p.cta.body}</p>
            <div data-cta-rise><BookButton href={book} label={t.nav.book} /></div>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} t={t} bookHref={book} />
      <Dock names={names} label={ui.sections} />
      <FloatingNav lang={lang} t={t} bookHref={book} />
      <StickyBook href={book} label={t.pill.book} />
    </div>
  );
}
