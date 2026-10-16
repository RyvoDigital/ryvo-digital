import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { BookButton } from "@/components/chrome/Icons";
import PageHero, { ObjectArt } from "./PageHero";
import PageFrame from "./PageFrame";
import s from "./Pages.module.css";

// The 404, in the page's language: links to both sides and Book a call.
export default function NotFoundView({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const p = getPages(lang).notFound;
  const book = `/${lang}/book`;
  return (
    <PageFrame lang={lang} t={t} bookHref={book}>
      <PageHero
        lang={lang} t={t} path="" label={p.label} title={p.title} dim={[1]}
        sub={<p className="m-0">{p.body}</p>}
        actions={
          <span className={s.links}>
            <Link href={`/${lang}/automations`} className="btn-ghost">{p.automations}</Link>
            <Link href={`/${lang}/websites`} className="btn-ghost">{p.websites}</Link>
            <BookButton href={book} label={t.nav.book} />
          </span>
        }
        side={<ObjectArt name="404" eager />}
      />
    </PageFrame>
  );
}
