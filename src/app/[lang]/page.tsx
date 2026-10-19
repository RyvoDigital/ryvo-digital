import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import Hero from "@/components/home/Hero";
import NightShift from "@/components/home/NightShift";
import Calculator from "@/components/home/Calculator";
import Automations from "@/components/home/Automations";
import Demo from "@/components/home/Demo";
import HowWeWork from "@/components/home/HowWeWork";
import Trust from "@/components/home/Trust";
import Pricing from "@/components/home/Pricing";
import Websites from "@/components/home/Websites";
import About from "@/components/home/About";
import Book from "@/components/home/Book";
import LightSwitch from "@/components/home/LightSwitch";
import SiteFooter from "@/components/chrome/SiteFooter";
import StickyBook from "@/components/chrome/StickyBook";
import FloatingNav from "@/components/chrome/FloatingNav";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <div className="relative">
      <Hero lang={lang} t={t} />
      <main>
        <NightShift t={t.night} />
        <Calculator lang={lang} t={t.calc} />
        <Automations lang={lang} t={t.automations} names={t.automationNames} />
        <Demo lang={lang} t={t.demo} />
        <HowWeWork t={t.how} />
        <Trust t={t.trust} />
        <Pricing lang={lang} t={t.pricing} names={t.automationNames} />
        <Websites lang={lang} t={t.websites} />
        <About t={t.about} />
        <Book lang={lang} t={t.book} />
      </main>
      <SiteFooter lang={lang} t={t} bookHref="#book" />
      <FloatingNav lang={lang} t={t} bookHref="#book" />
      <StickyBook href="#book" label={t.pill.book} />
      <LightSwitch />
    </div>
  );
}
