import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import PageHero from "@/components/pages/PageHero";
import PageFrame from "@/components/pages/PageFrame";

export const COMPANY = {
  name: "PEDRO SEIXAS VALE - CONSULTORIA, LDA",
  nipc: "513853847",
  address: "Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
  email: "hello@ryvodigital.com",
};

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <h2 className="text-[22px] font-medium tracking-[-0.02em] md:text-[26px]" style={{ fontStretch: "110%" }}>
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-[16px] text-body [&_a]:text-text [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-text [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

// Restyled in the new system (the inner pages' opening card); the text is in
// the page's own language (components/legal/content.tsx).
export default function LegalPage({
  lang,
  title,
  lastUpdated,
  path,
  children,
}: {
  lang: Locale;
  title: string;
  lastUpdated: string;
  path: string;
  children: React.ReactNode;
}) {
  const t = getDictionary(lang);
  const p = getPages(lang);
  return (
    <PageFrame lang={lang} t={t} bookHref={`/${lang}/book`}>
      <PageHero
        lang={lang} t={t} path={path} label={p.legal.label} title={[title]} compact
        sub={
          <>
            <p className="m-0 font-mono text-[12px] uppercase tracking-[0.12em] text-steel">{p.legal.updated} · {lastUpdated}</p>
          </>
        }
      />
      <main>
        <article className="mx-auto max-w-[760px] px-5 pb-24 pt-6 leading-[1.7] md:pt-10">
          {children}
        </article>
      </main>
    </PageFrame>
  );
}
