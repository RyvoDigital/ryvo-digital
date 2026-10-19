import s from "./AutomationsPage.module.css";

// The five spreads' own index: a quiet pill, bottom centre, wide screens only.
// It is in range only over the spreads and never carries the site's
// navigation or Book (the floating pill does, as on every page). The active
// index and the progress line are set by AutomationsPage's ScrollTriggers (no
// state, no re-render). Out of range it is inert, so Tab never lands in it
// while it is hidden.
export default function Dock({ names, label }: { names: string[]; label: string }) {
  return (
    <nav className={s.dock} aria-label={label} data-dock data-show="false" inert>
      <ol className={s.dockIdx}>
        {names.map((n, i) => (
          <li key={n}>
            <a href={`#a0${i + 1}`} className={s.dockLink} data-dock-link={i} aria-label={`0${i + 1} ${n}`}>0{i + 1}</a>
          </li>
        ))}
      </ol>
      <span className={s.dockProgress} aria-hidden="true"><span data-dock-progress /></span>
    </nav>
  );
}
