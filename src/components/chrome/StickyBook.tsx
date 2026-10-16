"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "./Icons";

// After the hero, a small glass "Book a call" pill waits bottom-centre.
// It steps aside over the booking section and the footer.
export default function StickyBook({ href, label }: { href: string; label: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const hideOver = Array.from(document.querySelectorAll("#book, footer"));
    const seen = new Set<Element>();
    const heroIo = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
    const hideIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setCovered(seen.size > 0);
    });
    if (hero) heroIo.observe(hero);
    hideOver.forEach((el) => hideIo.observe(el));
    return () => { heroIo.disconnect(); hideIo.disconnect(); };
  }, []);

  const show = pastHero && !covered;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-50 flex justify-center transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]"
      style={{ opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px)" }}
    >
      <a
        href={href}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className="pointer-events-auto flex min-h-[46px] items-center gap-[10px] rounded-full border border-[rgba(205,209,217,0.18)] bg-[rgba(28,30,34,0.62)] py-1 pl-[18px] pr-1 text-[14px] font-semibold shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        style={{ pointerEvents: show ? "auto" : "none" }}
      >
        {label}
        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-text text-obsidian">
          <ArrowUpRight />
        </span>
      </a>
    </div>
  );
}
