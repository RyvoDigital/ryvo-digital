// A 2–3% film grain over the whole page so the black reads as material.
// One tiny pre-rendered noise tile (cheap to paint, even without a GPU),
// nudged in steps; static with reduced motion.
const NOISE = "url(/media/noise.webp)";

export default function Grain() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-[0.035]" style={{ mixBlendMode: "overlay" }}>
      <div className="absolute -inset-[50%] motion-safe:animate-[grain_0.9s_steps(6)_infinite]" style={{ backgroundImage: NOISE }} />
      <style>{`@keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}`}</style>
    </div>
  );
}
