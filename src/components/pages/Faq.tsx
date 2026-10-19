"use client";

import { useState } from "react";
import { BookButton } from "@/components/chrome/Icons";
import Expander, { PlusMark } from "@/components/ui/Expander";
import q from "./Faq.module.css";

// Questions (/automations and /websites): a sticky column (the heading, one
// line, Book a call) beside the numbered questions. One answer opens at a time,
// on the site's expander. The ids are scoped by `id`, so two lists never clash.
export default function Faq({ id = "faq", label, items, line, book, bookHref }: { id?: string; label: string; items: [string, string][]; line: string; book: string; bookHref: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const title = label.charAt(0) + label.slice(1).toLowerCase();
  return (
    <section className={q.faq} aria-labelledby={`${id}-title`} data-section="faq">
      <div className={q.side}>
        <div className={q.sticky}>
          <span className="mono-label" data-reveal>{String(items.length).padStart(2, "0")} · {label}</span>
          <h2 id={`${id}-title`} className={`display ${q.h2}`} data-reveal>{title}</h2>
          <p className={q.line} data-reveal>{line}</p>
          <div data-reveal><BookButton href={bookHref} label={book} /></div>
        </div>
      </div>
      <ol className={q.list}>
        {items.map(([question, answer], i) => {
          const isOpen = open === i;
          return (
            <li key={question} className={q.row} data-open={isOpen} data-reveal>
              <h3 className={q.qh}>
                <button type="button" className={q.q} aria-expanded={isOpen} aria-controls={`${id}-a-${i}`} id={`${id}-q-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className={q.num}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={q.qText}>{question}</span>
                  <PlusMark open={isOpen} className={q.plus} />
                </button>
              </h3>
              <Expander open={isOpen} id={`${id}-a-${i}`} labelledBy={`${id}-q-${i}`}>
                <div className={q.answer}><p>{answer}</p></div>
              </Expander>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
