import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { navLinks } from "./nav-links";

// The legal block is today's text, word for word (Manuel, 16 Oct 2026). It stays
// in English in every language.
export const LEGAL = {
  copyright: "© 2026 Ryvo Digital",
  entity:
    "Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA · NIPC 513853847 · Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
  rights: "All rights reserved.",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

export default function SiteFooter({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <footer className="relative overflow-hidden px-5 pb-[30px] pt-6 md:px-6 md:pb-9 md:pt-10">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-[18px] md:gap-7">
        <div aria-hidden="true" className="chrome-text order-first select-none text-center text-[27vw] font-bold leading-[0.85] tracking-[-0.055em] md:order-none md:mt-2 md:text-[min(25.8vw,372px)] md:leading-[0.8]" style={{ fontStretch: "125%" }}>
          RYVO
        </div>
        <div className="flex flex-col gap-3 text-[14px] md:-order-1 md:flex-row md:items-center md:justify-between">
          <ul className="grid grid-cols-2 gap-x-3 md:flex md:gap-7">
            {navLinks(lang, t).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-[44px] items-center text-body transition-colors hover:text-text md:min-h-0">{l.label}</Link>
              </li>
            ))}
          </ul>
          <ul className="flex gap-7">
            <li><a href="https://www.linkedin.com/company/ryvodigital" className="inline-flex min-h-[44px] items-center text-body transition-colors hover:text-text md:min-h-0">LinkedIn</a></li>
            <li><a href="mailto:hello@ryvodigital.com" className="inline-flex min-h-[44px] items-center text-body transition-colors hover:text-text md:min-h-0">hello@ryvodigital.com</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-4 text-[11px] leading-[1.6] text-steel md:flex-row md:justify-between md:gap-5 md:pt-[22px] md:text-[12px]">
          <p className="m-0 max-w-[880px]">
            <span>{LEGAL.copyright}</span>
            <span className="block">{LEGAL.entity}</span>
            <span className="block">{LEGAL.rights}</span>
          </p>
          <span className="flex shrink-0 gap-5 text-[12px]">
            <Link href={`/${lang}/privacy-policy`} className="inline-flex min-h-[44px] items-center text-body underline-offset-4 hover:underline md:min-h-0">{LEGAL.privacy}</Link>
            <Link href={`/${lang}/terms-of-service`} className="inline-flex min-h-[44px] items-center text-body underline-offset-4 hover:underline md:min-h-0">{LEGAL.terms}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
