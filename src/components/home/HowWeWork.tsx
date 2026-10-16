"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import styles from "./HowWeWork.module.css";

type T = Dictionary["how"];

function CalendarCard({ t }: { t: T["calendar"] }) {
  return (
    <div className={`${styles.card} ${styles.light}`}>
      <div className={styles.cardHead}>
        <span className="text-[13px] font-semibold">{t.title}</span>
        <span className="font-mono text-[10px] text-[#5E636B]">{t.tag}</span>
      </div>
      <div className={styles.calendar}>
        {t.days.map((d, i) => (
          <div key={d} className={styles.day}>
            <span className={styles.dayName}>{d}</span>
            {(i === 3 ? [0, 1, 3] : [0, 1, 2, 3]).map((slot) =>
              i === 3 && slot === 1 ? (
                <span key={slot} className={styles.event}>
                  <span className="font-mono text-[9px] tracking-[0.08em] opacity-70">11:00</span>
                  <span className="text-[11px] font-semibold leading-tight">{t.event}</span>
                </span>
              ) : (
                <span key={slot} className={styles.slot} style={{ opacity: (i + slot) % 3 === 0 ? 0.55 : 1 }} />
              ),
            )}
          </div>
        ))}
      </div>
      <span className="flex items-center gap-2 text-[12px] text-[#5E636B]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#0B0C0E]" />
        {t.by}
      </span>
    </div>
  );
}

function ReviewCard({ t }: { t: T["review"] }) {
  return (
    <div className={`${styles.card} ${styles.dark}`}>
      <div className={styles.cardHead}>
        <span className="font-mono text-[10px] tracking-[0.12em] text-silver">{t.tag}</span>
        <span className="h-[6px] w-[6px] rounded-full bg-silver" />
      </div>
      <div className="flex flex-col gap-[9px] text-[13.5px] leading-[1.45]">
        <span className="max-w-[78%] self-end rounded-[16px_16px_4px_16px] bg-[#ECEEF1] px-3 py-[10px] text-obsidian">{t.lead}</span>
        <span className="max-w-[86%] self-start rounded-[16px_16px_16px_4px] bg-surface-2 px-3 py-[10px]">{t.reply}</span>
      </div>
      <span className={styles.annotation}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
        {t.note}
      </span>
    </div>
  );
}

function ReportCard({ t }: { t: T["report"] }) {
  return (
    <div className={`${styles.card} ${styles.light} !p-0`}>
      <div className="flex items-center justify-between border-b border-[#DADDE2] px-[22px] py-[18px]">
        <span className="text-[13px] font-bold tracking-[0.06em]" style={{ fontStretch: "125%" }}>RYVO</span>
        <span className="font-mono text-[10px] text-[#6A6F77]">{t.tag}</span>
      </div>
      <div className="flex flex-col gap-[18px] p-[22px]">
        <span className="text-[22px] font-medium tracking-[-0.02em]" style={{ fontStretch: "110%" }}>{t.title}</span>
        <div className="grid grid-cols-3 gap-3">
          {t.stats.map(([n, label]) => (
            <span key={label} className="flex flex-col gap-1">
              <span className="tnum text-[30px] font-semibold" style={{ fontStretch: "112%" }}>{n}</span>
              <span className="text-[11px] text-[#5E636B]">{label}</span>
            </span>
          ))}
        </div>
        <div className="flex h-16 items-end gap-[6px]" aria-hidden="true">
          {[40, 65, 50, 85, 60, 95, 70].map((h, i) => (
            <span key={i} className="flex-1 rounded-[4px]" style={{ height: `${h}%`, background: i === 3 ? "#0B0C0E" : "#C9CDD3" }} />
          ))}
        </div>
        <span className="text-[12px] text-[#5E636B]">{t.note}</span>
      </div>
    </div>
  );
}

export default function HowWeWork({ t }: { t: T }) {
  const [active, setActive] = useState(2);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const block = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const st = block.current;
    if (!el || !st || prefersReducedMotion()) return;
    return withMotion(({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      // Desktop: the stage pins and the steps change in place as you scroll.
      mm.add("(min-width: 1024px)", () => {
        setActive(0);
        const trigger = ScrollTrigger.create({
          trigger: st,
          start: "top 8%",
          end: "+=170%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          onUpdate: (self) => {
            setActive(Math.min(2, Math.floor(self.progress * 3)));
            if (fill.current) fill.current.style.transform = `scaleY(${self.progress})`;
          },
        });
        return () => trigger.kill();
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
          <ol className={styles.steps} data-thread-rail>
            <span aria-hidden="true" className={styles.rail}><span ref={fill} className={styles.railFill} /></span>
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
            {[<CalendarCard key="c" t={t.calendar} />, <ReviewCard key="r" t={t.review} />, <ReportCard key="p" t={t.report} />].map((card, i) => (
              <div key={i} className={styles.layer} data-state={i === active ? "on" : i < active ? "past" : "next"}>
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
