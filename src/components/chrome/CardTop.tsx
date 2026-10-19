import type { ReactNode } from "react";
import ArtPicture from "@/components/home/ArtPicture";
import HeroPreload from "@/components/home/HeroPreload";
import hs from "@/components/home/Hero.module.css";
import s from "./CardTop.module.css";

// The homepage hero card's top edge, for the inner pages' navbar: the same card
// box (size, radius, hairline), the same photo and scrim that light it, shown
// down to just under the bar and fading out there. Built from the hero's own
// classes, so it is the homepage's at every size. On its own (NavFrame) it
// carries the bar as children; inside a card of the same box (PageHero) it is
// laid over that card's top. Light tone for the websites side: the same
// surface, lightened.
export default function CardTop({ tone = "dark", inCard = false, children }: { tone?: "dark" | "light"; inCard?: boolean; children?: ReactNode }) {
  return (
    <div className={`${s.strip} ${inCard ? s.inCard : ""}`} data-tone={tone} aria-hidden={children ? undefined : true}>
      {/* The photo with the first paint, as on the homepage (the same files). */}
      <HeroPreload />
      <div className={`${hs.card} ${s.card}`}>
        <div className={s.surface} aria-hidden="true">
          <div className={`${hs.art} ${hs.artBg}`}>
            <ArtPicture which="bg" className={hs.artImg} priority />
          </div>
          <div className={hs.scrim} />
        </div>
        {children}
      </div>
    </div>
  );
}
