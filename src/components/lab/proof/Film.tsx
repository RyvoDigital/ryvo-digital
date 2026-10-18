"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import { startMotion } from "./motion";
import f from "./film.module.css";

// 01's story as a short product film on a display (a Kie render with its
// screen left dark; the film is live DOM on top, so every letter is sharp).
// About 24 s, looping, labelled Simulated. A designed screen (obsidian, a slow
// mercury glow, a light sweep), kinetic captions from 01's own tagline, and
// staged UI with camera moves and depth blur:
//   1 the enquiry slides in after a typing indicator
//   2 "Language detected" grows into the reply as it types
//   3 the calendar's free times; 11:00 is picked
//   4 "Viewing booked": the check draws, the card settles into the calendar
//   5 the handover card flies to Ana, who covers Cascais, and lands
// It plays in view and pauses off-screen; the beats beside it follow it and
// jump it. Under reduced motion it rests on the booked frame.
export type Beat = { title: string; text: string };

// The display render: where its screen sits, in % of the image (KIE-LOG.md).
const SCREEN = { left: 5.592, top: 7.236, width: 88.842, height: 65.196 };
const IMG = { w: 3773, h: 2902 };
const DISPLAY = (w: number, ext: string) => `/media/proof/device/display-v2-${w}.${ext}`;

const T = { s1: 0, s2: 4.4, s3: 9.6, s4: 13.8, s5: 18.6 };
const BEAT_AT = [T.s1, T.s3, T.s5];
const REST_AT = T.s4 + 2.9; // the booked frame, for reduced motion
const CAM_AT_SETTLE = 1.04; // the camera's zoom while the booked card settles

// 01's tagline, cut into the film's captions (no new words).
function captions(tagline: string, handover: string) {
  const m = tagline.match(/^(.+? answered) (.+?,.+?,) (.+)$/);
  const parts = m ? [m[1], m[2], m[3]] : [tagline, "", ""];
  return [...parts, handover.split(":")[0] + "."];
}
const CAP_BEAT = [0, 0, 1, 2]; // which beat each caption belongs to

