"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ArrowUpRight } from "./Icons";
import MobileMenu from "./MobileMenu";
import { navLinks } from "./nav-links";

// Past the notch, the nav lifts into a small centred glass pill. Within the hero
// it stays; after the hero it hides while scrolling down and returns on scroll up.
// Phones get RYVO + the menu button only.
export default function FloatingNav({ lang, t, bookHref }: { lang: Locale; t: Dictionary; bookHref: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    let lastY = scrollY;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const y = scrollY;
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight : 900;
      const pastNotch = y > 96;
      const inHero = y < heroEnd - 120;
      const down = y > lastY + 3, up = y < lastY - 3;
      lastY = y;
      setShow((prev) => (!pastNotch ? false : inHero ? true : down ? false : up ? true : prev));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  const links = navLinks(lang, t);
  return (
    <div className="floating-nav pointer-events-none fixed inset-x-0 top-[max(10px,env(safe-area-inset-top))] z-[65] flex justify-center px-3" data-show={show}>
      <nav
        aria-label={t.nav.main}
        aria-hidden={!show}
        inert={!show}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-[rgba(205,209,217,0.16)] bg-[rgba(19,20,24,0.66)] p-[5px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      >
        <Link href={`/${lang}`} className="px-3 text-[15px] font-bold tracking-[0.06em]" style={{ fontStretch: "125%" }}>RYVO</Link>
        <ul className="hidden items-center lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-[36px] items-center rounded-full px-[13px] text-[13px] text-body transition-colors duration-300 hover:bg-[rgba(241,242,244,0.06)] hover:text-text">{l.label}</Link>
            </li>
          ))}
        </ul>
        <a href={bookHref} className="ml-1 hidden min-h-[36px] items-center gap-2 rounded-full bg-text py-1 pl-[14px] pr-1 text-[13px] font-semibold text-obsidian lg:inline-flex">
          {t.nav.book}
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-obsidian text-text"><ArrowUpRight size={11} /></span>
        </a>
        <MobileMenu lang={lang} t={t} bookHref={bookHref} className="!h-9 !w-9 lg:hidden" />
      </nav>
    </div>
  );
}
