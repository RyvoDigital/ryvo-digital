import type { ReactNode } from "react";
import hs from "@/components/home/Hero.module.css";
import s from "./CardTop.module.css";

// The homepage hero card's box, for the inner pages' navbar (NavFrame): the bar
// sits in it at the homepage card's coordinates (Hero.module.css .card: size,
// insets, container units), so it is placed and folds exactly as there. It
// draws nothing: the page's own card under it (HeroCard, PageHero) is the
// surface, one even tone with its hairline edge.
export default function CardTop({ children }: { children: ReactNode }) {
  return (
    <div className={s.strip}>
      <div className={`${hs.card} ${s.card}`}>{children}</div>
    </div>
  );
}
