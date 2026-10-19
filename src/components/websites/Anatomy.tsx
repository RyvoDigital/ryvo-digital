import type { CSSProperties } from "react";
import a from "./Anatomy.module.css";

// The hero's signature: the anatomy of a website. A finished page for a
// fictional, unnamed brand, built as five real DOM layers in CSS 3D (so the
// type stays sharp): grid, layout, type, image, interaction, back to front.
//
// One number drives it all: --p on the root, 0 (one finished page, facing
// you) to 1 (the page taken apart into a stack of milk-glass layers). The
// page's scroll sets it (WebsitesPage); every depth, glass and label below is
// derived from it in CSS. On load the layers fly in and lock together (pure
// CSS, from the first paint). With reduced motion it is a still exploded view.
//
// Everything here is decoration (aria-hidden); the root carries one label.

const LAYERS = ["grid", "layout", "type", "image", "interaction"] as const;

export default function Anatomy({ label, names }: { label: string; names: string[] }) {
  return (
    <div className={a.root} role="img" aria-label={label} data-anatomy>
      <div className={a.tilt} data-anatomy-tilt>
        <div className={a.intro}>
          <div className={a.stack}>
            {LAYERS.map((key, i) => (
              <div key={key} className={`${a.layer} ${a[key]}`} style={{ "--k": i - 2, "--i": i } as CSSProperties}>
                <div className={a.layerIn}>
                  <span className={a.glass} />
                  <Layer kind={key} />
                  <span className={a.tag}><span className={a.tagN}>0{i + 1}</span>{names[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer({ kind }: { kind: (typeof LAYERS)[number] }) {
  switch (kind) {
    case "grid":
      return (
        <div className={a.gridLines}>
          {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
        </div>
      );
    case "layout":
      return (
        <>
          <span className={a.pageBg} />
          <span className={a.navBlock} />
          <span className={a.heroBlock} />
          <span className={a.textBlock} />
          {[0, 1, 2].map((i) => <span key={i} className={a.card} style={{ "--c": i } as CSSProperties} />)}
        </>
      );
    case "type":
      return (
        <>
          <span className={a.mark}><i /></span>
          <span className={a.navWords}><b>Work</b><b>Studio</b><b>Contact</b></span>
          <span className={a.eyebrow}>N° 01 — Collection</span>
          <span className={a.headline}>Made to be<br />noticed.</span>
          <span className={a.body}>Objects made slowly,<br />in small numbers.</span>
          {["Sphere", "Arch", "Ring"].map((t, i) => (
            <span key={t} className={a.caption} style={{ "--c": i } as CSSProperties}><b>{t}</b><i>0{i + 1}</i></span>
          ))}
        </>
      );
    case "image":
      return (
        <>
          <span className={a.heroImg}><i className={a.sphere} /><i className={a.floor} /></span>
          {[0, 1, 2].map((i) => <span key={i} className={`${a.thumb} ${a["t" + i]}`} style={{ "--c": i } as CSSProperties}><i /></span>)}
        </>
      );
    case "interaction":
      return (
        <>
          <span className={a.button}>Explore <i>→</i></span>
          <span className={a.halo} />
          <svg className={a.cursor} viewBox="0 0 24 24"><path d="M5 3l14 8-6.2 1.6L10 19z" /></svg>
          <span className={a.toggle}><i /></span>
        </>
      );
  }
}
