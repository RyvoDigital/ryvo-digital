"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Pages } from "@/i18n/pages";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";
import { BookButton } from "@/components/chrome/Icons";
import Signature from "./Signature";
import Story from "./Story";
import Pricing from "./Pricing";
import Faq from "./Faq";
import Dock from "./Dock";
import { objectSrc } from "./objects";
import { refreshWhenSettled, startMotion } from "./motion";
import type { Sig } from "./stage-scene";
import s from "./proof.module.css";

type P = Pages["automations"];

const BOOK = "/en/book";

function ObjectPicture({ i, sizes }: { i: number; sizes: string }) {
  const set = (ext: "avif" | "webp") => [480, 800, 1200].map((w) => `${objectSrc(i, w as 480, ext)} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <img src={objectSrc(i, 800, "webp")} srcSet={set("webp")} sizes={sizes} width={1200} height={1200} alt="" loading="lazy" decoding="async" className={s.objImg} />
    </picture>
  );
}

export default function ProofPage({ sig, t, p, ctaLabel }: { sig: Sig; t: Dictionary; p: P; ctaLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const names = t.automationNames;
  const first = p.items[0].points;
  // The three beats reuse 01's own points (first sentence where a point is long).
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
      if (reduced) return; // Everything is already in place: no pins, no smoothing.

      const ctx = gsap.context(() => {
        const q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<T>(sel) as NodeListOf<T>);
        const fine = matchMedia("(pointer: fine)").matches;
        const phone = matchMedia("(max-width: 767px)").matches;

        // ── Hero: the headline rises line by line out of its own mask ──────
        const hero = el.querySelector<HTMLElement>("[data-hero]")!;
        const h1 = hero.querySelector<HTMLElement>("[data-split]")!;
        SplitText.create(h1, {
          type: "lines", mask: "lines", autoSplit: true,
          onSplit(self) {
            h1.dataset.ready = "true";
            return gsap.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.075, ease: "expo.out", delay: 0.08 });
          },
        });
        gsap.fromTo(q("[data-hero-rise]", hero), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, delay: 0.5, ease: "expo.out" });
        gsap.to(q("[data-hero-copy]", hero), { y: -70, opacity: 0.15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

        // ── The index under the hero ───────────────────────────────────────
        const index = el.querySelector<HTMLElement>("[data-index]")!;
        gsap.set(q("[data-index-item]", index), { opacity: 0, y: 22 });
        ScrollTrigger.create({ trigger: index, start: "top 88%", once: true, onEnter: () => gsap.to(q("[data-index-item]", index), { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: "expo.out" }) });

        // ── Stages and the 01 story, in page order ─────────────────────────
        const dockLinks = q<HTMLAnchorElement>("[data-dock-link]");
        const setDock = (i: number) => dockLinks.forEach((a, k) => (a.dataset.active = String(k === i)));

        for (const node of q("[data-stage], [data-story]")) {
          if (node.hasAttribute("data-story")) { story(node); continue; }
          const i = Number(node.dataset.stage);
          const obj = node.querySelector<HTMLElement>("[data-obj]")!;
          const par = node.querySelector<HTMLElement>("[data-par]")!;
          const tilt = node.querySelector<HTMLElement>("[data-tilt]")!;
          const float = node.querySelector<HTMLElement>("[data-float]")!;
          const items = q("[data-reveal]", node);

          gsap.fromTo(obj, { y: 110, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: node, start: "top 98%", end: "top 28%", scrub: true } });
          gsap.fromTo(par, { yPercent: 7 }, { yPercent: -7, ease: "none", scrollTrigger: { trigger: node, start: "top bottom", end: "bottom top", scrub: true } });
          gsap.set(items, { opacity: 0, y: 26 });
          ScrollTrigger.create({ trigger: node, start: "top 66%", once: true, onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.055, ease: "expo.out" }) });

          const bob = gsap.to(float, { y: -14, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
          ScrollTrigger.create({ trigger: node, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? bob.play() : bob.pause()) });
          ScrollTrigger.create({ trigger: node, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(i) });

          if (fine) {
            gsap.set(tilt, { transformPerspective: 1100 });
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.1, ease: "expo.out" });
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.1, ease: "expo.out" });
            node.addEventListener("pointermove", (e) => {
              const r = obj.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 12);
              rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
            }, { passive: true });
            node.addEventListener("pointerleave", () => { rx(0); ry(0); });
          }
        }

        function story(node: HTMLElement) {
          const pin = node.querySelector<HTMLElement>("[data-story-pin]")!;
          const body = node.querySelector<HTMLElement>("[data-chat-body]")!;
          const col = node.querySelector<HTMLElement>("[data-chat-col]")!;
          const chat = body.parentElement!;
          const s0 = q('[data-step="0"]', node), s1 = q('[data-step="1"]', node);
          const pick = node.querySelector<HTMLElement>("[data-pick-fill]")!;
          const hand = node.querySelector<HTMLElement>("[data-handover]")!;
          const rows = q("[data-hand-row]", hand);
          const beatEls = q("[data-beat]", node);
          const prog = node.querySelector<HTMLElement>("[data-story-progress]")!;
          const dim = phone ? 0 : 0.62; // inactive beats stay AA (≥ 4.5:1)
          node.dataset.anim = "on";

          gsap.set([...s0, ...s1], { opacity: 0, y: 16 });
          gsap.set(hand, { opacity: 0, y: 56 });
          gsap.set(rows, { opacity: 0, y: 10 });
          gsap.set(beatEls, { opacity: dim });
          gsap.set(beatEls[0], { opacity: 1 });
          gsap.set(prog, { scaleY: 0 });
          // Keep the newest message on the bottom edge of the chat, as a phone does.
          const lift = (els: HTMLElement[]) => () => {
            const last = els[els.length - 1];
            return body.clientHeight - 18 - (last.offsetTop + last.offsetHeight);
          };

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: node, start: "top top", end: phone ? "+=230%" : "+=270%", pin, scrub: true, anticipatePin: 1, invalidateOnRefresh: true },
          });
          tl.fromTo(col, { y: lift(s0) }, { y: lift(s0), duration: 0.01 }, 0)
            .to(s0, { opacity: 1, y: 0, stagger: 0.14, duration: 0.42 }, 0.04)
            .addLabel("b1", "+=0.3")
            .to(beatEls[0], { opacity: dim, duration: 0.16 }, "b1")
            .to(beatEls[1], { opacity: 1, duration: 0.16 }, "b1")
            .to(col, { y: lift(s1), duration: 0.5 }, "b1")
            .to(s1, { opacity: 1, y: 0, stagger: 0.16, duration: 0.4 }, "b1+=0.04")
            .to(pick, { opacity: 1, duration: 0.14 }, "b1+=0.2")
            .addLabel("b2", "+=0.3")
            .to(beatEls[1], { opacity: dim, duration: 0.16 }, "b2")
            .to(beatEls[2], { opacity: 1, duration: 0.16 }, "b2")
            .to(chat, { opacity: 0.32, scale: 0.97, duration: 0.4 }, "b2")
            .to(hand, { opacity: 1, y: 0, duration: 0.45 }, "b2")
            .to(rows, { opacity: 1, y: 0, stagger: 0.06, duration: 0.24 }, "b2+=0.12")
            .to({}, { duration: 0.35 });
          tl.to(prog, { scaleY: 1, duration: tl.duration() }, 0);
          ScrollTrigger.create({ trigger: node, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setDock(0) });
        }

        // ── "Switched on only after its checks": the words light as you read ─
        const checks = el.querySelector<HTMLElement>("[data-checks]")!;
        gsap.fromTo(q("[data-word]", checks), { opacity: 0.16 }, { opacity: 1, stagger: 0.12, ease: "none", scrollTrigger: { trigger: checks, start: "top 78%", end: "bottom 52%", scrub: true } });

        // ── Report, pricing, questions: settle in once ─────────────────────
        for (const sec of q("[data-section]")) {
          const items = q("[data-reveal]", sec);
          gsap.set(items, { opacity: 0, y: 26 });
          ScrollTrigger.create({ trigger: sec, start: "top 72%", once: true, onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.07, ease: "expo.out" }) });
        }
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
    <div ref={root} className={s.page} data-sig={sig}>
      <header className={s.top}>
        <SiteNav lang="en" t={t} bookHref={BOOK} path="/automations" />
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className={s.hero} data-hero aria-labelledby="proof-title">
          <div className={s.heroCopy} data-hero-copy>
            <span className="mono-label" data-hero-rise>{p.label}</span>
            <h1 id="proof-title" className={`display ${s.h1}`} data-split>
              {p.title.map((line, i) => <span key={line} className={s.h1Line} data-dim={i >= 2}>{line}{i < p.title.length - 1 ? " " : ""}</span>)}
            </h1>
          </div>
          <div className={s.heroStage}>
            <Signature sig={sig} kind="hero" objects={[0, 1, 2, 3, 4]} poster={0} label="The five automations as five chrome objects" />
          </div>
          <div className={s.heroFoot} data-hero-copy>
            <p className={s.sub} data-hero-rise>{p.sub}</p>
            <div className={s.actions} data-hero-rise>
              <BookButton href={BOOK} label={t.nav.book} />
              <Link href="/en#demo" className={s.textLink}>{p.see}</Link>
            </div>
          </div>
        </section>

        {/* ── Index ─────────────────────────────────────────────────────── */}
        <nav className={s.index} data-index aria-label="The five automations">
          <ol className={s.indexList}>
            {names.map((n, i) => (
              <li key={n} data-index-item>
                <a href={`#a0${i + 1}`} className={s.indexItem}>
                  <span className={s.indexNum}>0{i + 1}</span>
                  <span className={s.indexName}>{n}</span>
                  <span className={s.indexLine}>{p.items[i].tagline}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── One stage per automation; 01 opens into its story ─────────── */}
        {names.map((n, i) => (
          <div key={n}>
            <section id={`a0${i + 1}`} className={s.stage} data-stage={i} data-side={i % 2 ? "right" : "left"} aria-labelledby={`a0${i + 1}-name`}>
              <div className={s.stageObj} data-obj>
                <div className={s.objGlow} aria-hidden="true" />
                <div className={s.objPar} data-par>
                  <div className={s.objTilt} data-tilt>
                    <div data-float><ObjectPicture i={i} sizes="(min-width: 1024px) 46vw, 86vw" /></div>
                  </div>
                </div>
                <div className={s.objPool} aria-hidden="true" />
              </div>
              <div className={s.stageText}>
                <span className={s.stageNum} data-reveal>0{i + 1} / 05</span>
                <h2 id={`a0${i + 1}-name`} className={`display ${s.stageName}`} data-reveal>{n}</h2>
                <p className={s.tagline} data-reveal>{p.items[i].tagline}</p>
                <ul className={s.points}>
                  {p.items[i].points.map((pt) => <li key={pt} data-reveal>{pt}</li>)}
                </ul>
              </div>
            </section>
            {i === 0 && <Story t={t} name={n} beats={beats} />}
          </div>
        ))}

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

        <Pricing t={t.pricing} names={names} label={p.pricingLabel} bookHref={BOOK} />
        <Faq label={p.faqLabel} items={p.faq} />

        {/* ── Closing ────────────────────────────────────────────────────── */}
        <section className={s.cta} data-cta data-after-faq aria-labelledby="cta-title">
          <div className={s.ctaStage}>
            <Signature sig={sig} kind="cta" objects={[0]} poster={0} label="A chrome speech bubble" />
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
