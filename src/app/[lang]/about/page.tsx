import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { pageMeta } from "@/lib/page-meta";
import { BookButton } from "@/components/chrome/Icons";
import PageHero from "@/components/pages/PageHero";
import PageFrame from "@/components/pages/PageFrame";
import Reveal from "@/components/pages/Reveal";
import { CtaBand } from "@/components/pages/Blocks";
import s from "@/components/pages/Pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const p = getPages(lang).about;
  return pageMeta(lang, "/about", p.metaTitle, p.metaDescription);
}

// The proof line first, then the team: Martim on the automations side only,
// Phil on the websites side only, Manuel on both (plan §3.7 rule).
export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const pg = getPages(lang);
  const p = pg.about;
  const book = `/${lang}/book`;
  const manuel = { name: "Manuel Vale", role: p.roles.manuel, mono: "MV" };
  const sides = [
    { label: p.sides[0], people: [{ ...manuel, line: p.lines.manuel }, { name: "Martim Gabriel", role: p.roles.martim, mono: "MG", line: p.lines.martim }] },
    { label: p.sides[1], people: [manuel, { name: "Phil Hajjar", role: p.roles.phil, mono: "PH" }] },
  ];
  const cities = [
    { key: "lisbon-tagus", label: t.about.cities[0], alt: t.about.alt[0] },
    { key: "madrid", label: t.about.cities[1], alt: t.about.alt[1] },
  ];

  return (
    <PageFrame lang={lang} t={t} bookHref={book}>
      <PageHero
        lang={lang} t={t} path="/about" label={p.label} title={[p.proof, p.proofLabel]} dim={[1]}
        sub={<p className="m-0">{p.proofBody}</p>}
        actions={<BookButton href={book} label={t.nav.book} />}
      />
      <main>
        <section className={s.section} aria-labelledby="team-title">
          <div className={s.inner}>
            <Reveal className={s.split}>
              <div className="flex flex-col gap-4">
                <span className="mono-label">{p.teamLabel}</span>
                <h2 id="team-title" className={`display ${s.h2}`}>{p.title[0]} <span className={`block ${s.dim}`}>{p.title[1]}</span></h2>
              </div>
              <p className={s.lead}>{p.intro}</p>
            </Reveal>
            <div className={s.sides}>
              {sides.map((side) => (
                <div key={side.label}>
                  <span className="mono-label">{side.label}</span>
                  <div className={s.people}>
                    {side.people.map((m, i) => (
                      <Reveal key={m.name} delay={i * 0.08} className={`${s.glass} ${s.person}`}>
                        <span className={s.mono} aria-hidden="true">{m.mono}</span>
                        <span className={s.personText}>
                          <h3 className={s.personName}>{m.name}</h3>
                          <span className={s.personRole}>{m.role}</span>
                          {"line" in m && m.line && <p className={s.personLine}>{m.line}</p>}
                        </span>
                      </Reveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`} aria-labelledby="cities-label">
          <div className={s.inner}>
            <span id="cities-label" className="mono-label">{p.citiesLabel}</span>
            <div className={s.cities}>
              {cities.map((c, i) => (
                <Reveal as="figure" key={c.key} delay={i * 0.1} className={s.city}>
                  <picture>
                    <source type="image/avif" srcSet={`/media/about/${c.key}-420.avif 420w, /media/about/${c.key}-720.avif 720w`} sizes="(min-width: 1024px) 620px, 46vw" />
                    <img src={`/media/about/${c.key}-420.webp`} srcSet={`/media/about/${c.key}-420.webp 420w, /media/about/${c.key}-720.webp 720w`} sizes="(min-width: 1024px) 620px, 46vw" alt={c.alt} width={720} height={1080} loading="lazy" decoding="async" />
                  </picture>
                  <figcaption>{c.label}</figcaption>
                </Reveal>
              ))}
            </div>
            <p className={s.note}>{p.company}</p>
          </div>
        </section>

        <CtaBand label={pg.ctaLabel} title={pg.automations.cta.title} body={pg.automations.cta.body} href={book} button={t.nav.book} />
      </main>
    </PageFrame>
  );
}
