import { getDictionary, type Dictionary } from "@/i18n";
import { getPages, type Pages } from "@/i18n/pages";
import type { Locale } from "@/i18n/config";

// Everything the page says, taken as it is from src/i18n (pages.ts
// `about`, the dictionary's footer and nav). The team rule is the live page's
// (Martim on the automations side only, Phil on the websites side only, Manuel
// on both). Each person's full bio (Read more): Manuel's and Phil's are the
// /websites team bios, word for word; Martim's is `about.martim`.
export type Bio = { lead: string; bio: string; facts: [string, string][] };
export type Person = { key: string; name: string; mono: string; role: string; line?: string; sides: [boolean, boolean]; bio: Bio };

export type AboutContent = {
  lang: Locale;
  t: Dictionary;
  p: Pages["about"];
  cta: { label: string; title: string[]; body: string };
  people: Person[];
  cities: [string, string];
  book: string;
};

export function aboutContent(lang: Locale): AboutContent {
  const t = getDictionary(lang);
  const pg = getPages(lang);
  const p = pg.about;
  const site = (name: string): Bio => {
    const m = pg.websites.team.people.find((x) => x.name === name)!;
    return { lead: m.lead, bio: m.bio, facts: m.facts };
  };
  return {
    lang, t, p,
    // The live /about closes on the same call as /automations.
    cta: { label: pg.ctaLabel, title: pg.automations.cta.title, body: pg.automations.cta.body },
    people: [
      { key: "manuel", name: "Manuel Vale", mono: "MV", role: p.roles.manuel, line: p.lines.manuel, sides: [true, true], bio: site("Manuel Vale") },
      { key: "martim", name: "Martim Gabriel", mono: "MG", role: p.roles.martim, line: p.lines.martim, sides: [true, false], bio: p.martim },
      { key: "phil", name: "Phil Hajjar", mono: "PH", role: p.roles.phil, line: p.lines.phil, sides: [false, true], bio: site("Phil Hajjar") },
    ],
    cities: [t.footer.cities[0], t.footer.cities[1]],
    book: `/${lang}/book`,
  };
}

/** The proof figure as a number, and how to print any value on the way to it ("3,600" in EN, "3600" in PT and ES). */
export function proofFigure(proof: string) {
  const to = Number(proof.replace(/\D/g, ""));
  const sep = proof.includes(",");
  return { to, format: (v: number) => (sep ? v.toLocaleString("en-US") : String(v)) };
}
