"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Pages } from "@/i18n/pages";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";
import { BookButton } from "@/components/chrome/Icons";
import Pricing from "@/components/home/Pricing";
import Signature from "./Signature";
import HeroScene from "./HeroScene";
import Film from "./Film";
import Faq from "./Faq";
import Dock from "./Dock";
import { objectSrc } from "./objects";
import { refreshWhenSettled, startMotion } from "./motion";
import s from "./proof.module.css";

type P = Pages["automations"];

const BOOK = "/en/book";

function ObjectPicture({ i }: { i: number }) {
  const set = (ext: "avif" | "webp") => [480, 800].map((w) => `${objectSrc(i, w as 480, ext)} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes="(min-width: 1024px) 220px, 34vw" />
      <img src={objectSrc(i, 480, "webp")} srcSet={set("webp")} sizes="(min-width: 1024px) 220px, 34vw" width={480} height={480} alt="" loading="lazy" decoding="async" className={s.objImg} />
    </picture>
  );
}

export default function ProofPage({ t, p, ctaLabel }: { t: Dictionary; p: P; ctaLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const names = t.automationNames;
  const first = p.items[0].points;
  // The film's three beats reuse 01's own points (first sentence where a point is long).
  const beats = [
    { title: "Enquiry", text: first[0] },
    { title: "Booked", text: "Offers free times from your Google Calendar, within your working hours, and books the viewing." },
    { title: "Handover", text: first[5] },
  ];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    startMotion().then((m) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger, SplitText, reduced } = m;
      el.dataset.motion = reduced ? "reduced" : "on";
      if (reduced) return; // Everything is already in place: no smoothing, no scrubs.

      const ctx = gsap.context(() => {
        const q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<T>(sel) as NodeListOf<T>);
        const fine = matchMedia("(pointer: fine)").matches;

        // ── Hero: the headline rises out of its mask; leaving, it all eases away ─
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

        // ── The intro line and the index ───────────────────────────────────
        for (const sec of q("[data-section]")) {
          const items = q("[data-reveal]", sec);
          gsap.set(items, { opacity: 0, y: 24 });
          ScrollTrigger.create({ trigger: sec, start: "top 78%", once: true, onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.06, ease: "expo.out" }) });
        }

        // ── Spreads, in page order ─────────────────────────────────────────
        const dockLinks = q<HTMLAnchorElement>("[data-dock-link]");
        const setDock = (i: number) => dockLinks.forEach((a, k) => (a.dataset.active = String(k === i)));

        for (const node of q("[data-spread]")) {
          const i = Number(node.dataset.spread);
          const obj = node.querySelector<HTMLElement>("[data-obj]")!;
          const tilt = node.querySelector<HTMLElement>("[data-tilt]")!;
          const float = node.querySelector<HTMLElement>("[data-float]")!;
          const items = q("[data-reveal]", node);

          gsap.set(items, { opacity: 0, y: 22 });
          ScrollTrigger.create({ trigger: node, start: "top 72%", once: true, onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.045, ease: "expo.out" }) });
          gsap.fromTo(obj, { y: 50, opacity: 0, scale: 0.9 }, { y: -20, opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: node, start: "top 92%", end: "top 30%", scrub: true } });
          const bob = gsap.to(float, { y: -8, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
          ScrollTrigger.create({ trigger: node, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? bob.play() : bob.pause()) });
          ScrollTrigger.create({ trigger: node, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(i) });
          if (fine) {
            gsap.set(tilt, { transformPerspective: 800 });
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.1, ease: "expo.out" });
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.1, ease: "expo.out" });
            node.addEventListener("pointermove", (e) => {
              const r = node.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 14);
              rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
            }, { passive: true });
            node.addEventListener("pointerleave", () => { rx(0); ry(0); });
          }
        }
        const film = el.querySelector<HTMLElement>("[data-film-section]")!;
        gsap.set(q("[data-reveal]", film), { opacity: 0, y: 20 });
        ScrollTrigger.create({ trigger: film, start: "top 75%", once: true, onEnter: () => gsap.to(q("[data-reveal]", film), { opacity: 1, y: 0, duration: 1.1, ease: "expo.out" }) });
        gsap.fromTo(film.querySelector("[data-device]"), { y: 70, scale: 0.96 }, { y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: film, start: "top bottom", end: "top 25%", scrub: true } });
        ScrollTrigger.create({ trigger: film, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(0) });

        // ── "Switched on only after its checks": the words light as you read ─
        const checks = el.querySelector<HTMLElement>("[data-checks]")!;
        gsap.fromTo(q("[data-word]", checks), { opacity: 0.16 }, { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: checks, start: "top 78%", end: "bottom 52%", scrub: true } });

        const sheet = el.querySelector<HTMLElement>("[data-sheet]")!;
        gsap.fromTo(sheet, { y: 80, rotation: -1.2 }, { y: -30, rotation: 0, ease: "none", scrollTrigger: { trigger: sheet, start: "top bottom", end: "bottom top", scrub: true } });

        // ── The closing call: its headline rises, the dock steps aside ─────
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
        ScrollTrigger.create({ trigger: cta, start: "top 55%", once: true, onEnter: () => gsap.to(ctaRise, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.35, ease: "expo.out" }) });

        const dock = el.querySelector<HTMLElement>("[data-dock]")!;
        ScrollTrigger.create({ trigger: hero, start: "bottom 65%", endTrigger: cta, end: "top 80%", onToggle: (st) => (dock.dataset.show = String(st.isActive)) });
        gsap.fromTo(dock.querySelector("[data-dock-progress]"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el.querySelector("main"), start: "top top", end: "bottom bottom", scrub: true } });
      }, el);

      refreshWhenSettled(m);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  const words = p.checks.split(" ");

  return (
    <div ref={root} className={s.page}>
      <header className={s.top}>
        <SiteNav lang="en" t={t} bookHref={BOOK} path="/automations" />
      </header>

      <main>
        {/* ── Hero: one screen. The headline frames the crystal from two corners. */}
        <section className={s.hero} data-hero aria-labelledby="proof-title">
          <div className={s.heroA}>
            {/* The scroll fade moves these wrappers; the rise and the line split
                move what is inside them, so no element has two owners. */}
            <span className={s.heroLabel} data-hero-copy><span className="mono-label" data-hero-rise>{p.label}</span></span>
            <h1 id="proof-title" className={`display ${s.h1}`}>
              <span className={s.h1Part} data-hero-copy><span data-split="a">{p.title[0]} {p.title[1]}</span></span>{" "}
              <span className={`${s.h1Part} ${s.h1B}`} data-hero-copy><span data-split="b">{p.title[2]} {p.title[3]}</span></span>
            </h1>
          </div>
          <div className={s.heroStage} data-hero-stage>
            <HeroScene names={names} taglines={p.items.map((it) => it.tagline)} />
          </div>
          <div className={s.heroActions} data-hero-copy>
            <span className={s.actions} data-hero-rise>
              <BookButton href={BOOK} label={t.nav.book} />
              <Link href="/en#demo" className={s.textLink}>{p.see}</Link>
            </span>
          </div>
        </section>

        {/* ── The sub, just after the hero, and the index ─────────────────── */}
        <section className={s.intro} data-section="intro" aria-label="About these automations">
          <p className={s.introText} data-reveal>{p.sub}</p>
        </section>
        <nav className={s.index} data-section="index" aria-label="The five automations">
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

        {/* ── Five editorial spreads; 01 is followed by its film ──────────── */}
        {names.map((n, i) => {
          const pts = p.items[i].points;
          return (
            <div key={n}>
              <section id={`a0${i + 1}`} className={s.spread} data-spread={i} aria-labelledby={`a0${i + 1}-name`}>
                <span className={`${s.numeral} chrome-text`} aria-hidden="true" data-reveal>0{i + 1}</span>
                <div className={s.spreadHead}>
                  <span className={s.stageNum} data-reveal>0{i + 1} / 05</span>
                  <h2 id={`a0${i + 1}-name`} className={`display ${s.spreadName}`} data-reveal>{n}</h2>
                  <p className={s.spreadLead} data-reveal>{p.items[i].tagline}</p>
                </div>
                <div className={s.spreadObj} data-obj aria-hidden="true">
                  <div className={s.objGlow} />
                  <div className={s.objTilt} data-tilt><div data-float><ObjectPicture i={i} /></div></div>
                </div>
                <ol className={s.pointGrid} data-cols={pts.length === 3 ? 3 : 2}>
                  {pts.map((pt, k) => (
                    <li key={pt} className={s.point} data-reveal>
                      <span className={s.pointIdx}>{String(k + 1).padStart(2, "0")}</span>
                      <span className={s.pointText}>{pt}</span>
                    </li>
                  ))}
                </ol>
              </section>
              {i === 0 && <Film t={t} name={n} beats={beats} />}
            </div>
          );
        })}

        {/* ── Checks ─────────────────────────────────────────────────────── */}
        <section className={s.checks} data-checks aria-label="Before anything is switched on">
          <p className={s.checksText}>
            {words.map((w, k) => <span key={k} data-word>{w}{k < words.length - 1 ? " " : ""}</span>)}
          </p>
        </section>

        {/* ── The weekly report ──────────────────────────────────────────── */}
        <section className={s.report} aria-labelledby="report-title" data-section="report">
          <div className={s.reportText}>
            <span className="mono-label" data-reveal>{p.report.label}</span>
            <h2 id="report-title" className={`display ${s.h2}`} data-reveal>{p.report.title[0]} <span className={s.dim}>{p.report.title[1]}</span></h2>
            <p className={s.reportLead} data-reveal>{p.report.body}</p>
          </div>
          <div className={s.sheetWrap}>
            <article className={s.sheet} data-sheet aria-label={t.how.report.title}>
              <header className={s.sheetHead}>
                <span className={s.sheetTag}>{t.how.report.tag}</span>
                <h3 className={s.sheetTitle}>{t.how.report.title}</h3>
              </header>
              <div className={s.sheetTop}>
                {t.how.report.top.map(([v, k]) => (
                  <div key={k}><span className={s.sheetBig}>{v}</span><span className={s.sheetSmall}>{k}</span></div>
                ))}
              </div>
              {(t.how.report.sections as unknown as [string, [string, string][]][]).map(([title, rows]) => (
                <div key={title} className={s.sheetSec}>
                  <span className={s.sheetSecTitle}>{title}</span>
                  {rows.map(([k, v]) => <div key={k} className={s.sheetRow}><span>{k}</span><span className="tnum">{v}</span></div>)}
                </div>
              ))}
              <p className={s.sheetNote}>{t.how.report.note}</p>
            </article>
          </div>
        </section>

        {/* ── Pricing: the homepage's own picker, with each row's amount ──── */}
        <div className={s.pricingHome}>
          <Pricing lang="en" t={{ ...t.pricing, label: p.pricingLabel }} names={names} bookHref={BOOK} addOns />
        </div>

        <Faq label={p.faqLabel} items={p.faq} />

        {/* ── Closing: the mercury ───────────────────────────────────────── */}
        <section className={s.cta} data-cta data-after-faq aria-labelledby="cta-title">
          <div className={s.ctaStage}>
            <Signature sig="chrome" kind="cta" objects={[0]} poster={0} label="A chrome speech bubble over liquid mercury" />
          </div>
          <div className={s.ctaText}>
            <span className="mono-label" data-cta-rise>{ctaLabel}</span>
            <h2 id="cta-title" className={`display ${s.ctaH2}`} data-cta-split>
              <span className={s.h1Line}>{p.cta.title[0]}</span>
              <span className={s.h1Line} data-dim="true">{p.cta.title[1]}</span>
            </h2>
            <p className={s.ctaBody} data-cta-rise>{p.cta.body}</p>
            <div data-cta-rise><BookButton href={BOOK} label={t.nav.book} /></div>
          </div>
        </section>
      </main>

      <div data-after-faq><SiteFooter lang="en" t={t} /></div>
      <Dock names={names} bookHref={BOOK} book={t.nav.book} />
    </div>
  );
}
