"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import { nextThursday, useViewingKey } from "@/lib/viewing-date";
import { CHATS, CHAT_LANGS, LANG_NAME, chatDates, type ChatLang } from "./demo-chats";
import styles from "./Demo.module.css";

const AGENCY: Record<ChatLang, string> = { PT: "A sua agência", EN: "Your agency", ES: "Su agencia", FR: "Votre agence", DE: "Ihre Agentur" };

export default function Demo({ lang, t }: { lang: Locale; t: Dictionary["demo"] }) {
  const [chatLang, setChatLang] = useState<ChatLang>(lang.toUpperCase() as ChatLang);
  const [step, setStep] = useState(4); // bubbles shown; replays on language change
  const key = useViewingKey();
  const root = useRef<HTMLElement>(null);
  const seen = useRef(false);
  const timers = useRef<number[]>([]);

  const chat = useMemo(() => {
    const c = CHATS[chatLang];
    const d = chatDates(chatLang, key ? nextThursday() : null);
    return { ...c, a1: c.a1.replace("{a}", d.a), a2: c.a2.replace("{b}", d.b) };
  }, [chatLang, key]);

  // Play the conversation: once when it first comes into view, then on each language tap.
  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    if (prefersReducedMotion()) return setStep(4);
    setStep(0);
    timers.current = [1, 2, 3, 4].map((n, i) => window.setTimeout(() => setStep(n), 250 + i * 650));
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !seen.current) { seen.current = true; play(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    if (prefersReducedMotion()) return () => io.disconnect();
    const stop = withMotion(({ gsap }) => {
      const ctx = gsap.context(() => {
        gsap.from(el.querySelectorAll("[data-tl]"), { opacity: 0, x: -14, duration: 1, stagger: 0.12, scrollTrigger: { trigger: el.querySelector("[data-timeline]"), start: "top 80%" } });
      }, el);
      return () => ctx.revert();
    });
    const pending = timers.current;
    return () => { io.disconnect(); stop(); pending.forEach(clearTimeout); };
  }, [play]);

  const bubbles: [string, "lead" | "agent"][] = [[chat.l1, "lead"], [chat.a1, "agent"], [chat.l2, "lead"], [chat.a2, "agent"]];

  return (
    <section ref={root} id="demo" className={styles.section} aria-labelledby="demo-title">
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className="mono-label">{t.label}</span>
          <h2 id="demo-title" className={`display ${styles.title}`}>
            <span className="hidden lg:inline">
              {t.title[0]}<br /><span className={styles.i1}>{t.title[1]}</span><br /><span className={styles.i2}>{t.title[2]}</span>
            </span>
            <span className="lg:hidden">
              {t.titleMobile[0]}<br /><span className="pl-[50px] text-steel">{t.titleMobile[1]}</span>
            </span>
          </h2>
          <ol className={styles.timeline} data-timeline data-thread-timeline>
            <span aria-hidden="true" className={styles.rail} />
            {t.timeline.map((row, i) => (
              <li key={i} className={styles.tl} data-tl>
                <span aria-hidden="true" className={styles.dot} style={{ background: ["#F1F2F4", "#CDD1D9", "#7E838B", "#4A4E54"][i] }} />
                <span className={styles.time}>{row.time}</span>
                <span className={styles.text}>{row.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.right}>
          <div role="group" aria-label={t.switchLabel} className={styles.switch}>
            {CHAT_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l.toLowerCase()}
                aria-label={`${l}, ${LANG_NAME[l]}`}
                aria-pressed={l === chatLang}
                onClick={() => { setChatLang(l); play(); }}
                className={styles.langBtn}
              >
                {l}
              </button>
            ))}
          </div>
          <div className={styles.phone} lang={chatLang.toLowerCase()}>
            <div className={styles.phoneHead}>
              <span className={styles.avatar} aria-hidden="true">YA</span>
              <span className="flex flex-col gap-[2px] leading-tight">
                <span className="text-[13px] font-semibold">{AGENCY[chatLang]}</span>
                <span className="text-[10.5px] text-steel">{chat.status}</span>
              </span>
            </div>
            <div className={styles.thread} aria-live="polite">
              {bubbles.map(([text, who], i) => (
                <p key={`${chatLang}-${i}`} className={who === "lead" ? styles.lead : styles.agent} data-on={step > i}>
                  {text}
                </p>
              ))}
            </div>
          </div>
          <span className="mono-label text-center !text-[10px]">
            <span className="hidden lg:inline">{t.caption}</span>
            <span className="lg:hidden">{t.captionMobile}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
