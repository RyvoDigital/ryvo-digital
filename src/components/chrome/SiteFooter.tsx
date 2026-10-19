"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n";
import { LOCALES, type Locale } from "@/i18n/config";
import { loadMotion, prefersReducedMotion } from "@/lib/gsap";
import { BookButton } from "./Icons";
import { navLinks } from "./nav-links";
import s from "./SiteFooter.module.css";

// The site-wide footer: the mercury horizon (Manuel's footer b, round 4 of the
// /automations proof). The email as large type above a living line of liquid
// mercury that runs the width of the page; below it a small chrome RYVO, the
// pages, the language switch and the local time in Lisbon and Madrid. The
// email can be copied in one tap.
//
// The legal block is today's text, word for word (Manuel, 16 Oct 2026; the
// footer fixed on 28 Sep for Meta's business verification): the legal name,
// NIPC and address, the copyright and rights line, the contact email, the
// Privacy Policy and Terms of Service, and the LinkedIn page. It stays in
// English in every language.
export const LEGAL = {
  copyright: "© 2026 Ryvo Digital",
  entity:
    "Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA · NIPC 513853847 · Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
  rights: "All rights reserved.",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
};

const MAIL = "hello@ryvodigital.com";
const LINKEDIN = "https://www.linkedin.com/company/ryvodigital";
type F = Dictionary["footer"];

function Clocks({ cities }: { cities: F["cities"] }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Set after mount (the server's time zone is not the visitor's), then on
    // every new minute.
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  const at = (tz: string) => (now ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(now) : "--:--");
  return (
    <dl className={s.clocks}>
      {([[cities[0], "Europe/Lisbon"], [cities[1], "Europe/Madrid"]] as const).map(([city, tz]) => (
        <div key={city} className={s.clock}>
          <dt className={s.colLabel}>{city}</dt>
          <dd><time className={s.time} suppressHydrationWarning>{at(tz)}</time></dd>
        </div>
      ))}
    </dl>
  );
}

function Mail({ f, big }: { f: F; big?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(MAIL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* the link still works */ }
  };
  return (
    <span className={`${s.mailRow} ${big ? s.mailBig : ""}`}>
      <a href={`mailto:${MAIL}`} className={s.mail} data-footer-mail>{MAIL}</a>
      <button type="button" className={s.copy} onClick={copy} aria-label={f.copy} data-copied={copied}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          {copied
            ? <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            : <><rect x="5" y="5" width="8.5" height="8.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10h.3" fill="none" stroke="currentColor" strokeWidth="1.4" /></>}
        </svg>
      </button>
      <span className={s.copied} role="status" aria-live="polite">{copied ? f.copied : ""}</span>
    </span>
  );
}

function Columns({ lang, t }: { lang: Locale; t: Dictionary }) {
  // The language links keep the visitor on the same page.
  const rest = (usePathname() ?? `/${lang}`).replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return (
    <nav className={s.cols} aria-label={t.footer.nav}>
      <div className={s.col}>
        <span className={s.colLabel}>{t.footer.pages}</span>
        <ul>{navLinks(lang, t).map((l) => <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>)}</ul>
      </div>
      <div className={s.col}>
        <span className={s.colLabel}>{t.footer.language}</span>
        <ul className={s.langs}>
          {LOCALES.map((l) => <li key={l}><Link href={`/${l}${rest}`} className={s.link} hrefLang={l} aria-current={l === lang ? "true" : undefined}>{l.toUpperCase()}</Link></li>)}
        </ul>
      </div>
    </nav>
  );
}

function Legal({ lang }: { lang: Locale }) {
  return (
    <div className={s.legal}>
      <p className={s.legalText}>
        <span>{LEGAL.copyright}</span>
        <span className={s.block}>{LEGAL.entity}</span>
        <span className={s.block}>{LEGAL.rights}</span>
      </p>
      <span className={s.legalLinks}>
        <Link href={`/${lang}/privacy-policy`} className={s.legalLink}>{LEGAL.privacy}</Link>
        <Link href={`/${lang}/terms-of-service`} className={s.legalLink}>{LEGAL.terms}</Link>
        <a href={LINKEDIN} className={s.legalLink}>LinkedIn</a>
      </span>
    </div>
  );
}

