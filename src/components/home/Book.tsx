"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { ArrowUpRight } from "@/components/chrome/Icons";
import styles from "./Book.module.css";

// Two Google Calendar appointment schedules (automations call / website project),
// embedded inline in Google's embed form (?gv=true). If the embed has not loaded
// within a few seconds, a clean button opens the booking page in a new tab.
// Set in .env.local and in Vercel: NEXT_PUBLIC_BOOKING_URL_* (short links) and
// NEXT_PUBLIC_BOOKING_EMBED_* (the resolved calendar.google.com embed URLs).
const LINKS = [process.env.NEXT_PUBLIC_BOOKING_URL_AUTOMATIONS, process.env.NEXT_PUBLIC_BOOKING_URL_WEBSITES];
const EMBEDS = [process.env.NEXT_PUBLIC_BOOKING_EMBED_AUTOMATIONS, process.env.NEXT_PUBLIC_BOOKING_EMBED_WEBSITES];
const LOAD_TIMEOUT = 8000;

export default function Book({ t, initial = 0 }: { t: Dictionary["book"]; initial?: 0 | 1 }) {
  const [kind, setKind] = useState<0 | 1>(initial);
  const [near, setNear] = useState(false);
  const [state, setState] = useState<Record<number, "loading" | "ready" | "failed">>({});
  const panel = useRef<HTMLDivElement>(null);
  const link = LINKS[kind];
  const embed = EMBEDS[kind];
  const status = state[kind] ?? "loading";

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "800px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // If the frame has not loaded in time, fall back to the button.
  useEffect(() => {
    if (!near || !embed || status !== "loading") return;
    const id = window.setTimeout(() => setState((s) => (s[kind] === "ready" ? s : { ...s, [kind]: "failed" })), LOAD_TIMEOUT);
    return () => clearTimeout(id);
  }, [near, embed, kind, status]);

  const button = link && (
    <a href={link} target="_blank" rel="noopener noreferrer" className="btn">
      {t.open}
      <span className="btn-arrow"><ArrowUpRight /></span>
    </a>
  );

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

          {embed && status !== "failed" ? (
            <>
              <div className={styles.frameWrap} data-ready={status === "ready"}>
                {near && (
                  <iframe
                    key={kind}
                    src={embed}
                    title={t.frameTitle}
                    className={styles.frame}
                    onLoad={() => setState((s) => ({ ...s, [kind]: "ready" }))}
                  />
                )}
              </div>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="self-center text-[12px] text-steel underline-offset-4 hover:text-text hover:underline">
                  {t.newTab}
                </a>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.ring} aria-hidden="true" />
              {link ? (
                <>
                  <p className="m-0 text-[18px] font-medium">{t.frameTitle}</p>
                  {button}
                </>
              ) : (
                <>
                  <p className="m-0 text-[18px] font-medium">{t.placeholderTitle}</p>
                  <p className="m-0 max-w-[340px] text-[14px] leading-[1.6] text-body">{t.placeholderBody}</p>
                  <a href={`mailto:hello@ryvodigital.com?subject=${encodeURIComponent(t.kinds[kind])}`} className="btn mt-2">
                    {t.placeholderCta}
                    <span className="btn-arrow"><ArrowUpRight /></span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
