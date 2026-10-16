import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import SiteFooter from "@/components/chrome/SiteFooter";
import StickyBook from "@/components/chrome/StickyBook";
import FloatingNav from "@/components/chrome/FloatingNav";

// Every inner page: its content, the footer, and the homepage's floating pill and
// phone "Book a call" button (both pointing at /book).
export default function PageFrame({ lang, t, bookHref, light = false, children }: { lang: Locale; t: Dictionary; bookHref: string; light?: boolean; children: ReactNode }) {
  return (
    <>
      <div className={`relative ${light ? "theme-light" : ""}`}>
        {children}
        <SiteFooter lang={lang} t={t} />
      </div>
      <FloatingNav lang={lang} t={t} bookHref={bookHref} />
      <StickyBook href={bookHref} label={t.pill.book} />
    </>
  );
}
