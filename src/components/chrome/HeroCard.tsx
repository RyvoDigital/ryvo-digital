import type { ReactNode } from "react";
import hs from "@/components/home/Hero.module.css";
import s from "./HeroCard.module.css";

// An inner page's hero, in a card of the homepage card's geometry: the same
// inset from the screen, radius and hairline edge, one even tone throughout,
// with NavFrame's bar laid over its top, so the bar and the hero are one
// object. The hero's content keeps its own layout; inside the card --pad is
// the card's inner padding (the homepage's: 18 px on phones, 32 on tablets,
// 44 on wide screens). Light tone for the websites side.
export default function HeroCard({ tone = "dark", children }: { tone?: "dark" | "light"; children: ReactNode }) {
  return (
    <div className={`${hs.wrap} ${s.wrap}`}>
      <div className={s.card} data-tone={tone} data-hero-card>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
}
