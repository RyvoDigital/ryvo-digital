import type { FolderImage } from "@/components/ui/glass-folder-cards";
import d from "./Devices.module.css";

// The two frames the hero's work sits in: a browser window and a phone. Plain
// silver hardware, no brand marks. The screenshots are the live client sites.

function Shot({ img, sizes, eager }: { img: FolderImage; sizes: string; eager?: boolean }) {
  return (
    <picture>
      {img.avif ? <source type="image/avif" srcSet={img.avif} sizes={sizes} /> : null}
      <img className={d.shot} src={img.src} srcSet={img.webp} sizes={sizes} width={img.width} height={img.height} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" />
    </picture>
  );
}

export function Browser({ img, host, sizes, eager, className = "" }: { img: FolderImage; host: string; sizes: string; eager?: boolean; className?: string }) {
  return (
    <div className={`${d.browser} ${className}`}>
      <div className={d.bar} aria-hidden="true">
        <span className={d.dots}><i /><i /><i /></span>
        <span className={d.host}>{host}</span>
        <span className={d.dots} style={{ visibility: "hidden" }}><i /><i /><i /></span>
      </div>
      <div className={d.screen}><Shot img={img} sizes={sizes} eager={eager} /></div>
    </div>
  );
}

export function Phone({ img, sizes, eager, className = "" }: { img: FolderImage; sizes: string; eager?: boolean; className?: string }) {
  return (
    <div className={`${d.phone} ${className}`}>
      <div className={d.phoneScreen}><Shot img={img} sizes={sizes} eager={eager} /></div>
      <span className={d.island} aria-hidden="true" />
    </div>
  );
}
