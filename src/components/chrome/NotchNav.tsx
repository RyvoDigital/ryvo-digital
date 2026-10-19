"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NavIcon, type NavIconName } from "./Icons";
import { NOTCH, capPath } from "./notch";
import styles from "@/components/home/Hero.module.css";
import o from "./NotchOutline.module.css";

// The four links in the hero card's notch, as icons. Hovering the notch, or
// focusing a link with the keyboard, opens it: the notch widens and each icon
// slides open into icon + label, while the card's top row folds away (RYVO → R,
// the language switch → the current one, Book → a round arrow). One calm motion,
// all CSS transitions on one width (--W) measured here; it reverses on leave.
export default function NotchNav({ links, label, outline = false }: { links: { href: string; label: string; icon: NavIconName }[]; label: string; outline?: boolean }) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    const hero = el?.closest<HTMLElement>("[data-notch-root]");
    if (!el || !hero) return;
    let leave = 0;
    const set = (open: boolean) => { window.clearTimeout(leave); hero.dataset.navOpen = String(open); };

    // The notch's real widths, closed and open, from the links themselves.
    const measure = () => {
      hero.dataset.navMeasure = "closed";
      const closed = el.offsetWidth;
      hero.dataset.navMeasure = "open";
      const open = el.offsetWidth;
      delete hero.dataset.navMeasure;
      hero.style.setProperty("--W-closed", `${closed + 2 * NOTCH.r}px`);
      hero.style.setProperty("--W-open", `${open + 2 * NOTCH.r}px`);
    };
    measure();
    document.fonts?.ready.then(measure);

    const onEnter = () => set(true);
    const onLeave = () => { window.clearTimeout(leave); leave = window.setTimeout(() => { if (!el.contains(document.activeElement)) hero.dataset.navOpen = "false"; }, 140); };
    const onFocusIn = () => { if (el.matches(":focus-within") && document.activeElement?.matches(":focus-visible")) set(true); };
    const onFocusOut = (e: FocusEvent) => { if (!el.contains(e.relatedTarget as Node)) set(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { set(false); (document.activeElement as HTMLElement | null)?.blur(); } };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(leave);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <nav ref={nav} aria-label={label} className={styles.notchNav}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.notchLink} aria-label={l.label}>
            <NavIcon name={l.icon} />
            <span className={styles.notchLabel} aria-hidden="true"><span>{l.label}</span></span>
          </Link>
        ))}
      </nav>
      {/* The notch itself: the page colour laid over the card's top centre, in
          three overlapping pieces (two rounded caps and a middle) that follow --W.
          Opaque and overlapping, so no seam can show between them. */}
      <svg aria-hidden="true" className={`${styles.notchFill} ${styles.fillL}`} width={2 * NOTCH.r} height={NOTCH.h} viewBox={`0 0 ${2 * NOTCH.r} ${NOTCH.h}`}>
        <path d={capPath("left", true)} />
      </svg>
      <span aria-hidden="true" className={`${styles.notchFill} ${styles.fillM}`} />
      <svg aria-hidden="true" className={`${styles.notchFill} ${styles.fillR}`} width={2 * NOTCH.r} height={NOTCH.h} viewBox={`0 0 ${2 * NOTCH.r} ${NOTCH.h}`}>
        <path d={capPath("right", true)} />
      </svg>
      {/* Inner pages: the notch's outline, where the card around it is the
          page's own tone (NotchOutline.module.css). */}
      {outline && (
        <>
          <svg aria-hidden="true" className={`${styles.notchFill} ${styles.fillL} ${o.cap} ${o.capL}`} width={2 * NOTCH.r} height={NOTCH.h} viewBox={`0 0 ${2 * NOTCH.r} ${NOTCH.h}`}>
            <path d={capPath("left", false)} />
          </svg>
          <span aria-hidden="true" className={`${styles.notchFill} ${o.mid}`} />
          <svg aria-hidden="true" className={`${styles.notchFill} ${styles.fillR} ${o.cap} ${o.capR}`} width={2 * NOTCH.r} height={NOTCH.h} viewBox={`0 0 ${2 * NOTCH.r} ${NOTCH.h}`}>
            <path d={capPath("right", false)} />
          </svg>
        </>
      )}
    </>
  );
}
