import type { Dictionary } from "@/i18n";

// The 24-hour ruler above the hero. The marker at 23:47 is where the thread starts.
export default function Ruler({ t }: { t: Dictionary }) {
  return (
    <div aria-hidden="true" className="relative mx-auto mb-3 hidden h-[30px] max-w-[1392px] md:block">
      <div
        className="absolute inset-x-0 bottom-0 h-[10px]"
        style={{ background: "repeating-linear-gradient(90deg, #3D4045 0 1px, transparent 1px 4.1666%)" }}
      />
      {["00:00", "06:00", "12:00", "18:00"].map((label, i) => (
        <span key={label} className="absolute top-0 font-mono text-[10px] text-steel" style={{ left: `${i * 25}%` }}>
          {label}
        </span>
      ))}
      <span
        data-thread-start
        className="absolute bottom-0 h-[22px] w-[2px] -ml-px bg-text"
        style={{ left: "99.1%" }}
      />
      <span className="absolute right-[14px] top-0 font-mono text-[10px] text-text">{t.ruler.answered}</span>
    </div>
  );
}
