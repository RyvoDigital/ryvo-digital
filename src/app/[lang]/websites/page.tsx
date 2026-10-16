import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import { euros } from "@/lib/numbers";
import { BookButton } from "@/components/chrome/Icons";
import PageHero from "@/components/pages/PageHero";
import PageFrame from "@/components/pages/PageFrame";
import Reveal from "@/components/pages/Reveal";
import { CtaBand, Faq } from "@/components/pages/Blocks";
import s from "@/components/pages/Pages.module.css";
import w from "@/components/pages/Websites.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).websites;
  return pageMeta(lang, "/websites", p.metaTitle, p.metaDescription);
}

// The websites side: the light silver page. Manuel and Phil only (plan §3.7 rule).
export default async function WebsitesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const pg = getPages(lang);
  const p = pg.websites;
  const book = `/${lang}/book?kind=websites`;
  const people = [
    { name: "Manuel Vale", role: pg.about.roles.manuel, mono: "MV" },
    { name: "Phil Hajjar", role: pg.about.roles.phil, mono: "PH" },
  ];

  return (
    <PageFrame lang={lang} t={t} bookHref={book} light>
      <PageHero
        lang={lang} t={t} path="/websites" tone="light" label={p.label} title={p.title} dim={[1]}
        sub={<p className="m-0">{p.sub}</p>}
        actions={<BookButton href={book} label={p.cta.button} />}
        side={
          <div className={w.browser} aria-hidden="true">
            <div className={w.bar}><span /><span /><span /></div>
            <picture>
              <source type="image/avif" srcSet="/media/websites/gallery-640.avif 640w, /media/websites/gallery-1000.avif 1000w" sizes="(min-width: 1024px) 460px, 86vw" />
              <img src="/media/websites/gallery-640.webp" srcSet="/media/websites/gallery-640.webp 640w, /media/websites/gallery-1000.webp 1000w" sizes="(min-width: 1024px) 460px, 86vw" alt="" width={1000} height={563} fetchPriority="high" decoding="async" className={w.shot} />
            </picture>
          </div>
        }
      />
      <main>
        <section className={s.section} aria-labelledby="what-label">
          <div className={s.inner}>
            <span id="what-label" className="mono-label">{p.whatLabel}</span>
            <div className={s.cols}>
              {p.what.map(([title, body], i) => (
                <Reveal key={title} delay={i * 0.08} className={`${s.glass} ${s.col}`}>
                  <span className={s.stepN}>0{i + 1}</span>
                  <h2 className={s.colT}>{title}</h2>
                  <p className={s.colB}>{body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`} aria-label={p.proof[0]}>
          <Reveal className={s.inner}>
            <p className={`display ${w.proof}`}>{p.proof[0]} <span className={`block ${s.dim}`}>{p.proof[1]}</span></p>
          </Reveal>
        </section>

        <section className={s.section} aria-labelledby="steps-label">
          <div className={s.inner}>
            <span id="steps-label" className="mono-label">{p.stepsLabel}</span>
            <ol className={s.steps}>
              {p.steps.map(([title, body], i) => (
                <li key={title}>
                  <span className={s.stepN}>0{i + 1}</span>
                  <h3 className={s.colT}>{title}</h3>
                  <p className={s.colB}>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={s.section} aria-labelledby="price-label">
          <div className={s.inner}>
            <span id="price-label" className="mono-label">{p.pricingLabel}</span>
            <div className={s.prices}>
              <Reveal className={`${s.glass} ${s.price}`}>
                <span className={s.personRole}>{p.fromSite}</span>
                <span className={s.priceFig}>{euros(1500, lang)}</span>
                <p className={s.colB}>{p.fromSiteNote}</p>
              </Reveal>
              <Reveal delay={0.08} className={`${s.glass} ${s.price}`}>
                <span className={s.personRole}>{p.fromCare}</span>
                <span className={s.priceFig}>{euros(150, lang)}<span className={s.priceUnit}>{p.perMonth}</span></span>
                <p className={s.colB}>{p.fromCareNote}</p>
              </Reveal>
            </div>
            <p className={s.note}>{p.priceNote}</p>
          </div>
        </section>

        <section className={s.section} aria-labelledby="team-label">
          <div className={s.inner}>
            <span id="team-label" className="mono-label">{p.teamLabel}</span>
            <div className={s.people}>
              {people.map((m, i) => (
                <Reveal key={m.name} delay={i * 0.08} className={`${s.glass} ${s.person}`}>
                  <span className={s.mono} aria-hidden="true">{m.mono}</span>
                  <span className={s.personText}>
                    <h3 className={s.personName}>{m.name}</h3>
                    <span className={s.personRole}>{m.role}</span>
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Faq label={p.faqLabel} items={p.faq} />
        <CtaBand
          label={pg.ctaLabel} title={p.cta.title} href={book} button={p.cta.button}
          body={<>{p.cta.body} <a href="mailto:hello@ryvodigital.com" className="text-text underline underline-offset-4">hello@ryvodigital.com</a>.</>}
        />
      </main>
    </PageFrame>
  );
}
