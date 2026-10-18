import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { LEGAL } from "@/components/chrome/SiteFooter";
import { BookButton } from "@/components/chrome/Icons";
import { navLinks } from "@/components/chrome/nav-links";
import s from "./footer.module.css";

// A new footer for this page, for Manuel to compare with the landing page's:
// a refined wordmark instead of the giant one, a composed three-column layout,
// and one motion moment (a hairline draws from the centre, the four letters
// rise, a single glint crosses the wordmark). The legal block is the site's own
// text and links, unchanged (LEGAL from SiteFooter).
export default function ProofFooter({ t, place, bookHref }: { t: Dictionary; place: string; bookHref: string }) {
  const lang = "en";
  return (
    <footer className={s.footer} data-footer>
      <div className={s.inner}>
        <div className={s.top}>
          <div className={s.brand}>
            <Link href={`/${lang}`} className={s.mark} aria-label="Ryvo Digital, home" data-footer-mark>
              {"RYVO".split("").map((ch, i) => <span key={i} className={s.letterMask}><span className={s.letter} data-footer-letter>{ch}</span></span>)}
              <span className={s.glint} data-footer-glint aria-hidden="true">RYVO</span>
            </Link>
            <span className={s.place}>{place}</span>
          </div>
          <div className={s.cta}>
            <BookButton href={bookHref} label={t.nav.book} />
            <a href="mailto:hello@ryvodigital.com" className={s.mail}>hello@ryvodigital.com</a>
          </div>
        </div>

        <span className={s.rule} data-footer-rule aria-hidden="true" />

        <nav className={s.cols} aria-label="Footer">
          <div className={s.col}>
            <span className={s.colLabel}>Pages</span>
            <ul>{navLinks(lang, t).map((l) => <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>)}</ul>
          </div>
          <div className={s.col}>
            <span className={s.colLabel}>Contact</span>
            <ul>
              <li><a href="mailto:hello@ryvodigital.com" className={s.link}>hello@ryvodigital.com</a></li>
              <li><a href="https://www.linkedin.com/company/ryvodigital" className={s.link}>LinkedIn</a></li>
            </ul>
          </div>
          <div className={s.col}>
            <span className={s.colLabel}>Language</span>
            <ul className={s.langs}>
              {(["en", "pt", "es"] as const).map((l) => <li key={l}><Link href={`/${l}/automations`} className={s.link} aria-current={l === lang ? "true" : undefined}>{l.toUpperCase()}</Link></li>)}
            </ul>
          </div>
          <a href="#top" className={s.up} aria-label="Back to the top">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          </a>
        </nav>

        <div className={s.legal}>
          <p className={s.legalText}>
            <span>{LEGAL.copyright}</span>
            <span className={s.block}>{LEGAL.entity}</span>
            <span className={s.block}>{LEGAL.rights}</span>
          </p>
          <span className={s.legalLinks}>
            <Link href={`/${lang}/privacy-policy`} className={s.legalLink}>{LEGAL.privacy}</Link>
            <Link href={`/${lang}/terms-of-service`} className={s.legalLink}>{LEGAL.terms}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
