export function ArrowUpRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight({ size = 34, stroke = 1.6 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </svg>
  );
}

export function BookButton({ href, label, className = "", fold = false }: { href: string; label: string; className?: string; fold?: boolean }) {
  return (
    <a href={href} className={`btn ${fold ? "btn-fold" : ""} ${className}`} aria-label={fold ? label : undefined}>
      {fold ? <span className="fold"><span>{label}</span></span> : label}
      <span className="btn-arrow">
        <ArrowUpRight />
      </span>
    </a>
  );
}

// Navigation icons: simple line drawings, one stroke weight (1.6 at 20 px).
export type NavIconName = "spark" | "browser" | "route" | "people";

export function NavIcon({ name, size = 20 }: { name: NavIconName; size?: number }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    // Automations: a spark, with a small one beside it.
    spark: <><path d="M10 3.5 11.6 8.4 16.5 10 11.6 11.6 10 16.5 8.4 11.6 3.5 10 8.4 8.4Z" /><path d="M16.5 2.8v2.6M15.2 4.1h2.6" /></>,
    // Websites: a browser window.
    browser: <><rect x="2.8" y="4" width="14.4" height="12" rx="2.2" /><path d="M2.8 7.6h14.4" /><path d="M5.2 5.8h.01M7.2 5.8h.01" /></>,
    // How we work: a route from start to finish.
    route: <><circle cx="5" cy="15" r="1.9" /><circle cx="15" cy="5" r="1.9" /><path d="M6.9 15H12a2.6 2.6 0 0 0 0-5.2H8a2.6 2.6 0 0 1 0-5.2h5.1" /></>,
    // About: people.
    people: <><circle cx="7.6" cy="7.2" r="2.7" /><path d="M2.8 16.4c.5-2.6 2.4-4.1 4.8-4.1s4.3 1.5 4.8 4.1" /><path d="M12.9 4.8a2.6 2.6 0 0 1 0 4.9M14.6 12.5c1.3.5 2.3 1.8 2.6 3.9" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