// The mercury horizon: one line of liquid metal, slowly moving, drawn from
// gsap.ticker only while it is on screen (still under reduced motion).
const HW = 1440, HH = 90, HN = 72;
const horizon = (t: number) => {
  let d = "";
  for (let i = 0; i <= HN; i++) {
    const x = (i / HN) * HW, u = i / HN;
    const env = Math.sin(u * Math.PI); // calm at both ends
    const y = HH / 2 + env * (9 * Math.sin(u * 7.1 + t * 0.6) + 5 * Math.sin(u * 15.3 - t * 0.9) + 2.4 * Math.sin(u * 31 + t * 1.7));
    d += `${i ? " L" : "M"}${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return d;
};

export default function SiteFooter({ lang, t, bookHref }: { lang: Locale; t: Dictionary; bookHref?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    loadMotion().then((m) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger } = m;
      const reduced = prefersReducedMotion();
      const ctx = gsap.context(() => {
        const paths = Array.from(el.querySelectorAll<SVGPathElement>("[data-horizon]"));
        const fill = el.querySelector<SVGPathElement>("[data-horizon-fill]")!;
        const sheen = el.querySelector<SVGLinearGradientElement>("[data-horizon-sheen]")!;
        const draw = (time: number) => {
          const d = horizon(time);
          paths.forEach((p) => p.setAttribute("d", d));
          fill.setAttribute("d", `${d} L${HW} ${HH} L0 ${HH} Z`);
          sheen.setAttribute("gradientTransform", `translate(${((time * 0.05) % 1.6 - 0.8).toFixed(3)} 0)`);
        };
        draw(0);
        if (reduced) return;
        const tick = (time: number) => draw(time);
        // A block body, returning nothing: inside a gsap.context, a function a
        // callback returns is kept as a cleanup and called on revert, and
        // ticker.add returns the tick itself (it then drew a NaN path).
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (st) => { if (st.isActive) gsap.ticker.add(tick); else gsap.ticker.remove(tick); } });
        gsap.set("[data-mail-rise]", { yPercent: 105 });
        gsap.set("[data-horizon-wrap]", { clipPath: "inset(0 50% 0 50%)" });
        ScrollTrigger.create({
          trigger: el, start: "top 85%", once: true,
          onEnter: () => {
            gsap.to("[data-horizon-wrap]", { clipPath: "inset(0 0% 0 0%)", duration: 1.8, ease: "expo.inOut" });
            gsap.to("[data-mail-rise]", { yPercent: 0, duration: 1.4, ease: "expo.out", delay: 0.3 });
          },
        });
        cleanup = () => gsap.ticker.remove(tick);
      }, el);
      const prev = cleanup;
      cleanup = () => { prev?.(); ctx.revert(); };
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <footer ref={root} className={s.footer} data-footer>
      <div className={s.inner}>
        <div className={s.bTop}>
          <span className={s.colLabel}>{t.footer.contact}</span>
          <span className={s.mailMask}><span className={s.mailRise} data-mail-rise><Mail f={t.footer} big /></span></span>
          <div className={s.cta}><BookButton href={bookHref ?? `/${lang}/book`} label={t.nav.book} /></div>
        </div>
      </div>
      {/* Three layers in paint order: the pool, the glow, the chrome line. The
          glow's blur and the fade at both ends are CSS (a layer filter and a
          mask image), which the compositor applies on the GPU. As an SVG
          filter and mask they were re-rasterised on every frame of the moving
          line: a whole CPU core in Safari while the footer was on screen. */}
      <div className={s.horizon} data-horizon-wrap aria-hidden="true">
        <svg viewBox={`0 0 ${HW} ${HH}`} preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            <linearGradient id="hz-pool" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(205,209,217,0.10)" />
              <stop offset="1" stopColor="rgba(205,209,217,0)" />
            </linearGradient>
          </defs>
          <path data-horizon-fill fill="url(#hz-pool)" />
        </svg>
        <svg viewBox={`0 0 ${HW} ${HH}`} preserveAspectRatio="none" width="100%" height="100%" className={s.glow}>
          <path data-horizon fill="none" stroke="rgba(230,233,238,0.35)" strokeWidth="6" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg viewBox={`0 0 ${HW} ${HH}`} preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            <linearGradient id="hz-chrome" x1="0" x2="1" y1="0" y2="0" data-horizon-sheen>
              <stop offset="0" stopColor="#5d6168" />
              <stop offset="0.35" stopColor="#c8ccd3" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="0.65" stopColor="#c8ccd3" />
              <stop offset="1" stopColor="#5d6168" />
            </linearGradient>
          </defs>
          <path data-horizon fill="none" stroke="url(#hz-chrome)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className={s.inner}>
        <div className={s.bRow}>
          <div className={s.brand}>
            <Link href={`/${lang}`} className={s.mark} aria-label={t.footer.home}><span className="chrome-text">RYVO</span></Link>
            <span className={s.place}>{t.footer.place}</span>
          </div>
          <Columns lang={lang} t={t} />
          <Clocks cities={t.footer.cities} />
        </div>
        <Legal lang={lang} />
      </div>
    </footer>
  );
}
