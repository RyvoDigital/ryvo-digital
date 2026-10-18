"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { startMotion } from "./motion";
import s from "./proof.module.css";

// Nine questions, hairline rows. Opening one never animates height: the layout
// changes once, then everything below it is moved back to where it was and
// glides into place on a transform (FLIP), while the answer fades up.
export default function Faq({ label, items }: { label: string; items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = useRef<HTMLDListElement>(null);

  const toggle = async (i: number) => {
    const root = list.current;
    if (!root) return;
    const m = await startMotion();
    const followers = [
      ...Array.from(root.querySelectorAll<HTMLElement>("[data-faq-row]")).filter((_, k) => k > i),
      ...Array.from(document.querySelectorAll<HTMLElement>("[data-after-faq]")),
    ];
    const before = followers.map((el) => el.getBoundingClientRect().top);
    const next = open === i ? null : i;
    // Commit the new layout now, so it can be measured in the same frame.
    flushSync(() => setOpen(next));
    {
      if (m.reduced) return;
      followers.forEach((el, k) => {
        const dy = before[k] - el.getBoundingClientRect().top;
        if (Math.abs(dy) < 0.5) return;
        m.gsap.fromTo(el, { y: dy }, { y: 0, duration: 0.7, ease: "expo.out", clearProps: "transform,willChange", onStart: () => { el.style.willChange = "transform"; } });
      });
      const ans = next === null ? null : root.querySelector<HTMLElement>(`[data-faq-answer="${next}"]`);
      if (ans) m.gsap.fromTo(ans, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", clearProps: "transform" });
    }
  };

  return (
    <section className={s.faq} aria-labelledby="faq-title" data-section="faq">
      <div className={s.faqHead}>
        <h2 id="faq-title" className={`display ${s.h2}`} data-reveal>{label.charAt(0) + label.slice(1).toLowerCase()}</h2>
      </div>
      <dl ref={list} className={s.faqList}>
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} className={s.faqRow} data-faq-row data-open={isOpen}>
              <dt>
                <button type="button" className={s.faqQ} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => toggle(i)}>
                  <span>{q}</span>
                  <span className={s.plus} aria-hidden="true" />
                </button>
              </dt>
              <dd id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={s.faqA} hidden={!isOpen} data-faq-answer={i}>
                <p>{a}</p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
