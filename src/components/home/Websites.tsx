import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ArrowUpRight } from "@/components/chrome/Icons";
import { euros } from "@/lib/numbers";
import styles from "./Websites.module.css";

export default function Websites({ lang, t }: { lang: Locale; t: Dictionary["websites"] }) {
  return (
    <section id="websites" className={styles.section} data-switch="to-light" aria-labelledby="websites-title">
      <div aria-hidden="true" className={styles.night} data-switch-layer />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className="mono-label !text-[#5E636B]">{t.label}</span>
          <h2 id="websites-title" className={`display ${styles.title}`}>
            {t.titleA}
            <br />
            <span className={styles.indent}>{t.titleB}</span>
          </h2>
          <p className={styles.body}>
            <span className="hidden md:inline">{t.body}</span>
            <span className="md:hidden">{t.bodyShort}</span>
          </p>
          <div className={styles.prices}>
            <span className="flex flex-col gap-1">
              <span className="text-[12px] text-[#5E636B] md:text-[13px]">{t.fromSite}</span>
              <span className={styles.figure}>{euros(1500, lang)}</span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[12px] text-[#5E636B] md:text-[13px]">{t.fromCare}</span>
              <span className={styles.figure}>
                {euros(150, lang)}
                <span className="text-[13px] font-normal text-[#5E636B] md:text-[16px]">
                  <span className="hidden md:inline">{t.perMonth}</span>
                  <span className="md:hidden">{t.perMonthShort}</span>
                </span>
              </span>
            </span>
            <Link href={`/${lang}/websites`} className={`btn ${styles.dark}`}>
              {t.cta}
              <span className="btn-arrow"><ArrowUpRight /></span>
            </Link>
          </div>
        </div>

        <div className={styles.mock} aria-hidden="true">
          <div className={styles.browser}>
            <div className={styles.bar}>
              <span /><span /><span />
              <em>{t.url}</em>
            </div>
            <picture>
              <source type="image/avif" srcSet="/media/websites/gallery-640.avif 640w, /media/websites/gallery-1000.avif 1000w, /media/websites/gallery-1400.avif 1400w" sizes="(min-width: 1024px) 500px, 80vw" />
              <img src="/media/websites/gallery-1000.webp" srcSet="/media/websites/gallery-640.webp 640w, /media/websites/gallery-1000.webp 1000w, /media/websites/gallery-1400.webp 1400w" sizes="(min-width: 1024px) 500px, 80vw" alt="" width={1400} height={788} loading="lazy" decoding="async" className={styles.shot} />
            </picture>
          </div>
          <div className={styles.phone}>
            <img src="/media/websites/gallery-640.webp" alt="" width={640} height={360} loading="lazy" decoding="async" className={styles.phoneShot} />
          </div>
        </div>
      </div>
    </section>
  );
}
