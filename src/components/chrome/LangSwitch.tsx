"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/i18n/config";

// Keeps the visitor on the same page when switching language: the path is read
// here, so every switch (the bar, the phone menu, the pill's menu) agrees.
// With fold, the other languages fold away while the hero notch is open.
export default function LangSwitch({ lang, label, className = "", fold = false }: { lang: Locale; label: string; className?: string; fold?: boolean }) {
  const path = (usePathname() ?? "").replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (
    <nav aria-label={label} className={`font-mono text-[12px] text-steel ${className}`}>
      {LOCALES.map((l, i) => {
        const sep = i > 0 && <span aria-hidden="true"> · </span>;
        const item = (
          <>
          {fold && l === lang ? sep && <span className="fold"><span>{sep}</span></span> : sep}
          <Link
            href={`/${l}${path}`}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center px-1 uppercase transition-colors duration-300 hover:text-text lg:min-h-0 ${l === lang ? "text-text" : ""}`}
          >
            {l}
          </Link>
          </>
        );
        return fold && l !== lang
          ? <span key={l} className="fold"><span>{item}</span></span>
          : <span key={l}>{item}</span>;
      })}
    </nav>
  );
}
