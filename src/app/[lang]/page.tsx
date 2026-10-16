import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import Hero from "@/components/home/Hero";
import NightShift from "@/components/home/NightShift";
import Calculator from "@/components/home/Calculator";
import SiteFooter from "@/components/chrome/SiteFooter";
import StickyBook from "@/components/chrome/StickyBook";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Hero lang={lang} t={t} />
      <main>
        <NightShift t={t.night} />
        <Calculator lang={lang} t={t.calc} />
        {/* Next stage: 01 Automations · 02 See it answer · 03 How we work · 04 Trust ·
            05 Pricing · 06 Websites · 07 About · 08 Book a call */}
      </main>
      <SiteFooter lang={lang} t={t} />
      <StickyBook href="#book" label={t.pill.book} />
    </>
  );
}
