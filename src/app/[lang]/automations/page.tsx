import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import { BookButton } from "@/components/chrome/Icons";
import PageHero, { ObjectArt } from "@/components/pages/PageHero";
import PageFrame from "@/components/pages/PageFrame";
import Reveal from "@/components/pages/Reveal";
import { CtaBand, Faq } from "@/components/pages/Blocks";
import Pricing from "@/components/home/Pricing";
import s from "@/components/pages/Pages.module.css";
import hs from "@/components/home/Hero.module.css";

const OBJECTS = ["01-concierge", "02-reactivation", "03-follow-up", "04-launch", "05-deed"];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).automations;
  return pageMeta(lang, "/automations", p.metaTitle, p.metaDescription);
}

export default async function AutomationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const pg = getPages(lang);
  const p = pg.automations;
  const book = `/${lang}/book`;

  return (
    <PageFrame lang={lang} t={t} bookHref={book}>
      <PageHero
        lang={lang} t={t} path="/automations" label={p.label} title={p.title} dim={[2, 3]}
        sub={<p className="m-0">{p.sub}</p>}
        actions={<><BookButton href={book} label={t.nav.book} /><a href={`/${lang}#demo`} className={hs.textLink}>{p.see}</a></>}
        side={
          <picture>
            <source type="image/avif" srcSet="/media/loop/rings-640.avif 640w, /media/loop/rings-960.avif 960w" sizes="(min-width: 1024px) 460px, 72vw" />
            <img src="/media/loop/rings-640.webp" srcSet="/media/loop/rings-640.webp 640w, /media/loop/rings-960.webp 960w" sizes="(min-width: 1024px) 460px, 72vw" width={960} height={1068} alt="" decoding="async" className={s.objImg} />
          </picture>
        }
      />
      <main>
        <section className={s.section} aria-label={p.label}>
          <div className={`${s.inner} ${s.autos}`}>
            {t.automationNames.map((name, i) => (
              <Reveal as="article" key={name} id={`a0${i + 1}`} className={`${s.glass} ${s.auto}`} aria-labelledby={`a0${i + 1}-name`}>
                <div className={s.autoHead}>
                  <span className={s.autoNum}>0{i + 1} / 05</span>
                  <h2 id={`a0${i + 1}-name`} className={`display ${s.autoName}`}>{name}</h2>
                  <p className={s.tagline}>{p.items[i].tagline}</p>
                  <ul className={s.points}>
                    {p.items[i].points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                </div>
                <div className={s.autoArt}><ObjectArt name={OBJECTS[i]} /></div>
              </Reveal>
            ))}
          </div>
          <p className={s.note}>{p.checks}</p>
        </section>

        <section className={`${s.section} ${s.tight}`} aria-labelledby="report-title">
          <Reveal className={`${s.inner} ${s.glass} ${s.report}`}>
            <div className="flex flex-col gap-4">
              <span className="mono-label">{p.report.label}</span>
              <h2 id="report-title" className={`display ${s.h2}`}>{p.report.title[0]} <span className={`block ${s.dim}`}>{p.report.title[1]}</span></h2>
            </div>
            <p className={s.lead}>{p.report.body}</p>
          </Reveal>
        </section>

        <Pricing lang={lang} t={{ ...t.pricing, label: p.pricingLabel }} names={t.automationNames} bookHref={book} />

        <Faq label={p.faqLabel} items={p.faq} />
        <CtaBand label={pg.ctaLabel} title={p.cta.title} body={p.cta.body} href={book} button={t.nav.book} />
      </main>
    </PageFrame>
  );
}
