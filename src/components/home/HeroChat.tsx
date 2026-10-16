"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { prefersReducedMotion } from "@/lib/gsap";

// The chat on the phone screen types itself in, in the page's language.
// Every bubble reserves its final size from the first paint, so nothing on the
// page moves while it types (CLS stays at zero).
type Step = { at: number; show: number; type?: { index: number; text: string } };

const BUBBLES = 4; // l1, a1, l2, a2

export default function HeroChat({ chat, onBooked }: { chat: Dictionary["hero"]["chat"]; onBooked?: () => void }) {
  const [visible, setVisible] = useState(0); // how many bubbles are shown
  const [typing, setTyping] = useState<number | null>(null); // which assistant bubble shows dots
  const [typed, setTyped] = useState<Record<number, number>>({}); // chars typed per assistant bubble
  const done = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    if (prefersReducedMotion()) {
      at(0, () => {
        setVisible(BUBBLES);
        setTyped({ 1: chat.a1.length, 3: chat.a2.length });
        onBooked?.();
      });
      return () => timers.forEach(clearTimeout);
    }
    const typeOut = (index: number, text: string, start: number) => {
      const perChar = 16;
      for (let i = 1; i <= text.length; i++) at(start + i * perChar, () => setTyped((p) => ({ ...p, [index]: i })));
      return start + text.length * perChar;
    };

    let t = 700;
    at(t, () => setVisible(1));
    t += 900;
    at(t, () => setTyping(1));
    t += 1000;
    at(t, () => { setTyping(null); setVisible(2); });
    t = typeOut(1, chat.a1, t) + 900;
    at(t, () => setVisible(3));
    t += 800;
    at(t, () => setTyping(3));
    t += 900;
    at(t, () => { setTyping(null); setVisible(4); });
    t = typeOut(3, chat.a2, t) + 200;
    at(t, () => { if (!done.current) { done.current = true; onBooked?.(); } });

    return () => timers.forEach(clearTimeout);
  }, [chat, onBooked]);

  const lead = (i: number, text: string) => (
    <p
      className="self-end max-w-[80%] rounded-[1.1em_1.1em_0.3em_1.1em] bg-[#ECEEF1] px-[0.85em] py-[0.7em] text-obsidian transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
      style={{ opacity: visible > i ? 1 : 0, transform: visible > i ? "none" : "translateY(0.6em) scale(0.97)" }}
    >
      {text}
    </p>
  );

  const agent = (i: number, text: string) => {
    const shown = visible > i;
    const count = typed[i] ?? 0;
    return (
      <div className="relative self-start max-w-[86%]">
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 flex h-[2.3em] items-center gap-[0.3em] rounded-[1.1em] bg-surface-2 px-[0.9em] transition-opacity duration-300"
          style={{ opacity: typing === i ? 1 : 0 }}
        >
          {[0, 1, 2].map((d) => (
            <span key={d} className="h-[0.42em] w-[0.42em] rounded-full bg-silver motion-safe:animate-[dot_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${d * 0.15}s` }} />
          ))}
        </span>
        <p
          className="relative rounded-[1.1em_1.1em_1.1em_0.3em] bg-surface-2 px-[0.85em] py-[0.7em] transition-opacity duration-300"
          style={{ opacity: shown ? 1 : 0 }}
        >
          <span className="invisible">{text}</span>
          <span className="absolute inset-0 px-[0.85em] py-[0.7em]">{text.slice(0, count)}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="relative flex h-full flex-col text-text" style={{ fontSize: 12.6 }}>
      <style>{`@keyframes dot{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-0.18em)}}`}</style>
      <div className="flex items-center gap-[0.8em] border-b border-surface-2/80 px-[1.2em] pb-[0.85em] pt-[3.9em]">
        <span className="flex h-[2.7em] w-[2.7em] items-center justify-center rounded-full bg-surface-2 text-[0.85em] font-semibold text-silver">YA</span>
        <span className="flex flex-col leading-tight">
          <span className="text-[1.05em] font-semibold">{chat.agency}</span>
          <span className="text-[0.82em] text-steel">{chat.status}</span>
        </span>
      </div>
      <div className="flex flex-col gap-[0.65em] px-[0.95em] py-[1em] leading-[1.42]" aria-live="off">
        <span className="self-center font-mono text-[0.78em] text-steel">{chat.stamp}</span>
        {lead(0, chat.l1)}
        {agent(1, chat.a1)}
        {lead(2, chat.l2)}
        {agent(3, chat.a2)}
      </div>
      <noscript>
        <style>{`.hero-chat p{opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </div>
  );
}
