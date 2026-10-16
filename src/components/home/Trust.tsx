"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import styles from "./Trust.module.css";

export default function Trust({ t }: { t: Dictionary["trust"] }) {
  const root = useRef<HTMLElement>(null);

  // Each rule is proven by a mini chat whose two bubbles play when its row enters view.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    return withMotion(({ gsap }) => {
      const ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>("[data-rule]").forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 75%" } });
          tl.from(row.querySelector("[data-rule-title]"), { opacity: 0, y: 20, duration: 1 })
            .from(row.querySelectorAll("[data-bubble]"), { opacity: 0, y: 12, scale: 0.97, duration: 0.7, stagger: 0.55, transformOrigin: "bottom" }, 0.3);
        });
      }, el);
      return () => ctx.revert();
    });
  }, []);

  const [r1, r2, r3] = t.rules;

  return (
    <section ref={root} id="trust" className={styles.section} aria-labelledby="trust-title">
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.inner}>
        <span className="mono-label">{t.label}</span>
        <h2 id="trust-title" className={`display ${styles.title}`}>{t.title}</h2>

        <div className={styles.rule} data-rule>
          <span className={styles.ruleText} data-rule-title>
            <span className={styles.ruleN}>{r1.n}</span>
            <span className={styles.ruleTitle}>{r1.title[0]} <br className="hidden lg:block" />{r1.title[1]}</span>
          </span>
          <div className={styles.chat}>
            <span className={styles.lead} data-bubble>{r1.lead}</span>
            <span className={styles.agent} data-bubble>{r1.reply}</span>
          </div>
        </div>

        <div className={styles.rule} data-rule>
          <span className={styles.ruleText} data-rule-title>
            <span className={styles.ruleN}>{r2.n}</span>
            <span className={styles.ruleTitle}>{r2.title[0]} <br className="hidden lg:block" /><span className="text-steel">{r2.title[1]}</span></span>
          </span>
          <div className={styles.chat}>
            <span className={styles.agent} data-bubble><strong className="font-semibold text-text">{r2.greeting}</strong>{r2.rest}</span>
            <span className="self-start font-mono text-[10px] tracking-[0.06em] text-steel" data-bubble>{r2.caption}</span>
          </div>
        </div>

        <div className={`${styles.rule} ${styles.last}`} data-rule>
          <span className={styles.ruleText} data-rule-title>
            <span className={styles.ruleN}>{r3.n}</span>
            <span className={styles.ruleTitle}>{r3.title[0]} <br className="hidden lg:block" />{r3.title[1]}</span>
          </span>
          <div className={styles.chat}>
            <span className={styles.lead} data-bubble>{r3.lead}</span>
            <span className={styles.agent} data-bubble>{r3.reply}</span>
          </div>
        </div>

        <ul className={styles.facts}>
          {t.facts.map((f) => (
            <li key={f} className="flex items-center gap-[10px]">
              <span aria-hidden="true" className="h-[6px] w-[6px] shrink-0 rounded-full bg-silver" />
              {f}
            </li>
          ))}
        </ul>
        <p className={styles.footnote}>{t.footnote}</p>
      </div>
    </section>
  );
}
