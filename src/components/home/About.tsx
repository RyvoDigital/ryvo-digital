import type { Dictionary } from "@/i18n";
import styles from "./About.module.css";

export default function About({ t }: { t: Dictionary["about"] }) {
  const tiles = [
    { key: "lisbon-tagus", label: t.cities[0], alt: t.alt[0], tall: true },
    { key: "madrid", label: t.cities[1], alt: t.alt[1], tall: false },
  ];
  return (
    <section id="about" className={styles.section} data-switch="to-dark" aria-labelledby="about-title">
      <div aria-hidden="true" className={styles.day} data-switch-layer />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className="mono-label">{t.label}</span>
          <h2 id="about-title" className={`display ${styles.title}`}>
            {t.titleA}
            <br />
            <span className={styles.indent}>{t.titleB}</span>
          </h2>
          <div className={styles.proof}>
            <span className="chrome-text">{t.proof}</span>
            <span className={styles.proofLabel}>{t.proofLabel}</span>
          </div>
          <p className={styles.body}>{t.body}</p>
        </div>
        <div className={styles.tiles}>
          {tiles.map((tile) => (
            <figure key={tile.key} className={`${styles.tile} ${tile.tall ? styles.tall : ""}`}>
              <picture>
                <source type="image/avif" srcSet={`/media/about/${tile.key}-420.avif 420w, /media/about/${tile.key}-720.avif 720w`} sizes="(min-width: 1024px) 300px, 46vw" />
                <img src={`/media/about/${tile.key}-420.webp`} srcSet={`/media/about/${tile.key}-420.webp 420w, /media/about/${tile.key}-720.webp 720w`} sizes="(min-width: 1024px) 300px, 46vw" alt={tile.alt} width={720} height={1080} loading="lazy" decoding="async" />
              </picture>
              <figcaption className="font-mono text-[11px] tracking-[0.14em]">{tile.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
