"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

// A block that settles in as it scrolls into view, once (globals.css [data-rv]).
export default function Reveal({ as: Tag = "div", className = "", children, delay = 0, ...rest }: { as?: ElementType; className?: string; children: ReactNode; delay?: number; id?: string; "aria-labelledby"?: string }) {
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      node.dataset.rv = "in";
      io.disconnect();
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={el} className={className} data-rv="" style={delay ? { transitionDelay: `${delay}s` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}
