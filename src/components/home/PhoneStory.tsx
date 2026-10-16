"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion, withMotion } from "@/lib/gsap";
import styles from "./PhoneStory.module.css";

// The phone screen tells the story in big, single scenes, keynote style, as a
// seamless ~15 s loop (GSAP): a new enquiry lands at 23:47 → one large language
// chip flicks through languages and locks on the buyer's → one large reply
// writes itself → a big "11:00" is picked → a big "Viewing booked ✓" → the
// handover card for the consultant, which lifts off the screen and flies to the
// "Viewing booked" chip's spot, where it turns into the chip (hidden until then;
// it stays ~3 s, then the loop resets). Exactly one card flies: the screen's card
// hides on the frame the flying copy (same markup, same size) takes its place.
// Only while on screen. Reduced motion (or no script): the booked scene and the
// chip, still.

// Only the five languages the assistant answers in.
const ROLL = ["PT", "EN", "ES", "FR", "DE"] as const;

type Props = {
  chat: Dictionary["hero"]["chat"];
  story: Dictionary["hero"]["story"];
  langCode: "PT" | "EN" | "ES";
  slotShort: string; // e.g. "Thu 22 Oct"
};

// The consultant's handover card: drawn on the screen, and again in the hero's
// flying layer, from this one component, so the two are the same card.
export function HandCard({ story, className = "", ...rest }: { story: Dictionary["hero"]["story"]; className?: string; [k: `data-${string}`]: string | undefined }) {
  return (
    <div className={`${styles.hand} ${className}`} {...rest}>
      <span className={styles.handT}>{story.handover}</span>
      {story.rows.map(([k, v]) => (
        <span key={k} className={styles.row} data-row><span>{k}</span><b>{v}</b></span>
      ))}
    </div>
  );
}

