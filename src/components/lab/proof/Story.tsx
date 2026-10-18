"use client";

import type { Dictionary } from "@/i18n";
import { fill, formatViewing, nextThursday, useViewingKey, weekdayOnly } from "@/lib/viewing-date";
import s from "./proof.module.css";

// 01's pinned story, in three beats: the enquiry, the viewing booked, the
// handover. Every line is the homepage's own simulated conversation. The
// motion lives in ProofPage's single ScrollTrigger setup; without it (reduced
// motion, no JS) every step simply shows.
export type Beat = { title: string; text: string };

export default function Story({ t, name, beats }: { t: Dictionary; name: string; beats: Beat[] }) {
  const key = useViewingKey();
  const date = key ? formatViewing("en", nextThursday()) : weekdayOnly("en");
  const story = t.hero.story;
  const chat = t.hero.chat;
  return (
    <section className={s.story} aria-labelledby="story-title" data-story>
      <div className={s.storyPin} data-story-pin>
        <div className={s.storyText}>
          <span className="mono-label" id="story-title">01 · {name} · Simulated</span>
          <ol className={s.beats}>
            {beats.map((b, i) => (
              <li key={b.title} className={s.beat} data-beat={i}>
                <span className={s.beatNum}>0{i + 1}</span>
                <h3 className={s.beatTitle}>{b.title}</h3>
                <p className={s.beatText}>{b.text}</p>
              </li>
            ))}
          </ol>
          <span className={s.storyRail} aria-hidden="true"><span data-story-progress /></span>
        </div>

        <div className={s.storyVisual}>
          <div className={s.chat} role="group" aria-label="Simulated conversation">
            <div className={s.chatHead}>
              <span className={s.chatAvatar} aria-hidden="true">R</span>
              <span className="flex flex-col">
                <span className={s.chatName}>{chat.agency}</span>
                <span className={s.chatStatus}>{chat.status}</span>
              </span>
              <span className={s.simTag}>Simulated</span>
            </div>
            <div className={s.chatBody} data-chat-body>
              <div className={s.chatCol} data-chat-col>
                <div className={s.chatNotif} data-step="0">
                  <span className={s.dot} aria-hidden="true" />{story.notif} · {story.from}
                </div>
                <p className={`${s.msg} ${s.lead}`} data-step="0">{story.l1}</p>
                <p className={s.chatMeta} data-step="0">{story.detected} · English</p>
                <p className={`${s.msg} ${s.ai}`} data-step="0">
                  <span className={s.aiTag}>{story.ai}</span>
                  {fill(chat.a1, date)}
                </p>
                <div className={s.slots} data-step="1" data-step-end>
                  <span className={s.chatMeta}>{story.slots}</span>
                  <span className={s.slotRow}>
                    <span className={s.slot}>10:00</span>
                    <span className={s.slot}><span className={s.slotFill} data-pick-fill aria-hidden="true" /><span className="relative">11:00</span></span>
                  </span>
                </div>
                <p className={`${s.msg} ${s.lead}`} data-step="1">{chat.l2}</p>
                <div className={s.booked} data-step="1" data-step-end>
                  <span className={s.bookedIcon} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  </span>
                  <span className="flex flex-col">
                    <span className={s.bookedTitle}>{story.booked} · {date.short} · 11:00</span>
                    <span className={s.chatMeta}>{story.bookedSub}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={s.handover} data-handover>
            <span className="mono-label">{story.handover}</span>
            <dl className={s.handRows}>
              {story.rows.map(([k, v]) => (
                <div key={k} className={s.handRow} data-hand-row>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <span className={s.handSent} data-hand-row>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
              {story.sent}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
