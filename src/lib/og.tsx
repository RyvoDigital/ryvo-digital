import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { getPages } from "@/i18n/pages";
import { PRIVACY, terms } from "@/components/legal/content";

// The share image of every page in every language (1200 × 630): the site's
// near-black page with the mercury light from the upper left, the RYVO
// wordmark (the brand file), the page's label in mono and its own headline,
// the second line dimmed as on the page.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

export type OgPage = "home" | "automations" | "websites" | "about" | "book" | "privacy" | "terms";

export function ogAlt(lang: Locale, page: OgPage) {
  const { lines } = words(lang, page);
  return `Ryvo Digital · ${lines.filter(Boolean).join(" ")}`;
}

function words(lang: Locale, page: OgPage): { label: string; lines: [string, string?] } {
  const t = getDictionary(lang), p = getPages(lang);
  switch (page) {
    case "home": return { label: t.hero.eyebrow.join(" ").replace(/\/$/, ""), lines: [`${t.hero.titleA} ${t.hero.titleB}`, `${t.hero.titleC} ${t.hero.titleD} ${t.hero.titleE}`] };
    case "automations": return { label: p.automations.label, lines: [`${p.automations.title[0]} ${p.automations.title[1]}`, `${p.automations.title[2]} ${p.automations.title[3]}`] };
    case "websites": return { label: p.websites.label, lines: [p.websites.title[0], p.websites.title[1]] };
    case "about": return { label: p.about.label, lines: [p.about.title[0], p.about.title[1]] };
    case "book": return { label: p.book.label, lines: [p.book.title[0], p.book.sub.replace(/\s+[^\s]+$/, "").split(". ")[0] + "."] };
    case "privacy": return { label: p.legal.label, lines: [PRIVACY[lang].title] };
    case "terms": return { label: p.legal.label, lines: [terms(lang).title] };
  }
}

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 500; style: "normal" }[]> | null = null;
const loadFonts = () => (fonts ??= Promise.all([
  readFile(join(process.cwd(), "src/assets/og/Archivo-Display.ttf")).then((data) => ({ name: "Archivo", data, weight: 500 as const, style: "normal" as const })),
  readFile(join(process.cwd(), "src/assets/og/GeistMono-Regular.ttf")).then((data) => ({ name: "Geist Mono", data, weight: 400 as const, style: "normal" as const })),
]));

export async function ogImage(lang: Locale, page: OgPage) {
  const { label, lines } = words(lang, page);
  const cities = getDictionary(lang).footer.cities.slice(0, 2).join(" · ");
  const mark = `data:image/svg+xml;base64,${(await readFile(join(process.cwd(), "src/assets/og/ryvo-wordmark-white.svg"))).toString("base64")}`;
  // the headline as large as its length allows, never more than four lines
  const chars = Math.max(...lines.filter(Boolean).map((l) => l!.length));
  const size = chars > 46 ? 54 : chars > 34 ? 64 : chars > 24 ? 78 : 92;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#07080A", backgroundImage: "radial-gradient(900px 620px at 8% -10%, rgba(205,209,217,0.20), rgba(205,209,217,0.05) 45%, rgba(7,8,10,0) 72%), radial-gradient(700px 500px at 100% 110%, rgba(205,209,217,0.08), rgba(7,8,10,0) 70%)", color: "#F1F2F4" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={193} height={40} alt="" />
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 18, letterSpacing: 3, color: "#7E838B", textTransform: "uppercase" }}>{label}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Archivo", fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.04, maxWidth: 1040 }}>
          <div style={{ display: "flex" }}>{lines[0]}</div>
          {lines[1] && <div style={{ display: "flex", color: "#7E838B" }}>{lines[1]}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono", fontSize: 18, letterSpacing: 2, color: "#7E838B", borderTop: "1px solid #24272B", paddingTop: 22 }}>
          <span>ryvodigital.com</span>
          <span style={{ textTransform: "uppercase" }}>{cities}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
