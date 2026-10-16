import Link from "next/link";
import { LOCALES, type Locale } from "@/i18n/config";

// Keeps the visitor on the same page when switching language.
export default function LangSwitch({ lang, path = "", label, className = "" }: { lang: Locale; path?: string; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={`font-mono text-[12px] text-steel ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          <Link
            href={`/${l}${path}`}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "page" : undefined}
            className={`inline-flex min-h-[44px] items-center px-1 uppercase transition-colors duration-300 hover:text-text lg:min-h-0 ${l === lang ? "text-text" : ""}`}
          >
            {l}
          </Link>
        </span>
      ))}
    </nav>
  );
}
