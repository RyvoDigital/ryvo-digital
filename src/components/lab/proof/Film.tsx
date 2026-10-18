"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "@/i18n";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import { startMotion } from "./motion";
import f from "./film.module.css";

// 01's story as a short film on a display (a Kie render with its screen left
// dark; the film is live DOM on top, so every letter is sharp). Five scenes:
// the enquiry arrives, the assistant answers, free times appear and one is
// picked, the viewing lands in the calendar, the handover card reaches the
// consultant who covers the area. Labelled Simulated. It plays while in view,
// pauses off-screen, and the three beats beside it follow it (click one to
// jump there). Under reduced motion it rests on the booked frame.
export type Beat = { title: string; text: string };

// The display render: where its screen sits, in % of the image (KIE-LOG.md).
const SCREEN = { left: 4.404, top: 5.753, width: 91.687, height: 67.564 };
const DISPLAY = (w: number, ext: string) => `/media/proof/device/display-v1-${w}.${ext}`;

const SCENES = { s1: 0, s2: 3.2, s3: 8, s4: 12.6, s5: 16.4 };
const BEAT_AT = [SCENES.s1, SCENES.s3, SCENES.s5];

export default function Film({ t, name, beats }: { t: Dictionary; name: string; beats: Beat[] }) {
  const root = useRef<HTMLElement>(null);
  const key = useViewingKey();
  const date = key ? formatViewing("en", nextThursday()) : weekdayOnly("en");
  const story = t.hero.story;
  const chat = t.hero.chat;
  const team = t.how.settings;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    startMotion().then(({ gsap, reduced }) => {
      if (cancelled) return;
      const q = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)!;
      const world = one("[data-world]");
      // A narrow screen (phones) is its own composition: zoomed in, the camera
      // centres one element at a time instead of showing two side by side.
      const narrow = el.querySelector<HTMLElement>("[data-device]")!.clientWidth < 620;
      const PAN = narrow ? { chat: 19, cal: -24, hand: 17, team: -22 } : { chat: 19, cal: 0, hand: 0, team: 0 };
      const beatEls = q("[data-beat]");
      const beatBars = q("[data-beat-bar]");
      let lit = -1;
      const light = (i: number) => {
        if (i === lit) return;
        lit = i;
        beatEls.forEach((b, k) => (b.dataset.on = String(k === i)));
      };

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "expo.out", duration: 0.9 } });
        const IN = { opacity: 1, yPercent: 0, scale: 1 };

        // Scene 1: the enquiry arrives.
        tl.set(q("[data-film] [data-a]"), { opacity: 0, xPercent: 0, yPercent: 0, scale: 1 }, 0)
          .set(world, { scale: 1.06, xPercent: 0, yPercent: 0, opacity: 1 }, 0)
          .set(q("[data-dot]"), { opacity: 0.25 }, 0)
          .set(one("[data-slot-fill]"), { opacity: 0 }, 0)
          .set(one("[data-event-check]"), { scale: 0.6, opacity: 0 }, 0)
          .to(world, { scale: 1, duration: 3.4, ease: "power2.out" }, 0)
          .fromTo(one("[data-a=notif]"), { opacity: 0, yPercent: -25, scale: 0.97 }, { ...IN, duration: 1.1 }, 0.25)
          .fromTo(one("[data-a=notif-msg]"), { opacity: 0, yPercent: 30 }, { ...IN }, 0.85)

        // Scene 2: the assistant answers, in the buyer's language.
          .to(one("[data-a=notif]"), { opacity: 0, yPercent: -18, scale: 0.96, duration: 0.6, ease: "power2.in" }, SCENES.s2)
          .set(world, { xPercent: PAN.chat }, SCENES.s2 + 0.6)
          .fromTo(one("[data-a=chat]"), { opacity: 0, yPercent: 6 }, IN, SCENES.s2 + 0.35)
          .fromTo(one("[data-a=lead1]"), { opacity: 0, yPercent: 25 }, IN, SCENES.s2 + 0.5)
          .fromTo(one("[data-a=lang]"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, SCENES.s2 + 1.1)
          .fromTo(one("[data-a=typing]"), { opacity: 0, yPercent: 30 }, IN, SCENES.s2 + 1.5)
          .to(q("[data-dot]"), { opacity: 1, duration: 0.3, stagger: { each: 0.15, repeat: 3, yoyo: true }, ease: "sine.inOut" }, SCENES.s2 + 1.6)
          .to(one("[data-a=typing]"), { opacity: 0, duration: 0.25, ease: "power1.out" }, SCENES.s2 + 2.85)
          .fromTo(one("[data-a=ai1]"), { opacity: 0, yPercent: 25 }, IN, SCENES.s2 + 2.95)

        // Scene 3: free times from the calendar; one is picked.
          .to(world, { xPercent: PAN.cal, duration: 1.6, ease: "expo.inOut" }, SCENES.s3)
          .to(one("[data-a=chat]"), { opacity: 0.45, duration: 1.2 }, SCENES.s3)
          .fromTo(one("[data-a=cal]"), { opacity: 0, xPercent: 10 }, { opacity: 1, xPercent: 0, duration: 1.3 }, SCENES.s3 + 0.5)
          .fromTo(q("[data-a=slot]"), { opacity: 0, yPercent: 30 }, { ...IN, stagger: 0.12 }, SCENES.s3 + 1.0)
          .to(one("[data-a=chat]"), { opacity: 1, duration: 0.6 }, SCENES.s3 + 2.3)
          .to(world, { xPercent: narrow ? PAN.chat : PAN.cal, duration: 1.2, ease: "expo.inOut" }, SCENES.s3 + 2.1)
          .fromTo(one("[data-a=lead2]"), { opacity: 0, yPercent: 25 }, IN, SCENES.s3 + 2.4)
          .to(world, { xPercent: PAN.cal, duration: 1.1, ease: "expo.inOut" }, SCENES.s3 + 3.3)
          .to(one("[data-slot-fill]"), { opacity: 1, duration: 0.5, ease: "power2.out" }, SCENES.s3 + 3.0)

        // Scene 4: the viewing lands in the calendar.
          .to([one("[data-a=chat]"), one("[data-a=cal]")], { opacity: 0, scale: 0.97, duration: 0.6, ease: "power2.in" }, SCENES.s4)
          .set(world, { xPercent: 0, scale: 1.04 }, SCENES.s4 + 0.6)
          .to(world, { scale: 1, duration: 3.2, ease: "power2.out" }, SCENES.s4 + 0.6)
          .fromTo(one("[data-a=day]"), { opacity: 0, yPercent: 6 }, IN, SCENES.s4 + 0.6)
          .fromTo(one("[data-a=event]"), { opacity: 0, yPercent: -40, scale: 0.98 }, { ...IN, duration: 1.2 }, SCENES.s4 + 1.3)
          .to(one("[data-event-check]"), { scale: 1, opacity: 1, duration: 0.7 }, SCENES.s4 + 1.9)

        // Scene 5: the handover card reaches the right consultant.
          .to(one("[data-a=day]"), { opacity: 0, scale: 0.97, duration: 0.6, ease: "power2.in" }, SCENES.s5)
          .set(world, { xPercent: PAN.hand }, SCENES.s5 + 0.6)
          .fromTo(one("[data-a=hand]"), { opacity: 0, xPercent: -8 }, { opacity: 1, xPercent: 0, duration: 1.1 }, SCENES.s5 + 0.5)
          .fromTo(q("[data-a=hand-row]"), { opacity: 0, yPercent: 40 }, { ...IN, stagger: 0.09, duration: 0.6 }, SCENES.s5 + 0.8)
          .fromTo(one("[data-a=team]"), { opacity: 0, xPercent: 8 }, { opacity: 1, xPercent: 0, duration: 1.1 }, SCENES.s5 + 0.9)
          .to(one("[data-a=hand]"), { xPercent: narrow ? 0 : 10, duration: 1.3, ease: "expo.inOut" }, SCENES.s5 + 2.3)
          .to(world, { xPercent: PAN.team, duration: 1.4, ease: "expo.inOut" }, SCENES.s5 + 2.3)
          .set(one("[data-a=ana]"), { opacity: 0.75 }, SCENES.s5 + 0.9)
          .to(one("[data-a=ana]"), { opacity: 1, duration: 0.6 }, SCENES.s5 + 2.9)
          .fromTo(one("[data-a=sent]"), { opacity: 0, yPercent: 40 }, IN, SCENES.s5 + 3.1)
          .to({}, { duration: 1.6 })
          .to(world, { opacity: 0, duration: 0.7, ease: "power2.in" })
          .set(world, { opacity: 1 });

        // The beats follow the film: lit beat, and a hairline filling through it.
        const ends = [BEAT_AT[1], BEAT_AT[2], tl.duration()];
        tl.eventCallback("onUpdate", () => {
          const time = tl.time();
          const i = time >= BEAT_AT[2] ? 2 : time >= BEAT_AT[1] ? 1 : 0;
          light(i);
          beatBars.forEach((b, k) => gsap.set(b, { scaleX: k < i ? 1 : k > i ? 0 : (time - BEAT_AT[k]) / (ends[k] - BEAT_AT[k]) }));
        });

        if (process.env.NODE_ENV !== "production") (window as unknown as Record<string, unknown>).__film = tl;

        if (reduced) {
          // The booked frame, every beat visible.
          tl.seek(SCENES.s5 - 0.01, false);
          beatEls.forEach((b) => (b.dataset.on = "true"));
          beatBars.forEach((b) => gsap.set(b, { scaleX: 1 }));
          return;
        }

        // Play while in view; pause off-screen (and the ticker sleeps in hidden tabs).
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.2 });
        io.observe(el.querySelector("[data-device]")!);

        // Click a beat: a short dip to black, then the film from that beat.
        const jump = (i: number) => {
          const playing = !tl.paused();
          gsap.to(world, { opacity: 0, duration: 0.22, ease: "power1.in", overwrite: "auto", onComplete: () => {
            tl.seek(BEAT_AT[i] + 0.001);
            gsap.fromTo(world, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" });
            if (playing) tl.play();
          } });
        };
        const handlers = beatEls.map((b, i) => { const h = () => jump(i); b.addEventListener("click", h); return [b, h] as const; });
        cleanup = () => { io.disconnect(); handlers.forEach(([b, h]) => b.removeEventListener("click", h)); };
      }, el);
      const prev = cleanup;
      cleanup = () => { prev?.(); ctx.revert(); };
    });

    return () => { cancelled = true; cleanup?.(); };
  }, []);

  return (
    <section ref={root} className={f.film} aria-labelledby="film-title" data-film-section>
      <span className="mono-label" id="film-title" data-reveal>01 · {name} · Simulated</span>

      <div className={f.device} data-device>
        <picture>
          <source type="image/avif" srcSet={`${DISPLAY(760, "avif")} 760w, ${DISPLAY(1200, "avif")} 1200w, ${DISPLAY(1800, "avif")} 1800w`} sizes="(min-width: 1200px) 1100px, 100vw" />
          <img src={DISPLAY(1200, "webp")} srcSet={`${DISPLAY(760, "webp")} 760w, ${DISPLAY(1200, "webp")} 1200w, ${DISPLAY(1800, "webp")} 1800w`} sizes="(min-width: 1200px) 1100px, 100vw" width={3224} height={2451} alt="" loading="lazy" decoding="async" className={f.deviceImg} />
        </picture>

        <div className={f.screen} style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }} role="img" aria-label="A simulated conversation: a buyer's enquiry, the assistant's reply, a viewing booked, and the handover to a consultant">
          <div className={f.zoom} aria-hidden="true">
          <div className={f.world} data-world data-film>
            {/* 1 · the enquiry */}
            <div className={`${f.layer} ${f.center}`}>
              <div className={f.notif} data-a="notif">
                <span className={f.notifIcon} />
                <span className={f.notifBody}>
                  <span className={f.notifHead}><b>{story.notif}</b><span>{story.from}</span></span>
                  <span className={f.notifMsg} data-a="notif-msg">{story.l1}</span>
                </span>
              </div>
            </div>

            {/* 2–3 · the conversation, and the calendar beside it */}
            <div className={`${f.layer} ${f.split}`}>
              <div className={f.chat} data-a="chat">
                <div className={f.chatHead}><span className={f.avatar}>R</span><span><b>{chat.agency}</b><i>{chat.status}</i></span></div>
                <p className={`${f.bubble} ${f.lead}`} data-a="lead1">{story.l1}</p>
                <p className={f.meta} data-a="lang">{story.detected} · English</p>
                <div className={f.stack}>
                  <p className={`${f.bubble} ${f.ai} ${f.typing}`} data-a="typing"><span data-dot /><span data-dot /><span data-dot /></p>
                  <p className={`${f.bubble} ${f.ai}`} data-a="ai1"><span className={f.aiTag}>{story.ai}</span>{fill(chat.a1, date)}</p>
                </div>
                <p className={`${f.bubble} ${f.lead}`} data-a="lead2">{chat.l2}</p>
              </div>
              <div className={f.cal} data-a="cal">
                <span className={f.meta}>{story.slots}</span>
                <span className={f.calDate}>{date.Long}</span>
                <span className={f.slots}>
                  <span className={f.slot} data-a="slot">10:00</span>
                  <span className={f.slot} data-a="slot">11:00<span className={f.slotFill} data-slot-fill>11:00</span></span>
                </span>
              </div>
            </div>

            {/* 4 · booked */}
            <div className={`${f.layer} ${f.center}`}>
              <div className={f.day} data-a="day">
                <span className={f.dayHead}><b>{date.Long}</b><span className={f.meta}>{story.bookedSub}</span></span>
                <div className={f.grid}>
                  {["09:00", "10:00", "11:00", "12:00", "13:00"].map((h) => <span key={h} className={f.hour}><i>{h}</i></span>)}
                  <div className={f.event} data-a="event">
                    <span className={f.check} data-event-check><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg></span>
                    <span><b>{story.booked} · 11:00</b><i>{story.bookedSub}</i></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 · the handover */}
            <div className={`${f.layer} ${f.split}`}>
              <div className={f.hand} data-a="hand">
                <span className={f.meta}>{story.handover}</span>
                {story.rows.map(([k, v]) => <span key={k} className={f.handRow} data-a="hand-row"><i>{k}</i><b>{v}</b></span>)}
                <span className={f.sent} data-a="sent">✓ {story.sent}</span>
              </div>
              <div className={f.team} data-a="team">
                <span className={f.meta}>{team.consultantsLabel}</span>
                {team.consultants.map(([n, area, langs], i) => (
                  <span key={n} className={f.person} data-a={i === 0 ? "ana" : undefined} data-pick={i === 0}>
                    <span className={f.personDot}>{n[0]}</span><span><b>{n}</b><i>{area} · {langs}</i></span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          </div>
          <span className={f.sim}>Simulated</span>
          <span className={f.glass} aria-hidden="true" />
        </div>
      </div>

      <ol className={f.beats} style={{ marginLeft: `${SCREEN.left}%`, width: `${SCREEN.width}%` }}>
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
    </section>
  );
}
