import { ART, DESK_MEDIA, srcSet } from "./hero-media";

// The hero photo (or its silhouette layer), one source per layout. Shared by
// the homepage hero and the inner pages' navbar (NavFrame), whose bar shows the
// same photo's top edge. No hooks, so it renders on the server.
export default function ArtPicture({ which, className, priority }: { which: "bg" | "hand"; className: string; priority?: boolean }) {
  const d = ART.desk, m = ART.mob;
  const sizes = (a: typeof d) => (which === "bg" ? a.sizes : a.handSizes);
  const w = which === "bg" ? m.w : m.handW, h = which === "bg" ? m.h : m.handH;
  return (
    <picture>
      <source media={DESK_MEDIA} type="image/avif" srcSet={srcSet(d, which, "avif")} sizes={sizes(d)} />
      <source media={DESK_MEDIA} type="image/webp" srcSet={srcSet(d, which, "webp")} sizes={sizes(d)} />
      <source type="image/avif" srcSet={srcSet(m, which, "avif")} sizes={sizes(m)} />
      <img
        src={`${m[which]}-${which === "bg" ? 900 : 640}.webp`}
        srcSet={srcSet(m, which, "webp")}
        sizes={sizes(m)}
        width={w}
        height={h}
        alt=""
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  );
}