export default function Film({ t, name, tagline, beats }: { t: Dictionary; name: string; tagline: string; beats: Beat[] }) {
  const root = useRef<HTMLElement>(null);
  const key = useViewingKey();
  const date = key ? formatViewing("en", nextThursday()) : weekdayOnly("en");
  const story = t.hero.story;
  const chat = t.hero.chat;
  const team = t.how.settings;
  const caps = captions(tagline, beats[2].text);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    startMotion().then(({ gsap, SplitText, reduced }) => {
      if (cancelled) return;
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)!;
      const all = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));
      const screen = one("[data-screen]");
      const beatEls = all("[data-beat]");
      const beatBars = all("[data-beat-bar]");
      let lit = -1;
      const light = (i: number) => {
        if (i === lit) return;
        lit = i;
        beatEls.forEach((b, k) => (b.dataset.on = String(k === i)));
      };

      // The reply types itself: one span per character, revealed in order.
      const split = SplitText.create(one("[data-reply-text]"), { type: "words,chars" });

      let tl: gsap.core.Timeline | null = null;
      let ctx: gsap.Context | null = null;
      let builtWidth = 0;

      const build = (at = 0) => {
        ctx?.revert();
        builtWidth = screen.clientWidth;
        const narrow = builtWidth < 600;
        ctx = gsap.context(() => {
          const world = one("[data-world]");
          const cam = one("[data-cam]");
          const capEls = all("[data-cap]");
          const capLines = (i: number) => Array.from(capEls[i].querySelectorAll<HTMLElement>("[data-line]"));
          const wa = one("[data-a=wa]"), typing = one("[data-a=typing]"), lead = one("[data-a=lead]");
          const ai = one("[data-a=ai]"), chip = one("[data-a=chip]"), aiTag = one("[data-a=ai-tag]");
          const cal = one("[data-a=cal]"), slots = all("[data-a=slot]"), pick = one("[data-a=pick]"), ring = one("[data-a=ring]"), lead2 = one("[data-a=lead2]");
          const booked = one("[data-a=booked]"), check = one("[data-a=check-path]"), checkDisc = one("[data-a=check-disc]"), bookedText = all("[data-a=booked-line]");
          const slot11 = one("[data-a=slot11]");
          const hand = one("[data-a=hand]"), handRows = all("[data-a=hand-row]"), teamEl = one("[data-a=team]"), ana = one("[data-a=ana]"), rui = one("[data-a=rui]"), sent = one("[data-a=sent]");
          const glow = one("[data-a=glow]"), sweep = one("[data-a=sweep]");

          // Where the booked card lands (its 11:00 slot) and where the handover
          // card lands (Ana's row): measured once, at rest, in the screen's own
          // pixels, and divided by the camera's zoom at that moment.
          const scale = screen.clientWidth / Math.max(1, screen.getBoundingClientRect().width);
          const delta = (from: HTMLElement, to: HTMLElement, zoom: number) => {
            const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
            return { x: ((b.left + b.width / 2) - (a.left + a.width / 2)) * scale / zoom, y: ((b.top + b.height / 2) - (a.top + a.height / 2)) * scale / zoom };
          };
          const toSlot = delta(booked, slot11, CAM_AT_SETTLE);
          const toAna = delta(hand, ana, 1);

          const IN = { opacity: 1, xPercent: 0, yPercent: 0, scale: 1, filter: "blur(0px)" };
          tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "expo.out", duration: 0.9 } });
          const lineIn = (i: number, at: number) => tl!.fromTo(capLines(i), { yPercent: 112 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }, at);
          const lineOut = (i: number, at: number) => tl!.to(capLines(i), { yPercent: -112, duration: 0.7, stagger: 0.04, ease: "power2.in" }, at);

          // Every element starts hidden; the loop resets them here.
          tl.set([wa, typing, lead, ai, cal, booked, hand, teamEl, lead2, sent], { opacity: 0 }, 0)
            .set([wa, ai, cal, booked, hand, teamEl], { filter: "blur(0px)", scale: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotation: 0 }, 0)
            .set(capEls.flatMap((c) => Array.from(c.querySelectorAll("[data-line]"))), { yPercent: 112 }, 0)
            .set(split.chars, { opacity: 0 }, 0)
            .set(chip, { opacity: 1 }, 0)
            .set(aiTag, { opacity: 0 }, 0)
            .set(ai, { clipPath: "inset(30% 30% 30% 30% round 4cqw)" }, 0)
            .set([pick, ring], { opacity: 0, scale: 1 }, 0)
            .set(slots, { opacity: 0 }, 0)
            .set(handRows, { opacity: 0 }, 0)
            .set(check, { strokeDashoffset: 1 }, 0)
            .set(checkDisc, { scale: 0.6, opacity: 0 }, 0)
            .set(bookedText, { opacity: 0, yPercent: 30 }, 0)
            .set([ana, rui], { opacity: 0.85 }, 0) // dimmed, still AA (the monogram too)
            .set(world, { opacity: 1 }, 0)
            .set(cam, { scale: 1.08, xPercent: 0 }, 0)
            // The screen breathes: a mercury glow drifts the whole time.
            .fromTo(glow, { xPercent: -8, yPercent: -6, scale: 1 }, { xPercent: 10, yPercent: 6, scale: 1.12, duration: 12, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)

            // 1 · the enquiry, after the buyer has typed it.
            .to(cam, { scale: 1, duration: 4.2, ease: "power2.out" }, 0)
            .fromTo(wa, { opacity: 0, xPercent: 18, filter: "blur(8px)", scale: 0.94 }, { ...IN, duration: 1.3 }, 0.3);
          lineIn(0, 0.5);
          tl.fromTo(typing, { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: 0, duration: 0.6 }, 1.1)
            .to(all("[data-dot]"), { opacity: 1, duration: 0.28, stagger: { each: 0.14, repeat: 3, yoyo: true }, ease: "sine.inOut" }, 1.2)
            .to(typing, { opacity: 0, duration: 0.25, ease: "power1.out" }, 2.6)
            .fromTo(lead, { opacity: 0, yPercent: 25, scale: 0.97 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.9 }, 2.65);

          // 2 · "Language detected" grows into the reply as it types.
          lineOut(0, T.s2 - 0.2);
          lineIn(1, T.s2 + 0.2);
          tl.to(cam, { scale: 1.05, xPercent: narrow ? 0 : -5, duration: 4.6, ease: "power2.inOut" }, T.s2)
            .to(wa, narrow ? { opacity: 0, filter: "blur(6px)", scale: 0.96, duration: 0.6, ease: "power2.in" } : {}, T.s2)
            .to(ai, { opacity: 1, duration: 0.5 }, narrow ? T.s2 + 0.55 : T.s2 + 0.2)
            .to(ai, { clipPath: "inset(0% 0% 0% 0% round 1.6cqw)", duration: 1.2, ease: "expo.inOut" }, T.s2 + 1.2)
            .to(chip, { opacity: 0, duration: 0.35, ease: "power1.out" }, T.s2 + 1.3)
            .to(aiTag, { opacity: 1, duration: 0.5 }, T.s2 + 2.0)
            .to(split.chars, { opacity: 1, duration: 0.01, stagger: 0.016, ease: "none" }, T.s2 + 2.1);

          // 3 · free times from the calendar; 11:00 is picked. The chat
          // drifts out of focus as the calendar comes in.
          lineOut(1, T.s3 - 0.3);
          lineIn(2, T.s3 + 0.1);
          tl.fromTo(sweep, { xPercent: -160, opacity: 0 }, { xPercent: 160, opacity: 1, duration: 1.8, ease: "power2.inOut" }, T.s3 - 0.4)
            .to(sweep, { opacity: 0, duration: 0.5 }, T.s3 + 1.0)
            .to(cam, { scale: 1, xPercent: narrow ? 0 : 3, duration: 1.6, ease: "expo.inOut" }, T.s3)
            .to([wa, ai], { opacity: narrow ? 0 : 0.35, filter: "blur(5px)", scale: 0.94, xPercent: narrow ? -10 : -14, duration: 1.4, ease: "expo.inOut" }, T.s3)
            .fromTo(cal, { opacity: 0, xPercent: 22, filter: "blur(8px)", scale: 0.96 }, { ...IN, duration: 1.4 }, T.s3 + 0.35)
            .to(slots, { opacity: 1, duration: 0.6, stagger: 0.1 }, T.s3 + 0.9)
            .fromTo(lead2, { opacity: 0, yPercent: 40, scale: 0.9 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.8 }, T.s3 + 1.9)
            .to(pick, { opacity: 1, duration: 0.4, ease: "power2.out" }, T.s3 + 2.6)
            .fromTo(ring, { opacity: 0.7, scale: 1 }, { opacity: 0, scale: 1.6, duration: 1.1, ease: "power2.out" }, T.s3 + 2.6)

          // 4 · the big moment: "Viewing booked", the check draws, then the
          // card settles into its 11:00 slot.
            .to([wa, ai, lead2], { opacity: 0, duration: 0.6, ease: "power2.in" }, T.s4)
            .to(cal, { filter: "blur(6px)", opacity: 0.4, scale: 0.97, duration: 0.8, ease: "power2.inOut" }, T.s4)
            .to(cam, { scale: CAM_AT_SETTLE, xPercent: 0, duration: 2.6, ease: "power2.out" }, T.s4)
            .fromTo(booked, { opacity: 0, scale: 0.9, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.1 }, T.s4 + 0.25)
            .to(checkDisc, { scale: 1, opacity: 1, duration: 0.7 }, T.s4 + 0.7)
            .to(check, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, T.s4 + 0.95)
            .to(bookedText, { opacity: 1, yPercent: 0, duration: 0.8, stagger: 0.12 }, T.s4 + 1.15)
            .to(cal, { filter: "blur(0px)", opacity: 1, scale: 1, duration: 1, ease: "power2.inOut" }, T.s4 + 3.1)
            .to(booked, { x: toSlot.x, y: toSlot.y, scale: 0.34, duration: 1.3, ease: "expo.inOut" }, T.s4 + 3.2)
            .to(booked, { opacity: 0, duration: 0.3 }, T.s4 + 4.3)
            .to(pick, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, T.s4 + 4.35);

          // 5 · the handover card flies to Ana, who covers Cascais, and lands.
          lineOut(2, T.s5 - 0.2);
          lineIn(3, T.s5 + 0.2);
          tl.to(cal, { opacity: 0, filter: "blur(6px)", scale: 0.96, duration: 0.8, ease: "power2.in" }, T.s5)
            .to(cam, { scale: 1, xPercent: 0, duration: 1.4, ease: "expo.inOut" }, T.s5)
            .fromTo(hand, { opacity: 0, xPercent: narrow ? 0 : -14, yPercent: narrow ? -8 : 0, filter: "blur(8px)", scale: 0.95 }, { ...IN, duration: 1.3 }, T.s5 + 0.5)
            .to(handRows, { opacity: 1, duration: 0.5, stagger: 0.08 }, T.s5 + 0.9)
            .fromTo(teamEl, { opacity: 0, xPercent: narrow ? 0 : 12, yPercent: narrow ? 10 : 0, filter: "blur(8px)" }, { opacity: 1, xPercent: 0, yPercent: 0, filter: "blur(0px)", duration: 1.2 }, T.s5 + 0.8)
            .to(teamEl.querySelector("span"), { opacity: 0, duration: 0.4, ease: "power1.out" }, T.s5 + 2.5) // the label clears the card's path
            .to(teamEl.querySelector("span"), { opacity: 1, duration: 0.6 }, T.s5 + 4.2)
            .to(hand, { x: toAna.x, duration: 1.5, ease: "power3.inOut" }, T.s5 + 2.6)
            .to(hand, { y: toAna.y, duration: 1.5, ease: "sine.inOut" }, T.s5 + 2.6)
            .to(hand, { scale: 0.22, rotation: -2, duration: 1.5, ease: "power2.in" }, T.s5 + 2.6)
            .to(hand, { opacity: 0, duration: 0.4, ease: "power1.in" }, T.s5 + 3.75)
            .to(ana, { opacity: 1, duration: 0.5, ease: "power2.out" }, T.s5 + 3.8)
            .fromTo(sent, { opacity: 0, xPercent: -10 }, { opacity: 1, xPercent: 0, duration: 0.8 }, T.s5 + 4.0)
            .to({}, { duration: 1.4 })
            .to(world, { opacity: 0, duration: 0.8, ease: "power2.in" });

          // The beats follow the film: one lit, a hairline filling through it.
          const ends = [BEAT_AT[1], BEAT_AT[2], tl.duration()];
          tl.eventCallback("onUpdate", () => {
            const time = tl!.time();
            const i = time >= BEAT_AT[2] ? 2 : time >= BEAT_AT[1] ? 1 : 0;
            light(i);
            beatBars.forEach((b, k) => gsap.set(b, { scaleX: k < i ? 1 : k > i ? 0 : (time - BEAT_AT[k]) / (ends[k] - BEAT_AT[k]) }));
          });
          tl.seek(at, false);
        }, el);
        if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>).__film = tl;
      };

      build();
      if (reduced) {
        tl!.seek(REST_AT, false);
        beatEls.forEach((b) => (b.dataset.on = "true"));
        beatBars.forEach((b) => gsap.set(b, { scaleX: 1 }));
        teardown = () => { ctx?.revert(); split.revert(); };
        return;
      }

      let inView = false;
      const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) tl!.play(); else tl!.pause(); }, { threshold: 0.2 });
      io.observe(one("[data-device]"));

      // The landing points are measured from the layout, so a real change of
      // width rebuilds the film, keeping it where it was.
      let rt: ReturnType<typeof setTimeout> | undefined;
      const ro = new ResizeObserver(() => {
        if (Math.abs(screen.clientWidth - builtWidth) < builtWidth * 0.02) return;
        clearTimeout(rt);
        rt = setTimeout(() => { const at = tl!.time(); build(at); if (inView) tl!.play(); }, 150);
      });
      ro.observe(screen);

      // Click a beat: a short dip of the screen, then the film from that beat.
      const jump = (i: number) => {
        const world = one("[data-world]");
        gsap.to(world, { opacity: 0, duration: 0.22, ease: "power1.in", overwrite: "auto", onComplete: () => {
          tl!.seek(BEAT_AT[i] + 0.001, false);
          gsap.fromTo(world, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" });
          if (inView) tl!.play();
        } });
      };
      const handlers = beatEls.map((b, i) => { const h = () => jump(i); b.addEventListener("click", h); return [b, h] as const; });
      teardown = () => { io.disconnect(); ro.disconnect(); clearTimeout(rt); handlers.forEach(([b, h]) => b.removeEventListener("click", h)); ctx?.revert(); split.revert(); };
    });

    return () => { cancelled = true; teardown?.(); };
  }, []);

  return (
    <section ref={root} className={f.film} aria-labelledby="film-title" data-film-section>
      <div className={f.side}>
        <span className="mono-label" id="film-title" data-reveal>01 · {name} · Simulated</span>
        <ol className={f.beats}>
          {beats.map((b, i) => (
            <li key={b.title}>
              <button type="button" className={f.beat} data-beat data-on={i === 0}>
                <span className={f.beatBar} aria-hidden="true"><span data-beat-bar /></span>
                <span className={f.beatNum}>0{i + 1}</span>
                <span className={f.beatTitle}>{b.title}</span>
                <span className={f.beatText}>{b.text}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={f.device} data-device style={{ aspectRatio: `${IMG.w} / ${IMG.h}` }}>
        <picture>
          <source type="image/avif" srcSet={`${DISPLAY(760, "avif")} 760w, ${DISPLAY(1200, "avif")} 1200w, ${DISPLAY(1800, "avif")} 1800w`} sizes="(min-width: 1024px) 900px, 100vw" />
          <img src={DISPLAY(1200, "webp")} srcSet={`${DISPLAY(760, "webp")} 760w, ${DISPLAY(1200, "webp")} 1200w, ${DISPLAY(1800, "webp")} 1800w`} sizes="(min-width: 1024px) 900px, 100vw" width={IMG.w} height={IMG.h} alt="" loading="lazy" decoding="async" className={f.deviceImg} />
        </picture>

        <div className={f.screen} data-screen style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }} role="img" aria-label="A simulated film: a buyer's enquiry, the assistant's reply in the buyer's language, a viewing booked, and the handover to the consultant who covers the area">
          <div className={f.bg} aria-hidden="true">
            <span className={f.glow} data-a="glow" />
            <span className={f.sweep} data-a="sweep" />
          </div>
          <div className={f.world} data-world aria-hidden="true">
            <div className={f.cam} data-cam>
              <div className={f.stage}>
                <div className={f.wa} data-a="wa">
                  <div className={f.waHead}><span className={f.waDot} /><span><b>{story.from}</b><i>{story.notif}</i></span></div>
                  <p className={`${f.bubble} ${f.typing}`} data-a="typing"><span data-dot /><span data-dot /><span data-dot /></p>
                  <p className={`${f.bubble} ${f.lead}`} data-a="lead">{story.l1}</p>
                </div>
                <div className={`${f.bubble} ${f.ai}`} data-a="ai">
                  <span className={f.chip} data-a="chip">{story.detected} · English</span>
                  <span className={f.aiTag} data-a="ai-tag">{story.ai}</span>
                  <span data-reply-text>{fill(chat.a1, date)}</span>
                </div>

                <div className={f.cal} data-a="cal">
                  <span className={f.meta}>{story.slots}</span>
                  <span className={f.calDate}>{date.Long}</span>
                  <div className={f.rows}>
                    {["09:00", "10:00", "11:00", "12:00"].map((h) => (
                      <div key={h} className={f.row}>
                        <i>{h}</i>
                        {h === "10:00" && <span className={f.slot} data-a="slot">10:00</span>}
                        {h === "11:00" && (
                          <span className={f.slot} data-a="slot">
                            <span data-a="slot11" className={f.slotAnchor} />
                            11:00
                            <span className={f.pick} data-a="pick">11:00</span>
                            <span className={f.ring} data-a="ring" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className={`${f.bubble} ${f.lead} ${f.lead2}`} data-a="lead2">{chat.l2}</p>
                </div>

                <div className={f.booked} data-a="booked">
                  <span className={f.checkDisc} data-a="check-disc">
                    <svg viewBox="0 0 24 24" fill="none"><path data-a="check-path" d="M6 12.5l4 4 8-9" pathLength={1} strokeDasharray="1" strokeDashoffset="1" /></svg>
                  </span>
                  <span className={f.bookedTitle} data-a="booked-line">{story.booked}</span>
                  <span className={f.bookedWhen} data-a="booked-line">{date.short} · 11:00</span>
                  <span className={f.meta} data-a="booked-line">{story.bookedSub}</span>
                </div>

                <div className={f.hand} data-a="hand">
                  <span className={f.meta}>{story.handover}</span>
                  {story.rows.map(([k, v]) => <span key={k} className={f.handRow} data-a="hand-row"><i>{k}</i><b>{v}</b></span>)}
                </div>
                <div className={f.team} data-a="team">
                  <span className={f.meta}>{team.consultantsLabel}</span>
                  {team.consultants.map(([n, area, langs], i) => (
                    <span key={n} className={f.person} data-a={i === 0 ? "ana" : "rui"} data-pick={i === 0}>
                      <span className={f.personDot}>{n[0]}</span>
                      <span><b>{n}</b><i>{area} · {langs}</i>{i === 0 && <span className={f.sent} data-a="sent">✓ {story.sent}</span>}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* The kinetic captions: 01's own tagline, then its handover line. */}
            <div className={f.caps}>
              {caps.map((c, i) => (
                <p key={i} className={f.cap} data-cap>
                  <span className={f.mask}><span className={f.capBeat} data-line>0{CAP_BEAT[i] + 1} · {beats[CAP_BEAT[i]].title}</span></span>
                  <span className={f.mask}><span className={f.capText} data-line>{c}</span></span>
                </p>
              ))}
            </div>
          </div>
          <span className={f.sim}>Simulated</span>
          <span className={f.glass} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
