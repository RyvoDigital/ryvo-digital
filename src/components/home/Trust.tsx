"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import ChatThread, { useChatPlayer, type Who } from "@/components/chrome/ChatThread";
import styles from "./Trust.module.css";

// Each rule is proven by a mini chat that plays like iMessage when its row
// enters view (ChatThread): the message lands, "Delivered", the assistant types,
// the reply lands. Every bubble keeps its place from the start.
function MiniChat({ lead, reply, caption, delivered }: { lead?: string; reply: React.ReactNode; caption?: string; delivered: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const whos: Who[] = lead ? ["lead", "agent"] : ["agent"];
  const { state, play } = useChatPlayer(whos);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      play(250);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [play]);
  const done = state.shown === whos.length;
  const items = [...(lead ? [{ who: "lead" as Who, content: lead }] : []), { who: "agent" as Who, content: reply }];
  return (
    <div ref={ref} className={styles.chat} data-no-pill>
      <ChatThread items={items} state={state} deliveredLabel={delivered} classes={{ lead: styles.lead, agent: styles.agent }} />
      {caption && <span className={styles.caption} data-on={done}>{caption}</span>}
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
          <MiniChat lead={r1.lead} reply={r1.reply} delivered={t.delivered} />
        </div>

        <div className={styles.rule}>
          <span className={styles.ruleText}>
            <span className={styles.ruleN}>{r2.n}</span>
            <span className={styles.ruleTitle}>{r2.title[0]} <br className="hidden lg:block" /><span className="text-steel">{r2.title[1]}</span></span>
          </span>
          <MiniChat reply={<><strong className="font-semibold text-text">{r2.greeting}</strong>{r2.rest}</>} caption={r2.caption} delivered={t.delivered} />
        </div>

        <div className={`${styles.rule} ${styles.last}`}>
          <span className={styles.ruleText}>
            <span className={styles.ruleN}>{r3.n}</span>
            <span className={styles.ruleTitle}>{r3.title[0]} <br className="hidden lg:block" />{r3.title[1]}</span>
          </span>
          <MiniChat lead={r3.lead} reply={r3.reply} delivered={t.delivered} />
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
