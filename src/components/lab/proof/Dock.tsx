import { BookButton } from "@/components/chrome/Icons";
import s from "./proof.module.css";

// The section dock: a calm solid pill, bottom centre. It shows after the hero
// and hides over the closing call to action. The active index and the
// progress line are set by ProofPage's ScrollTriggers (no state, no re-render).
export default function Dock({ names, bookHref, book }: { names: string[]; bookHref: string; book: string }) {
  return (
    <nav className={s.dock} aria-label="Sections" data-dock data-show="false">
      <ol className={s.dockIdx}>
        {names.map((n, i) => (
          <li key={n}>
            <a href={`#a0${i + 1}`} className={s.dockLink} data-dock-link={i} aria-label={`0${i + 1} ${n}`}>0{i + 1}</a>
          </li>
        ))}
      </ol>
      <BookButton href={bookHref} label={book} className={s.dockBook} />
      <span className={s.dockProgress} aria-hidden="true"><span data-dock-progress /></span>
    </nav>
  );
}
