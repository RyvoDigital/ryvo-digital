"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion } from "@/lib/gsap";
import styles from "./Trust.module.css";

type Beat = 0 | 1 | 2 | 3; // nothing · first message landed · typing · reply landed

// Each rule is proven by a mini chat that plays like real messaging when its row
// enters view: the message lands, the assistant types, the reply lands. Calm:
// fades and a few pixels of rise, no bounce. Every bubble reserves its space
// from the start, so nothing moves around it.
function useBeats(hasLead: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<Beat>(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (prefersReducedMotion()) { timers.push(window.setTimeout(() => setBeat(3), 0)); return; }
      const t0 = hasLead ? 250 : 0;
      if (hasLead) timers.push(window.setTimeout(() => setBeat(1), t0));
      timers.push(window.setTimeout(() => setBeat(2), t0 + 700));
      timers.push(window.setTimeout(() => setBeat(3), t0 + 2000));
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [hasLead]);
  return { ref, beat };
}

function Typing({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={styles.typing} data-on={on}>
      <i /><i /><i />
    </span>
  );
}

function MiniChat({ lead, reply, caption }: { lead?: string; reply: React.ReactNode; caption?: string }) {
  const { ref, beat } = useBeats(Boolean(lead));
  return (
    <div ref={ref} className={styles.chat} data-no-pill>
      {lead && <span className={styles.lead} data-on={beat >= 1}>{lead}</span>}
      <span className={styles.replyWrap}>
        <Typing on={beat === 2} />
        <span className={styles.agent} data-on={beat >= 3}>{reply}</span>
      </span>
      {caption && <span className={styles.caption} data-on={beat >= 3}>{caption}</span>}
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