export default function PhoneStory({ chat, story, langCode, slotShort }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const words = chat.a1.split(/(\s+)/);
  // The flick: other languages roll past, then the buyer's.
  const roll = useMemo(() => { const others = ROLL.filter((l) => l !== langCode); return [...others, ...others, langCode]; }, [langCode]);

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
      const hero = el.closest<HTMLElement>("[data-hero]");
      const chip = hero?.querySelector<HTMLElement>("[data-chip]");
      const fly = hero?.querySelector<HTMLElement>("[data-fly]");
      const scenes = ["notif", "lang", "reply", "time", "booked", "hand"].map(one);
      const reel = one("reel"), cell = (one("reel").firstElementChild as HTMLElement).offsetHeight || 84;
      const check = one("check") as unknown as SVGPathElement, ring = one("ring") as unknown as SVGCircleElement;
      const len = check.getTotalLength(), rlen = ring.getTotalLength();
      const enter = { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" };
      const leave = { autoAlpha: 0, y: -26, scale: 0.97, duration: 0.45, ease: "power2.in" };

      const ctx = gsap.context(() => {
        tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power3.out" } });
        // 0 · the lock screen at 23:47 (everything reset for every loop)
        tl.set(one("lock"), { autoAlpha: 1, y: 0 }, 0)
          .set(chip ?? {}, { autoAlpha: 0, scale: 1, boxShadow: "0 0 0 rgba(205, 209, 217, 0)" }, 0)
          .set(fly ?? {}, { autoAlpha: 0 }, 0)
          .set(scenes, { autoAlpha: 0, y: 30, scale: 0.96 }, 0)
          .set(reel, { y: 0 }, 0)
          .set(one("pill"), { attr: { "data-on": "false" } }, 0)
          .set(q("[data-word]"), { opacity: 0, y: 4 }, 0)
          .set(one("dots"), { autoAlpha: 0 }, 0)
          .set(q("[data-time]"), { autoAlpha: 0, y: 14, height: "auto", marginTop: "", attr: { "data-on": "false" } }, 0)
          .set(one("pick"), { autoAlpha: 0, y: 10 }, 0)
          .set(ring, { strokeDasharray: rlen, strokeDashoffset: rlen }, 0)
          .set(check, { strokeDasharray: len, strokeDashoffset: len }, 0)
          .set(q("[data-row]"), { autoAlpha: 0, x: -10 }, 0);

        // 0.4 · a new enquiry lands, big
        tl.to(one("notif"), { ...enter, duration: 0.9 }, 0.4);
        // 2.4 · the language: the chip flicks through, then locks on the buyer's
        tl.to(one("lock"), { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" }, 2.4)
          .to(one("notif"), leave, 2.4)
          .to(one("lang"), enter, 2.75);
        let at = 3.0;
        roll.forEach((_, i) => {
          if (!i) return;
          const last = i === roll.length - 1;
          tl!.to(reel, { y: -i * cell, duration: last ? 0.5 : 0.1, ease: last ? "back.out(2)" : "power1.inOut" }, at);
          at += 0.12 + i * 0.012;
        });
        const locked = at + 0.35;
        tl.set(one("pill"), { attr: { "data-on": "true" } }, locked)
          .fromTo(one("pill"), { scale: 1 }, { scale: 1.07, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, locked);
        // the reply writes itself
        const r = locked + 0.95;
        tl.to(one("lang"), leave, r)
          .to(one("reply"), enter, r + 0.4)
          .to(one("dots"), { autoAlpha: 1, duration: 0.2 }, r + 0.45)
          .to(one("dots"), { autoAlpha: 0, duration: 0.2 }, r + 0.9)
          .to(q("[data-word]"), { opacity: 1, y: 0, duration: 0.35, stagger: 0.045, ease: "power2.out" }, r + 1.0);
        const wrote = r + 1.0 + q("[data-word]").length * 0.045 + 1.0;
        // the calendar's two free times; the buyer picks 11:00, big
        tl.to(one("reply"), leave, wrote)
          .to(one("time"), enter, wrote + 0.3)
          .to(q("[data-time]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, wrote + 0.45)
          .to(one("pick"), { autoAlpha: 1, y: 0, duration: 0.5 }, wrote + 1.25)
          .set(one("t1"), { attr: { "data-on": "true" } }, wrote + 1.6)
          .fromTo(one("t1"), { scale: 1 }, { scale: 1.06, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, wrote + 1.6)
          .to(one("t0"), { autoAlpha: 0, height: 0, marginTop: 0, duration: 0.5, ease: "power3.inOut" }, wrote + 1.95);
        // "Viewing booked ✓", big
        const b = wrote + 2.9;
        tl.to(one("time"), leave, b)
          .to(one("booked"), enter, b + 0.3)
          .to(ring, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, b + 0.4)
          .to(check, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, b + 0.85);
        // the handover card forms, then lifts off and flies to the chip's spot,
        // where it turns into the chip: the chip shows only from here. The flight
        // is part of this timeline (measured afresh each loop), so the card's fade
        // and the chip's reveal share one clock and never overlap more than a beat.
        const h = b + 2.0;
        const f = h + 2.0, land = f + 1.17;
        tl.to(one("booked"), leave, h)
          .to(one("hand"), enter, h + 0.3)
          .to(q("[data-row]"), { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1 }, h + 0.55);
        if (fly && chip && hero) {
          const g = { sx: 0, sy: 0, ex: 0, ey: 0, s0: 1, s1: 0.5 };
          const measure = () => {
            const card = one("handcard"), box = hero.querySelector("section")!.getBoundingClientRect();
            const a = card.getBoundingClientRect(), c = chip.getBoundingClientRect();
            const w = card.offsetWidth;
            fly.style.width = `${w}px`;
            const hh = fly.offsetHeight || card.offsetHeight;
            Object.assign(g, {
              s0: a.width / w, s1: Math.min(1, (c.width / w) * 1.05),
              sx: a.left + a.width / 2 - box.left - w / 2, sy: a.top + a.height / 2 - box.top - hh / 2,
              ex: c.left + c.width / 2 - box.left - w / 2, ey: c.top + c.height / 2 - box.top - hh / 2,
            });
          };
          tl.call(measure, undefined, f - 0.02)
            // the same card takes the screen card's exact place on the frame it hides
            .set(fly, { x: () => g.sx, y: () => g.sy, scale: () => g.s0, rotate: 0, autoAlpha: 1 }, f)
            .set(one("hand"), { autoAlpha: 0 }, f)
            .to(fly, { y: () => g.sy - 14 * g.s0, scale: () => g.s0 * 1.04, rotate: -2, duration: 0.3, ease: "power2.out" }, f)
            .to(fly, { x: () => g.ex, y: () => g.ey, scale: () => g.s1, rotate: 0, duration: 0.95, ease: "power3.inOut" }, f + 0.22)
            // on the chip's spot: the card dissolves as the chip appears
            .to(fly, { autoAlpha: 0, scale: () => g.s1 * 0.92, duration: 0.18, ease: "power2.in" }, land)
            .fromTo(chip, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out", immediateRender: false }, land + 0.1)
            .fromTo(chip, { boxShadow: "0 0 0 rgba(205, 209, 217, 0)" }, { boxShadow: "0 0 34px rgba(205, 209, 217, 0.45)", duration: 0.35, yoyo: true, repeat: 1, immediateRender: false }, land + 0.2);
          // positions are read again on every loop (the layout may have changed)
          tl.eventCallback("onRepeat", () => tl?.getTweensOf(fly).forEach((t) => t.invalidate()));
        }
        // the chip stays ~3 s, then everything resets: chip hidden, lock screen back
        const end = land + 0.45 + 3.0;
        if (chip) tl.to(chip, { autoAlpha: 0, scale: 0.96, duration: 0.45, ease: "power2.in" }, end);
        tl.to(one("lock"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, end)
          .set({}, {}, end + 1.0);
      }, el);
      run();
      return () => { ctx.revert(); tl = null; };
    });
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; run(); });
    io.observe(el);
    const onVis = () => run();
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); stop(); };
  }, [langCode, roll]);

  return (
    <div ref={root} className={styles.story} data-story>
      <div className={styles.status} aria-hidden="true"><span>23:47</span><span className={styles.bat} /></div>

      <div className={styles.lock} data-s="lock">
        <span className={styles.clock}>23:47</span>
        <span className={styles.day}>{chat.stamp.split("·")[0].trim()}</span>
      </div>

      {/* 1 · the enquiry */}
      <div className={`${styles.scene} ${styles.sNotif}`} data-s="notif">
        <div className={styles.notif}>
          <span className={styles.notifTop}>
            <span className={styles.appIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>
            </span>
            <b>{story.notif}</b><span className={styles.now}>23:47</span>
          </span>
          <span className={styles.notifFrom}>{story.from}</span>
          <span className={styles.notifText}>{story.l1}</span>
        </div>
      </div>

      {/* 2 · the language, one big chip */}
      <div className={styles.scene} data-s="lang">
        <span className={styles.lbl}>{story.detected}</span>
        <span className={styles.pill} data-s="pill" data-on="false">
          <span className={styles.reel} data-s="reel">
            {roll.map((l, i) => <span key={i} className={styles.code}>{l}</span>)}
          </span>
        </span>
      </div>

      {/* 3 · one large reply */}
      <div className={styles.scene} data-s="reply">
        <span className={styles.lbl}>{story.ai}</span>
        <div className={styles.out}>
          <p className={styles.outText}>
            {words.map((w, i) => (/^\s+$/.test(w) ? w : <span key={i} data-word>{w}</span>))}
          </p>
          <span className={styles.dots} data-s="dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
      </div>

      {/* 4 · a big 11:00 */}
      <div className={styles.scene} data-s="time">
        <span className={styles.lbl}>{story.slots}</span>
        <span className={styles.day2}>{slotShort}</span>
        <span className={styles.time} data-time data-s="t0" data-on="false">10:00</span>
        <span className={styles.time} data-time data-s="t1" data-on="false">11:00</span>
        <span className={styles.pick} data-s="pick">{chat.l2}</span>
      </div>

      {/* 5 · Viewing booked ✓ */}
      <div className={`${styles.scene} ${styles.sBooked}`} data-s="booked">
        <svg className={styles.check} viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
          <circle data-s="ring" cx="48" cy="48" r="44" />
          <path data-s="check" d="M29 49.5l13 13 25-27" />
        </svg>
        <b className={styles.bookedT}>{story.booked}</b>
        <span className={styles.bookedWhen}>{slotShort} · 11:00</span>
        <span className={styles.bookedSub}>{story.bookedSub}</span>
      </div>

      {/* 6 · the handover card (it flies out to the chip) */}
      <div className={styles.scene} data-s="hand">
        <HandCard story={story} data-s="handcard" />
      </div>
    </div>
  );
}
