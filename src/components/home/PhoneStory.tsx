"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import styles from "./PhoneStory.module.css";

// The phone screen tells the whole story, on the agency's phone, as a seamless
// ~14 s loop (GSAP): a new enquiry arrives at 23:47 → its language is detected →
// the AI reply writes itself → free times from the calendar appear, the buyer
// picks one and it snaps in → "Viewing booked" forms → the handover card for the
// consultant lifts off and flies out of the phone to the "Viewing booked" chip.
// Only while on screen. Reduced motion (or no script): the final frame, still.

const LANGS = ["PT", "EN", "ES", "FR", "DE"] as const;

type Props = {
  chat: Dictionary["hero"]["chat"];
  story: Dictionary["hero"]["story"];
  langCode: "PT" | "EN" | "ES";
  slotShort: string; // e.g. "Thu 22 Oct"
};

export default function PhoneStory({ chat, story, langCode, slotShort }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const words = chat.a1.split(/(\s+)/);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let tl: gsap.core.Timeline | null = null;
    let onScreen = false;
    const run = () => { if (!tl) return; if (onScreen && !document.hidden && el.offsetParent) tl.play(); else tl.pause(); };
    const stop = withMotion(({ gsap }) => {
      if (!el.offsetParent) return; // the other layout's phone: stays still
      const q = gsap.utils.selector(el);
      const one = (s: string) => q(`[data-s="${s}"]`)[0] as HTMLElement;
      const stack = one("stack"), view = one("view");
      const hero = el.closest<HTMLElement>("[data-hero]");
      const chip = hero?.querySelector<HTMLElement>("[data-chip]");
      const fly = hero?.querySelector<HTMLElement>("[data-fly]");

      // Keep the newest line in view: the earlier ones glide up.
      const scrollTo = (s: string) => Math.min(0, view.clientHeight - (one(s).offsetTop + one(s).offsetHeight + 14));
      const chips = q("[data-chip-lang]") as HTMLElement[];
      const lock = Math.max(0, LANGS.indexOf(langCode));
      const chipX = (i: number) => chips[i].offsetLeft;
      const items = ["b1", "lang", "a1", "slots", "b2", "booked", "hand"].map(one);
      const check = one("check") as unknown as SVGPathElement;
      const len = check.getTotalLength();

      const ctx = gsap.context(() => {
        tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power3.out" } });
        // 0 · the lock screen at 23:47 (reset for every loop)
        tl.set(one("lock"), { autoAlpha: 1, y: 0, filter: "blur(0px)" }, 0)
          .set(one("notif"), { autoAlpha: 0, y: -36, scale: 0.94, filter: "blur(6px)" }, 0)
          .set(one("thread"), { autoAlpha: 0 }, 0)
          .set(stack, { y: 0 }, 0)
          .set(items, { autoAlpha: 0, y: 12, scale: 0.94 }, 0)
          .set(q("[data-word]"), { opacity: 0, y: 3 }, 0)
          .set(one("dots"), { autoAlpha: 0 }, 0)
          .set(one("hl"), { autoAlpha: 0, x: chipX(0) }, 0)
          .set(chips, { attr: { "data-on": "false" } }, 0)
          .set(q("[data-pill]"), { autoAlpha: 0, y: 8, attr: { "data-on": "false" } }, 0)
          .set(check, { strokeDasharray: len, strokeDashoffset: len }, 0)
          .set(q("[data-row]"), { autoAlpha: 0, x: -8 }, 0)
          .set(one("hand"), { x: 0, rotate: 0 }, 0);

        // 0.5 · a new enquiry drops in
        tl.to(one("notif"), { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.95, ease: "expo.out" }, 0.5);
        // 1.8 · it opens into the conversation
        tl.to(one("lock"), { autoAlpha: 0, y: -40, filter: "blur(6px)", duration: 0.7, ease: "power2.in" }, 1.8)
          .to(one("notif"), { autoAlpha: 0, y: -70, scale: 0.9, duration: 0.6, ease: "power2.in" }, 1.8)
          .to(one("thread"), { autoAlpha: 1, duration: 0.6 }, 2.05)
          .to(one("b1"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, transformOrigin: "0% 100%" }, 2.2);
        // 2.9 · the language is detected: the light flicks across, then locks on
        tl.to(one("lang"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, 2.9)
          .to(one("hl"), { autoAlpha: 1, duration: 0.2 }, 3.1);
        const flick = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4].slice(0, 9 + lock);
        flick.forEach((i, n) => tl!.to(one("hl"), { x: chipX(i), duration: 0.11 + n * 0.012, ease: "power1.inOut" }, 3.15 + n * 0.115));
        const landed = 3.15 + flick.length * 0.115;
        tl.to(one("hl"), { x: chipX(lock), duration: 0.45, ease: "power3.out" }, landed)
          .set(chips[lock], { attr: { "data-on": "true" } }, landed + 0.25);
        // 4.6 · the reply writes itself
        tl.to(stack, { y: scrollTo("a1"), duration: 0.8, ease: "power3.inOut" }, 4.5)
          .to(one("a1"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, transformOrigin: "100% 100%" }, 4.6)
          .to(one("dots"), { autoAlpha: 1, duration: 0.25 }, 4.7)
          .to(one("dots"), { autoAlpha: 0, duration: 0.2 }, 5.25)
          .to(q("[data-word]"), { opacity: 1, y: 0, duration: 0.35, stagger: 0.035, ease: "power2.out" }, 5.35);
        const wrote = 5.35 + q("[data-word]").length * 0.035;
        // the calendar's free times appear; the buyer picks one; it snaps into place
        tl.to(stack, { y: scrollTo("slots"), duration: 0.8, ease: "power3.inOut" }, wrote + 0.2)
          .to(one("slots"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, wrote + 0.3)
          .to(q("[data-pill]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, wrote + 0.5)
          .to(stack, { y: scrollTo("b2"), duration: 0.7, ease: "power3.inOut" }, wrote + 1.3)
          .to(one("b2"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, transformOrigin: "0% 100%" }, wrote + 1.4)
          .set(q('[data-pill="1"]'), { attr: { "data-on": "true" } }, wrote + 2.0)
          .fromTo(q('[data-pill="1"]'), { scale: 1 }, { scale: 1.06, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, wrote + 2.0);
        // "Viewing booked" forms
        const b = wrote + 2.6;
        tl.to(stack, { y: scrollTo("booked"), duration: 0.8, ease: "power3.inOut" }, b)
          .to(one("booked"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" }, b + 0.1)
          .to(check, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, b + 0.4);
        // the handover card forms, then flies out of the phone to the chip
        const h = b + 1.4;
        tl.to(stack, { y: scrollTo("hand"), duration: 0.8, ease: "power3.inOut" }, h)
          .to(one("hand"), { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, h + 0.1)
          .to(q("[data-row]"), { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1 }, h + 0.35)
          .to(one("hand"), { x: 70, y: -16, rotate: -4, scale: 0.86, autoAlpha: 0, duration: 0.7, ease: "power3.in" }, h + 1.45)
          .call(() => flyOut(gsap, one("hand"), fly, chip, hero), undefined, h + 1.45);
        // hold, then back to the lock screen for a seamless loop
        const end = h + 3.4;
        tl.to(one("thread"), { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, end)
          .to(one("lock"), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, end + 0.2)
          .set({}, {}, end + 1.1);
      }, el);
      run();
      return () => { ctx.revert(); tl = null; };
    });
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    io.observe(el);
    const onVis = () => run();
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); stop(); };
  }, [langCode]);

  return (
    <div ref={root} className={styles.story} data-story>
      <div className={styles.status} aria-hidden="true"><span>23:47</span><span className={styles.bat} /></div>

      <div className={styles.lock} data-s="lock">
        <span className={styles.clock}>23:47</span>
        <span className={styles.day}>{chat.stamp.split("·")[0].trim()}</span>
      </div>

      <div className={styles.notif} data-s="notif">
        <span className={styles.appIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>
        </span>
        <span className={styles.notifBody}>
          <span className={styles.notifTop}><b>{story.notif}</b><span>23:47</span></span>
          <span className={styles.notifFrom}>{story.from}</span>
          <span className={styles.notifText}>{story.l1}</span>
        </span>
      </div>

      <div className={styles.thread} data-s="thread">
        <div className={styles.head}>
          <span className={styles.avatar} aria-hidden="true">J</span>
          <span className={styles.headText}><b>{story.from}</b><span>{chat.agency} · {story.ai}</span></span>
        </div>
        <div className={styles.view} data-s="view">
          <div className={styles.stack} data-s="stack">
            <p className={styles.in} data-s="b1">{story.l1}</p>

            <div className={styles.lang} data-s="lang">
              <span className={styles.langLbl}>{story.detected}</span>
              <span className={styles.chips}>
                <span className={styles.hl} data-s="hl" aria-hidden="true" />
                {LANGS.map((l) => <span key={l} className={styles.chip} data-chip-lang data-on={l === langCode}>{l}</span>)}
              </span>
            </div>

            <div className={styles.out} data-s="a1">
              <span className={styles.aiTag}>{story.ai}</span>
              <p className={styles.outText}>
                {words.map((w, i) => (/^\s+$/.test(w) ? w : <span key={i} data-word>{w}</span>))}
              </p>
              <span className={styles.dots} data-s="dots" aria-hidden="true"><i /><i /><i /></span>
            </div>

            <div className={styles.slots} data-s="slots">
              <span className={styles.slotsLbl}>{story.slots}</span>
              <span className={styles.pills}>
                <span className={styles.pill} data-pill="0" data-on="false">{slotShort} · 10:00</span>
                <span className={styles.pill} data-pill="1" data-on="true">{slotShort} · 11:00</span>
              </span>
            </div>

            <p className={styles.in} data-s="b2">{chat.l2}</p>

            <div className={styles.booked} data-s="booked">
              <svg className={styles.check} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path data-s="check" d="M7.5 12.4l3 3 6-6.4" />
              </svg>
              <span className={styles.bookedText}>
                <b>{story.booked}</b>
                <span>{slotShort} · 11:00</span>
                <span className={styles.bookedSub}>{story.bookedSub}</span>
              </span>
            </div>

            <div className={styles.hand} data-s="hand">
              <span className={styles.handT}>{story.handover}</span>
              {story.rows.map(([k, v]) => (
                <span key={k} className={styles.row} data-row><span>{k}</span><b>{v}</b></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// The handover card leaves the phone: a copy of it, in page coordinates, travels
// from the card's place on the screen to the "Viewing booked" chip and lands in it.
function flyOut(gsap: typeof import("gsap").gsap, from: HTMLElement, fly?: HTMLElement | null, chip?: HTMLElement | null, hero?: HTMLElement | null) {
  if (!fly || !chip || !hero) return;
  const card = hero.querySelector("section")!.getBoundingClientRect();
  const a = from.getBoundingClientRect(), c = chip.getBoundingClientRect();
  const w = fly.offsetWidth || 180, hgt = fly.offsetHeight || 96;
  const sx = a.left + a.width / 2 - card.left - w / 2, sy = a.top + a.height / 2 - card.top - hgt / 2;
  const ex = c.left + c.width / 2 - card.left - w / 2, ey = c.top + c.height / 2 - card.top - hgt / 2;
  gsap.timeline()
    .fromTo(fly, { x: sx, y: sy, scale: Math.max(0.5, a.width / w), autoAlpha: 0, rotate: -3 }, { autoAlpha: 1, duration: 0.25, ease: "power1.out" })
    .to(fly, { x: ex, y: ey, scale: Math.min(1, c.width / w), rotate: 0, duration: 1.05, ease: "power3.inOut" }, 0)
    .to(fly, { autoAlpha: 0, scale: Math.min(1, c.width / w) * 0.9, duration: 0.35, ease: "power2.in" }, 0.85)
    .fromTo(chip, { scale: 1 }, { scale: 1.05, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 }, 0.95)
    .fromTo(chip, { boxShadow: "0 0 0 rgba(205, 209, 217, 0)" }, { boxShadow: "0 0 34px rgba(205, 209, 217, 0.45)", duration: 0.3, yoyo: true, repeat: 1 }, 0.95);
}
