"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import styles from "./Book.module.css";

// Two Google Calendar appointment schedules (automations call / website project),
// embedded inline. Until Manuel supplies the embed links (env vars below), the
// glass panel says so calmly and offers email instead.
const SCHEDULES = [process.env.NEXT_PUBLIC_BOOKING_URL_AUTOMATIONS, process.env.NEXT_PUBLIC_BOOKING_URL_WEBSITES];

export default function Book({ t, initial = 0 }: { t: Dictionary["book"]; initial?: 0 | 1 }) {
  const [kind, setKind] = useState<0 | 1>(initial);
  const [near, setNear] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const url = SCHEDULES[kind];

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="book" className={styles.section} aria-labelledby="book-title">
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className="mono-label">{t.label}</span>
          <h2 id="book-title" className={`display ${styles.title}`}>
            {t.title[0]}
            <br className="hidden lg:block" /> {t.title[1]} <span className="chrome-text">{t.title[2]}</span>
            <br className="hidden lg:block" /> <span className={`chrome-text ${styles.indent}`}>{t.title[3]}</span>
          </h2>
          <p className={styles.body}>
            {t.body} <a href="mailto:hello@ryvodigital.com" className="text-text underline underline-offset-4">hello@ryvodigital.com</a>.
          </p>
        </div>

        <div ref={panel} className={styles.panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label={t.panelTag} className={styles.kinds}>
              {t.kinds.map((k, i) => (
                <button key={k} type="button" role="tab" aria-selected={kind === i} onClick={() => setKind(i as 0 | 1)} className={styles.kind}>
                  {k}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] text-steel">{t.panelTag}</span>
          </div>

          {url ? (
            near && <iframe key={kind} src={url} title={t.frameTitle} className={styles.frame} loading="lazy" />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.ring} aria-hidden="true" />
              <p className="m-0 text-[18px] font-medium">{t.placeholderTitle}</p>
              <p className="m-0 max-w-[340px] text-[14px] leading-[1.6] text-body">{t.placeholderBody}</p>
              <a href={`mailto:hello@ryvodigital.com?subject=${encodeURIComponent(t.kinds[kind])}`} className="btn mt-2">
                {t.placeholderCta}
                <span className="btn-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
