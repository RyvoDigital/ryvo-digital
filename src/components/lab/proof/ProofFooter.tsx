"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { LEGAL } from "@/components/chrome/SiteFooter";
import { BookButton } from "@/components/chrome/Icons";
import { navLinks } from "@/components/chrome/nav-links";
import { startMotion } from "./motion";
import s from "./footer.module.css";

// The footer: the mercury horizon (Manuel's pick, round 4). The email as large
// type above a living line of liquid mercury that runs the width of the page;
// below it a small chrome RYVO, the pages, the language switch and the local
// time in Lisbon and Madrid. The email can be copied in one tap. No back-to-top
// button and no LinkedIn. The legal block is the landing page's own, unchanged
// (the same LEGAL text and the same privacy and terms links).

const MAIL = "hello@ryvodigital.com";
const lang = "en";

function Clocks() {
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
      {([["Lisbon", "Europe/Lisbon"], ["Madrid", "Europe/Madrid"]] as const).map(([city, tz]) => (
        <div key={city} className={s.clock}>
          <dt className={s.colLabel}>{city}</dt>
          <dd><time className={s.time} suppressHydrationWarning>{at(tz)}</time></dd>
        </div>
      ))}
    </dl>
  );
}

function Mail({ big }: { big?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(MAIL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* the link still works */ }
  };
  return (
    <span className={`${s.mailRow} ${big ? s.mailBig : ""}`}>
      <a href={`mailto:${MAIL}`} className={s.mail} data-footer-mail>{MAIL}</a>
      <button type="button" className={s.copy} onClick={copy} aria-label="Copy the email address" data-copied={copied}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          {copied
            ? <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            : <><rect x="5" y="5" width="8.5" height="8.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10h.3" fill="none" stroke="currentColor" strokeWidth="1.4" /></>}
        </svg>
      </button>
      <span className={s.copied} role="status" aria-live="polite">{copied ? "Copied" : ""}</span>
    </span>
  );
}

function Columns({ t }: { t: Dictionary }) {
  return (
    <nav className={s.cols} aria-label="Footer">
      <div className={s.col}>
        <span className={s.colLabel}>Pages</span>
        <ul>{navLinks(lang, t).map((l) => <li key={l.href}><Link href={l.href} className={s.link}>{l.label}</Link></li>)}</ul>
      </div>
      <div className={s.col}>
        <span className={s.colLabel}>Language</span>
        <ul className={s.langs}>
          {(["en", "pt", "es"] as const).map((l) => <li key={l}><Link href={`/${l}/automations`} className={s.link} aria-current={l === lang ? "true" : undefined}>{l.toUpperCase()}</Link></li>)}
        </ul>
      </div>
    </nav>
  );
}

function Legal() {
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

export default function ProofFooter({ t, place, bookHref }: { t: Dictionary; place: string; bookHref: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    startMotion().then((m) => {
      if (cancelled) return;
      const { gsap, ScrollTrigger, reduced } = m;
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
        ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)) });
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
          <span className={s.colLabel}>Contact</span>
          <span className={s.mailMask}><span className={s.mailRise} data-mail-rise><Mail big /></span></span>
          <div className={s.cta}><BookButton href={bookHref} label={t.nav.book} /></div>
        </div>
      </div>
      <div className={s.horizon} data-horizon-wrap aria-hidden="true">
        <svg viewBox={`0 0 ${HW} ${HH}`} preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            <linearGradient id="hz-chrome" x1="0" x2="1" y1="0" y2="0" data-horizon-sheen>
              <stop offset="0" stopColor="#5d6168" />
              <stop offset="0.35" stopColor="#c8ccd3" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="0.65" stopColor="#c8ccd3" />
              <stop offset="1" stopColor="#5d6168" />
            </linearGradient>
            <linearGradient id="hz-pool" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(205,209,217,0.10)" />
              <stop offset="1" stopColor="rgba(205,209,217,0)" />
            </linearGradient>
            <linearGradient id="hz-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.88" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="hz-mask"><rect width={HW} height={HH} fill="url(#hz-fade)" /></mask>
            <filter id="hz-glow" x="-5%" y="-100%" width="110%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>
          <g mask="url(#hz-mask)">
            <path data-horizon-fill fill="url(#hz-pool)" />
            <path data-horizon fill="none" stroke="rgba(230,233,238,0.35)" strokeWidth="6" filter="url(#hz-glow)" vectorEffect="non-scaling-stroke" />
            <path data-horizon fill="none" stroke="url(#hz-chrome)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
      <div className={s.inner}>
        <div className={s.bRow}>
          <div className={s.brand}>
            <Link href={`/${lang}`} className={s.mark} aria-label="Ryvo Digital, home"><span className="chrome-text">RYVO</span></Link>
            <span className={s.place}>{place}</span>
          </div>
          <Columns t={t} />
          <Clocks />
        </div>
        <Legal />
      </div>
    </footer>
  );
}
