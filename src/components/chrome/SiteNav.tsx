import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import LangSwitch from "./LangSwitch";
import { BookButton } from "./Icons";
import MobileMenu from "./MobileMenu";
import { navLinks } from "./nav-links";

// Top bar. On the homepage the four links live in the hero card's notch
// where it fits, and inline below that (linksClassName says where they show);
// elsewhere they sit inline.
export default function SiteNav({ lang, t, bookHref, path = "", inlineLinks = true, linksClassName = "lg:flex", fold = false, logoClassName = "" }: { lang: Locale; t: Dictionary; bookHref: string; path?: string; inlineLinks?: boolean; linksClassName?: string; fold?: boolean; logoClassName?: string }) {
  const links = navLinks(lang, t);
  return (
    <nav aria-label={t.nav.main} className="relative z-10 flex items-center justify-between">
      <Link href={`/${lang}`} className={`text-[17px] font-bold tracking-[0.06em] lg:text-[20px] ${logoClassName}`} style={{ fontStretch: "125%" }}>
        {fold ? <>R<span className="fold"><span>YVO</span></span></> : "RYVO"}
      </Link>
      {inlineLinks && (
        <ul className={`hidden items-center gap-[24px] text-[14px] xl:gap-[34px] ${linksClassName}`}>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-body transition-colors duration-300 hover:text-text">{l.label}</Link>
            </li>
          ))}
        </ul>
      )}
      <div className="hidden items-center gap-[18px] lg:flex">
        <LangSwitch lang={lang} path={path} label={t.nav.language} fold={fold} />
        <BookButton href={bookHref} label={t.nav.book} fold={fold} className="!min-h-[34px] !py-1 !pl-[14px] !pr-1 !text-[13px] [&_.btn-arrow]:!h-[26px] [&_.btn-arrow]:!w-[26px]" />
      </div>
      <MobileMenu lang={lang} t={t} bookHref={bookHref} path={path} className="lg:hidden" />
    </nav>
  );
}
