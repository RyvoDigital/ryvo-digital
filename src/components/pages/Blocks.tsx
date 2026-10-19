import type { ReactNode } from "react";
import { BookButton } from "@/components/chrome/Icons";
import Reveal from "./Reveal";
import s from "./Pages.module.css";

// The closing call to action: a glass panel with one button.
export function CtaBand({ label, title, body, href, button, extra }: { label: string; title: string[]; body: ReactNode; href: string; button: string; extra?: ReactNode }) {
  return (
    <section className={s.section} aria-labelledby="cta-title">
      <Reveal className={`${s.inner} ${s.glass} ${s.cta}`}>
        <div className={s.ctaCopy}>
          <span className="mono-label">{label}</span>
          <h2 id="cta-title" className={`display ${s.h2}`}>{title.map((l, i) => <span key={i} className={`block ${i ? s.dim : ""}`}>{l}</span>)}</h2>
          <p className={s.lead}>{body}</p>
        </div>
        <div className={s.ctaAct}>
          <BookButton href={href} label={button} />
          {extra}
        </div>
      </Reveal>
    </section>
  );
}
