import type { Dictionary } from "@/i18n";
import { ArrowRight } from "@/components/chrome/Icons";
import NightShiftMotion from "./NightShiftMotion";
import styles from "./NightShift.module.css";

export default function NightShift({ t }: { t: Dictionary["night"] }) {
  return (
    <section className={styles.section} aria-labelledby="night-title" data-night>
      <span className={`mono-label ${styles.label}`}>
        {t.label[0]}
        <br className="hidden lg:block" />
        <span className="lg:hidden"> </span>
        {t.label[1]}
      </span>
      <h2 id="night-title" className={styles.title}>
        <span className={styles.l1} data-line>{t.line1}</span>{" "}
        <span className={styles.l2} data-line>
          {t.line2a}{" "}
          <span className={styles.dots} role="img" aria-label={t.typing}>
            <i /><i /><i />
          </span>{" "}
          {t.line2b}
        </span>{" "}
        <span className={styles.l3} data-line>{t.line3}</span>{" "}
        <span className={styles.l4} data-line><span className="chrome-text">{t.line4}</span></span>
      </h2>
      <div className={styles.pills} data-pills>
        <span className={styles.pill} data-pill="0">{t.pills[0]}</span>
        <span className={`${styles.pill} ${styles.chrome} chrome-bg`} data-pill="1">{t.pills[1]}</span>
        <span className={`${styles.pill} ${styles.arrow}`} data-pill-arrow aria-hidden="true"><ArrowRight /></span>
        <span className={`${styles.pill} ${styles.ghost}`} data-pill="3">{t.pills[2]}</span>
      </div>
      <NightShiftMotion />
    </section>
  );
}
