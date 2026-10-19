"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { BookButton } from "@/components/chrome/Icons";
import { startMotion } from "./motion";
import q from "./Faq.module.css";

// Questions: a sticky column (the heading, one line, Book a call) beside the
// nine numbered questions. Opening one never animates height: the layout
// changes once, then everything below it is moved back to where it was and
// glides into place on a transform (FLIP), while the answer panel rises in.
export default function Faq({ label, items, line, book, bookHref }: { label: string; items: [string, string][]; line: string; book: string; bookHref: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = useRef<HTMLOListElement>(null);

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
    if (m.reduced) return;
    followers.forEach((el, k) => {
      const dy = before[k] - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) return;
      m.gsap.fromTo(el, { y: dy }, { y: 0, duration: 0.75, ease: "expo.out", clearProps: "transform,willChange", onStart: () => { el.style.willChange = "transform"; } });
    });
    const panel = next === null ? null : root.querySelector<HTMLElement>(`[data-faq-answer="${next}"]`);
    if (panel) m.gsap.fromTo(panel, { opacity: 0, y: -10, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out", clearProps: "transform" });
  };

  const title = label.charAt(0) + label.slice(1).toLowerCase();
  return (
    <section className={q.faq} aria-labelledby="faq-title" data-section="faq">
      <div className={q.side}>
        <div className={q.sticky}>
          <span className="mono-label" data-reveal>{String(items.length).padStart(2, "0")} · {label}</span>
          <h2 id="faq-title" className={`display ${q.h2}`} data-reveal>{title}</h2>
          <p className={q.line} data-reveal>{line}</p>
          <div data-reveal><BookButton href={bookHref} label={book} /></div>
        </div>
      </div>
      <ol ref={list} className={q.list}>
        {items.map(([question, answer], i) => {
          const isOpen = open === i;
          return (
            <li key={question} className={q.row} data-faq-row data-open={isOpen} data-reveal>
              <h3 className={q.qh}>
                <button type="button" className={q.q} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => toggle(i)}>
                  <span className={q.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={q.qText}>{question}</span>
                  <span className={q.plus} aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={q.answer} hidden={!isOpen} data-faq-answer={i}>
                <p>{answer}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
