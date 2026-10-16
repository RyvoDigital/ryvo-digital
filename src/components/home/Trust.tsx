"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import styles from "./Trust.module.css";

// Each rule is proven by a short exchange. When its row comes into view, the
// buyer's message glides in from the right and the reply from the left (a fade
// and a short slide, staggered), once. Reduced motion: they are simply there.
function MiniChat({ lead, reply, caption }: { lead?: string; reply: React.ReactNode; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setInView(true);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.chat} data-in={inView} data-no-pill>
      {lead && <span className={`${styles.lead} ${styles.fromRight}`}>{lead}</span>}
      <span className={`${styles.agent} ${styles.fromLeft}`} style={{ transitionDelay: lead ? "0.12s" : "0s" }}>{reply}</span>
      {caption && <span className={`${styles.caption} ${styles.fromLeft}`} style={{ transitionDelay: "0.24s" }}>{caption}</span>}
    </div>
  );
}

export default function Trust({ t }: { t: Dictionary["trust"] }) {
  const [r1, r2, r3] = t.rules;

  return (
    <section id="trust" className={styles.section} aria-labelledby="trust-title">
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.inner}>
        <span className="mono-label">{t.label}</span>
        <h2 id="trust-title" className={`display ${styles.title}`}>{t.title}</h2>

        <div className={styles.rule}>
          <span className={styles.ruleText}>
            <span className={styles.ruleN}>{r1.n}</span>
            <span className={styles.ruleTitle}>{r1.title[0]} <br className="hidden lg:block" />{r1.title[1]}</span>
          </span>
          <MiniChat lead={r1.lead} reply={r1.reply} />
        </div>

        <div className={styles.rule}>
          <span className={styles.ruleText}>
            <span className={styles.ruleN}>{r2.n}</span>
            <span className={styles.ruleTitle}>{r2.title[0]} <br className="hidden lg:block" /><span className="text-steel">{r2.title[1]}</span></span>
          </span>
          <MiniChat reply={<><strong className="font-semibold text-text">{r2.greeting}</strong>{r2.rest}</>} caption={r2.caption} />
        </div>

        <div className={`${styles.rule} ${styles.last}`}>
          <span className={styles.ruleText}>
            <span className={styles.ruleN}>{r3.n}</span>
            <span className={styles.ruleTitle}>{r3.title[0]} <br className="hidden lg:block" />{r3.title[1]}</span>
          </span>
          <MiniChat lead={r3.lead} reply={r3.reply} />
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
