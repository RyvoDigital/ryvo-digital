"use client";

import { useEffect, type RefObject } from "react";
import { startMotion, refreshWhenSettled, type PageMotion } from "@/components/automations/motion";

// The websites page's motion, on the site's own scroll (Lenis on gsap.ticker,
// from SmoothScroll): transforms, opacity and clip-path only, nothing pinned,
// nothing that takes the scroll away. With reduced motion nothing here runs and
// every piece is simply in place (data-motion="reduced").

type Q = <T extends Element = HTMLElement>(sel: string, scope?: ParentNode) => T[];
export type Kit = PageMotion & { q: Q; desk: boolean; fine: boolean; once: (trigger: Element, start: string, fn: () => void) => void; onCleanup: (fn: () => void) => void };

export function usePageMotion(root: RefObject<HTMLElement | null>, setup: (kit: Kit) => void) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    const off: (() => void)[] = []; // DOM listeners: gsap's revert does not remove them
    startMotion().then((m) => {
      if (cancelled) return;
      el.dataset.motion = m.reduced ? "reduced" : "on";
      if (m.reduced) return;
      const ctx = m.gsap.context(() => {
        const q: Q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = el) => Array.from(scope.querySelectorAll<T>(sel));
        const once = (trigger: Element, start: string, fn: () => void) => m.ScrollTrigger.create({ trigger, start, once: true, onEnter: fn });
        const desk = matchMedia("(min-width: 1024px)").matches;
        const fine = matchMedia("(pointer: fine)").matches;
        setup({ ...m, q, once, desk, fine, onCleanup: (fn) => off.push(fn) });
      }, el);
      refreshWhenSettled(m);
      revert = () => { ctx.revert(); off.forEach((fn) => fn()); };
    });
    return () => {
      cancelled = true;
      revert?.();
    };
    // setup is defined inline by each direction and never changes meaning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Headlines rise out of their own line masks, once.
export function splitLines({ gsap, SplitText }: Kit, h: HTMLElement, opts: { delay?: number; trigger?: Element; start?: string } = {}) {
  SplitText.create(h, {
    type: "lines", mask: "lines", autoSplit: true,
    onSplit(self) {
      h.dataset.ready = "true";
      // A line mask is exactly one line box tall, and the display type's line
      // height is under 1, so g, p, y and ç would be clipped: give every mask
      // room below the baseline, and take it back with a negative margin so
      // nothing moves.
      for (const m of self.masks as HTMLElement[]) {
        m.style.paddingBottom = "0.18em";
        m.style.marginBottom = "-0.18em";
      }
      return gsap.from(self.lines, {
        yPercent: 108, duration: 1.25, stagger: 0.08, ease: "expo.out", delay: opts.delay ?? 0,
        scrollTrigger: opts.trigger ? { trigger: opts.trigger, start: opts.start ?? "top 80%", once: true } : undefined,
      });
    },
  });
}

// Blocks settle in as their section arrives, once.
export function settle({ gsap, q, once }: Kit, scope: ParentNode, start = "top 80%") {
  for (const sec of q("[data-settle-group]", scope)) {
    const items = q("[data-settle]", sec);
    if (!items.length) continue;
    gsap.set(items, { opacity: 0, y: 24 });
    once(sec, start, () => gsap.to(items, { opacity: 1, y: 0, duration: 1.15, stagger: 0.07, ease: "expo.out" }));
  }
}
