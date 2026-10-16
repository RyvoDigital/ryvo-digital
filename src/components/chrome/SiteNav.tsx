"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import LangSwitch from "./LangSwitch";
import { BookButton } from "./Icons";
import { navLinks } from "./nav-links";

export default function SiteNav({ lang, t, bookHref, path = "" }: { lang: Locale; t: Dictionary; bookHref: string; path?: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const links = navLinks(lang, t);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current!;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>("a, button"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <nav aria-label={t.nav.main} className="relative z-10 flex items-center justify-between">
        <Link href={`/${lang}`} className="text-[17px] font-bold tracking-[0.06em] lg:text-[20px]" style={{ fontStretch: "125%" }}>
          RYVO
        </Link>
        <ul className="hidden items-center gap-[34px] text-[14px] lg:flex">
          {links.map((l, i) => (
            <li key={l.href}>
              <Link href={l.href} className={`transition-colors duration-300 hover:text-text ${i === 0 ? "text-text" : "text-body"}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-[18px] lg:flex">
          <LangSwitch lang={lang} path={path} label={t.nav.language} />
          <BookButton href={bookHref} label={t.nav.book} className="!min-h-[34px] !py-1 !pl-[14px] !pr-1 !text-[13px] [&_.btn-arrow]:!h-[26px] [&_.btn-arrow]:!w-[26px]" />
        </div>
        <button
          ref={buttonRef}
          type="button"
          aria-label={t.nav.menu}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-[rgba(241,242,244,0.04)] lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 9h16" />
            <path d="M4 15h16" />
          </svg>
        </button>
      </nav>

      <div
        id="site-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.main}
        hidden={!open}
        className="fixed inset-0 z-[70] flex flex-col bg-page/95 px-[18px] pb-8 pt-[22px] backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold tracking-[0.06em]" style={{ fontStretch: "125%" }}>RYVO</span>
          <button type="button" aria-label={t.nav.close} onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>
        </div>
        <ol className="mt-14 flex flex-col">
          {links.map((l, i) => (
            <li key={l.href} className="border-t border-line last:border-b">
              <Link href={l.href} onClick={() => setOpen(false)} className="flex min-h-[64px] items-baseline gap-4 py-4">
                <span className="font-mono text-[11px] text-steel">[0{i + 1}]</span>
                <span className="display text-[34px]">{l.label}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-col gap-5">
          <LangSwitch lang={lang} path={path} label={t.nav.language} className="text-[13px]" />
          <BookButton href={bookHref} label={t.nav.book} className="w-full !pl-5" />
        </div>
      </div>
    </>
  );
}
