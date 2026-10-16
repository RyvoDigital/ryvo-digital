import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import SiteNav from "@/components/chrome/SiteNav";
import SiteFooter from "@/components/chrome/SiteFooter";

export const COMPANY = {
  name: "PEDRO SEIXAS VALE - CONSULTORIA, LDA",
  nipc: "513853847",
  address: "Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal",
  email: "hello@ryvodigital.com",
};

const IN_ENGLISH: Record<Locale, string | null> = {
  en: null,
  pt: "Esta página está disponível apenas em inglês.",
  es: "Esta página solo está disponible en inglés.",
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

// Restyled in the new system; the legal text itself is unchanged and English in
// every language (marked as such on /pt and /es).
export default function LegalPage({
  lang,
  title,
  lastUpdated,
  children,
}: {
  lang: Locale;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const t = getDictionary(lang);
  const note = IN_ENGLISH[lang];
  return (
    <>
      <header className="px-[18px] pt-[14px] md:px-6 md:pt-7 lg:px-11">
        <SiteNav lang={lang} t={t} bookHref={`/${lang}#book`} />
      </header>
      <main>
        <article lang="en" className="mx-auto max-w-[760px] px-5 pb-24 pt-20 leading-[1.7] md:pt-28">
          {note && (
            <p lang={lang} className="mb-8 rounded-2xl border border-line bg-surface px-4 py-3 text-[14px] text-body">{note}</p>
          )}
          <p className="mono-label">Last updated · {lastUpdated}</p>
          <h1 className="display mt-6 text-[clamp(44px,7vw,76px)]">{title}</h1>
          {children}
        </article>
      </main>
      <SiteFooter lang={lang} t={t} />
    </>
  );
}
