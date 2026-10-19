"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "./Icons";

// Phones only (on desktop the floating nav pill carries "Book"). After the hero,
// a small glass "Book a call" pill waits bottom-centre. It steps
// aside over the booking section and the footer and while anyone is typing in
// the calculator. On phones it also hides while scrolling down (back on scroll
// up) and never sits over an open row or a chat ([data-no-pill]).
export default function StickyBook({ href, label }: { href: string; label: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);
  const [typing, setTyping] = useState(false);
  const [phoneHide, setPhoneHide] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const hideOver = Array.from(document.querySelectorAll(phone ? "#book, footer, [data-calc]" : "#book, footer"));
    const seen = new Set<Element>();
    const heroIo = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
    const hideIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setCovered(seen.size > 0);
    });
    if (hero) heroIo.observe(hero);
    hideOver.forEach((el) => hideIo.observe(el));

    // Phones: direction (every frame, cheap) + what lies under the pill. The
    // hit test (elementsFromPoint) is the costly part on a phone, so it runs
    // at most every 120 ms and once more when the scroll stops; the pill
    // takes 700 ms to fade anyway.
    let lastY = scrollY;
    let raf = 0, lastHit = 0, under = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const hit = () => {
      lastHit = performance.now();
      const px = innerWidth / 2, py = innerHeight - 40;
      under = document.elementsFromPoint(px, py).some((el) => el.closest("[data-no-pill]") && !el.closest("[data-sticky-book]"));
    };
    const check = () => {
      raf = 0;
      if (!phone) return;
      const y = scrollY;
      const down = y > lastY + 2;
      const up = y < lastY - 2;
      lastY = y;
      if (performance.now() - lastHit > 120) hit();
      setPhoneHide((prev) => (under ? true : down ? true : up ? false : prev));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
      clearTimeout(settle);
      settle = setTimeout(() => { if (!phone) return; hit(); setPhoneHide((prev) => (under ? true : prev)); }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const inCalc = (el: EventTarget | null) => el instanceof HTMLElement && !!el.closest("[data-calc]") && el.tagName === "INPUT";
    const onIn = (e: FocusEvent) => inCalc(e.target) && setTyping(true);
    const onOut = (e: FocusEvent) => inCalc(e.target) && !inCalc(e.relatedTarget) && setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);

    return () => {
      heroIo.disconnect();
      hideIo.disconnect();
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, []);

  const show = pastHero && !covered && !typing && !phoneHide;
  return (
    <div
      data-sticky-book
      className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-50 flex justify-center lg:hidden transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]"
      style={{ opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px)" }}
    >
      <a
        href={href}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className="flex min-h-[46px] items-center gap-[10px] rounded-full border border-[rgba(205,209,217,0.18)] bg-[rgba(28,30,34,0.62)] py-1 pl-[18px] pr-1 text-[14px] font-semibold shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
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
