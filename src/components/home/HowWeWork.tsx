"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import styles from "./HowWeWork.module.css";

type T = Dictionary["how"];

function SettingsCard({ t }: { t: T["settings"] }) {
  return (
    <div className={`${styles.card} ${styles.light}`}>
      <div className={styles.cardHead}>
        <span className="text-[13px] font-semibold">{t.title}</span>
        <span className="font-mono text-[10px] text-[#5E636B]">{t.tag}</span>
      </div>
      <dl className={styles.rows}>
        {t.rows.map(([k, v]) => (
          <div key={k} className={styles.row}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-[6px]">
        <span className="font-mono text-[9.5px] tracking-[0.08em] text-[#5E636B]">{t.consultantsLabel.toUpperCase()}</span>
        {t.consultants.map(([name, areas, langs]) => (
          <span key={name} className={styles.consultant}>
            <span className={styles.initial}>{name[0]}</span>
            <span className="font-semibold">{name}</span>
            <span className="text-[#5E636B]">{areas}</span>
            <span className="ml-auto font-mono text-[10px] text-[#5E636B]">{langs}</span>
          </span>
        ))}
      </div>
      <div className={styles.locked}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
        <span className="font-semibold">{t.locked[0]}</span>
        <span className="text-[#C4C8CE]">{t.locked[1]}</span>
        <span className="ml-auto font-mono text-[9.5px] tracking-[0.1em] text-[#A9AEB6]">{t.lockedTag}</span>
      </div>
    </div>
  );
}

function SupervisedCard({ t }: { t: T["supervised"] }) {
  return (
    <div className={styles.pair}>
      <div className={`${styles.card} ${styles.dark} ${styles.convo}`}>
        <div className={styles.cardHead}>
          <span className="font-mono text-[10px] tracking-[0.12em] text-silver">{t.tag}</span>
        </div>
        <div className="flex flex-col gap-[8px] text-[12.5px] leading-[1.42]">
          <span className={styles.bLead}>{t.lead1}</span>
          <span className={styles.bAgent}>{t.agent1}</span>
          <span className={styles.bLead}>{t.lead2}</span>
          <span className={styles.bAgent}>{t.agent2}</span>
        </div>
      </div>
      <div className={`${styles.card} ${styles.light} ${styles.handover}`}>
        <div className={styles.cardHead}>
          <span className="text-[13px] font-semibold">{t.cardTitle}</span>
          <span className="font-mono text-[9px] tracking-[0.08em] text-[#5E636B]">{t.cardTag}</span>
        </div>
        <dl className={styles.cardRows}>
          {t.card.map(([k, v]) => (
            <div key={k}>
              <dt>{k}:</dt> <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <span className={styles.caption}>{t.caption}</span>
    </div>
  );
}

function ReportCard({ t }: { t: T["report"] }) {
  return (
    <div className={`${styles.card} ${styles.light} ${styles.report} !p-0`}>
      <div className="flex items-center justify-between border-b border-[#DADDE2] px-[20px] py-[14px]">
        <span className="text-[13px] font-bold tracking-[0.06em]" style={{ fontStretch: "125%" }}>RYVO</span>
        <span className="font-mono text-[10px] text-[#6A6F77]">{t.tag}</span>
      </div>
      <div className="flex flex-col gap-[14px] px-[20px] py-[16px]">
        <span className="text-[19px] font-medium tracking-[-0.02em]" style={{ fontStretch: "110%" }}>{t.title}</span>
        <div className="grid grid-cols-3 gap-3">
          {t.top.map(([n, label]) => (
            <span key={label} className="flex flex-col gap-1">
              <span className="tnum whitespace-nowrap text-[26px] font-semibold leading-none" style={{ fontStretch: "112%" }}>{n}</span>
              <span className="text-[10.5px] leading-[1.3] text-[#5E636B]">{label}</span>
            </span>
          ))}
        </div>
        <div className={styles.sections}>
          {t.sections.map(([title, rows]) => (
            <div key={title as string} className="flex flex-col gap-[3px]">
              <span className="text-[11px] font-semibold">{title as string}</span>
              {(rows as string[][]).map(([k, v]) => (
                <span key={k} className="flex justify-between gap-3 text-[10.5px] text-[#3D4045]">
                  <span>{k}</span>
                  <span className="tnum whitespace-nowrap font-semibold text-[#0B0C0E]">{v}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[6px]">
          <span className="text-[11px] font-semibold">{t.languagesLabel}</span>
          <div className={styles.share} aria-hidden="true">
            {t.languages.map(([l, pct], i) => (
              <span key={l as string} style={{ flexGrow: pct as number, background: ["#0B0C0E", "#5E636B", "#A9AEB6", "#D3D6DB"][i] }} />
            ))}
          </div>
          <span className="flex gap-3 font-mono text-[10px] text-[#5E636B]">
            {t.languages.map(([l, pct]) => <span key={l as string} className="whitespace-nowrap">{l} {pct}%</span>)}
          </span>
        </div>
        <span className="text-[10.5px] text-[#5E636B]">{t.note}</span>
      </div>
    </div>
  );
}

export default function HowWeWork({ t }: { t: T }) {
  const [active, setActive] = useState(2);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const st = block.current;
    if (!el || !st || prefersReducedMotion()) return;
    return withMotion(({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      // Desktop: the stage pins and the steps change in place as you scroll.
      mm.add("(min-width: 1024px)", () => {
        setActive(0);
        // When it locks, the whole block is visible and centred between the
        // floating nav and the bottom edge: scaled down to fit short windows,
        // and the pin starts at the offset that centres it.
        const box = outer.current!;
        const TOP = 76, BOTTOM = 24;
        let offset = TOP;
        const fit = () => {
          st.style.transform = "none";
          const natural = st.offsetHeight;
          const avail = innerHeight - TOP - BOTTOM;
          const scale = Math.min(1, avail / natural);
          st.style.transform = scale < 1 ? `scale(${scale})` : "none";
          st.style.transformOrigin = "top center";
          box.style.height = `${natural * scale}px`;
          offset = TOP + Math.max(0, (avail - natural * scale) / 2);
        };
        fit();
        ScrollTrigger.addEventListener("refreshInit", fit);
        const trigger = ScrollTrigger.create({
          trigger: box,
          start: () => `top ${offset}px`,
          end: "+=170%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setActive(Math.min(2, Math.floor(self.progress * 3)));
            },
        });
        return () => {
          trigger.kill();
          ScrollTrigger.removeEventListener("refreshInit", fit);
          st.style.transform = "";
          box.style.height = "";
        };
      });
      // Phones: no pinning; the panel cycles calmly while the section is in view.
      mm.add("(max-width: 1023px)", () => {
        let timer = 0;
        const io = new IntersectionObserver(([e]) => {
          window.clearInterval(timer);
          if (e.isIntersecting) timer = window.setInterval(() => setActive((a) => (a + 1) % 3), 3200);
        }, { threshold: 0.3 });
        io.observe(el);
        return () => { io.disconnect(); window.clearInterval(timer); };
      });
      return () => mm.revert();
    });
  }, []);

  return (
    <section ref={root} id="how" className={styles.section} aria-labelledby="how-title">
      <div ref={outer}>
      <div ref={block} className={styles.inner}>
        <div className="flex flex-col gap-[18px]">
          <span className="mono-label">{t.label}</span>
          <h2 id="how-title" className={`display ${styles.title}`}>
            {t.titleA}
            <br />
            <span className={`chrome-text ${styles.indent}`}>{t.titleB}</span>
          </h2>
        </div>
        <div ref={stage} className={styles.stage}>
          <ol className={styles.steps}>
            {t.steps.map((s, i) => (
              <li key={s.title} className={styles.step} data-on={active === i}>
                <span className={`${styles.stepNum} ${active === i ? "chrome-text" : ""}`}>0{i + 1}</span>
                <span className="flex flex-col gap-[6px]">
                  <span className={styles.stepTitle}>{s.title}</span>
                  <span className={styles.stepText}>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.object} aria-hidden="true">
            {[<SettingsCard key="c" t={t.settings} />, <SupervisedCard key="r" t={t.supervised} />, <ReportCard key="p" t={t.report} />].map((card, i) => (
              <div key={i} className={styles.layer} data-state={i === active ? "on" : i < active ? "past" : "next"}>
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
