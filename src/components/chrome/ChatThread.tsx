"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import styles from "./ChatThread.module.css";

// A messaging thread that plays like iMessage. Every bubble keeps its final
// place from the first paint (nothing on the page moves: CLS stays at zero); the
// whole stack is translated so the newest line sits at the bottom, and earlier
// messages glide up as each one arrives. Bubbles grow out of their tail corner,
// the typing dots breathe in the reply's own place, and "Delivered" fades in
// under the last sent message. Reduced motion: everything is simply there.

export type Who = "lead" | "agent";
export type ChatItem = { who: Who; content: ReactNode };
export type ChatState = { shown: number; typing: number | null; delivered: number | null };

const FULL = (n: number): ChatState => ({ shown: n, typing: null, delivered: null });

/** Plays a conversation: a sent message lands, "Delivered", a pause, the dots, the reply. */
export function useChatPlayer(whos: Who[], { onDone, initial = "empty" }: { onDone?: () => void; initial?: "empty" | "full" } = {}) {
  const [state, setState] = useState<ChatState>(initial === "full" ? FULL(whos.length) : FULL(0));
  const timers = useRef<number[]>([]);
  const key = whos.join();
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; }, [onDone]);

  const play = useCallback((startDelay = 300) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const list = key.split(",") as Who[];
    if (prefersReducedMotion()) { setState(FULL(list.length)); done.current?.(); return; }
    const at = (ms: number, s: ChatState | (() => void)) =>
      timers.current.push(window.setTimeout(() => (typeof s === "function" ? s() : setState(s)), ms));
    setState({ shown: 0, typing: null, delivered: null });
    let t = startDelay;
    list.forEach((who, i) => {
      if (who === "lead") {
        at(t, { shown: i + 1, typing: null, delivered: null });
        at(t + 520, { shown: i + 1, typing: null, delivered: i });
        t += 1150;
      } else {
        at(t, { shown: i, typing: i, delivered: null });
        t += 1500;
        at(t, { shown: i + 1, typing: null, delivered: null });
        t += 900;
      }
    });
    at(t - 600, () => done.current?.());
  }, [key]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { state, play };
}

export default function ChatThread({
  items, state, head, deliveredLabel, className = "", classes,
}: {
  items: ChatItem[];
  state: ChatState;
  head?: ReactNode;
  deliveredLabel?: string;
  className?: string;
  classes: { lead: string; agent: string; typing?: string };
}) {
  const stack = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Where the visible conversation ends, measured in layout (transforms ignored).
  const measure = useCallback(() => {
    const el = stack.current;
    if (!el) return;
    const slots = [...el.querySelectorAll<HTMLElement>(":scope > [data-slot]")];
    const headEl = el.querySelector<HTMLElement>(":scope > [data-head]");
    const bottomOf = (n: HTMLElement) => n.offsetTop + n.offsetHeight;
    const { shown, typing, delivered } = state;
    let end = headEl ? bottomOf(headEl) : 0;
    if (typing !== null && slots[typing]) {
      const dots = slots[typing].querySelector<HTMLElement>("[data-typing]");
      end = slots[typing].offsetTop + (dots?.offsetHeight ?? 0);
    } else if (shown > 0 && slots[shown - 1]) {
      end = bottomOf(slots[shown - 1]);
      const tag = delivered === shown - 1 ? slots[shown - 1].querySelector<HTMLElement>("[data-delivered]") : null;
      if (tag) end += tag.offsetHeight + 3;
    }
    setOffset(Math.max(0, el.offsetHeight - end));
  }, [state]);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    const el = stack.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={stack} className={`${styles.stack} ${className}`} style={{ transform: offset ? `translate3d(0, ${offset}px, 0)` : undefined }}>
      {head && <div data-head className={styles.head}>{head}</div>}
      {items.map((it, i) => (
        <div key={i} data-slot data-who={it.who} className={styles.slot}>
          <div className={`${styles.bubble} ${classes[it.who]}`} data-on={i < state.shown}>{it.content}</div>
          {it.who === "agent" && (
            <span data-typing aria-hidden="true" className={`${styles.typing} ${classes.typing ?? ""}`} data-on={state.typing === i}>
              <i /><i /><i />
            </span>
          )}
          {it.who === "lead" && deliveredLabel && (
            <span data-delivered aria-hidden="true" className={styles.delivered} data-on={state.delivered === i}>{deliveredLabel}</span>
          )}
        </div>
      ))}
    </div>
  );
}
