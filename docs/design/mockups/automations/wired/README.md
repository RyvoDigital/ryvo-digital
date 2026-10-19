# /automations, wired into the site (19 Oct 2026)

```
cd ~/ryvo-website && npx next dev
localhost:3000/en/automations   (and /pt, /es)
```

The approved proof (ac046ad) is now the real `/[lang]/automations`. It was moved, not redesigned.

## What moved
- **Components:** `src/components/lab/proof/` → `src/components/automations/`. `ProofPage` became `AutomationsPage`, and each CSS module is named after its component.
- **Media:** `public/media/automations/`, with clean names:
  - `objects/<nn-name>-<size>`;
  - `turn/<nn-name>.{webm,mov}`;
  - `film/brand-film-<lang>.mp4`, with its poster and the MacBook frame;
  - `vitrine-poster.webp`.
- **Removed:**
  - the 04 clips (04 turns as its still);
  - the unused film posters (960 px and the AVIF);
  - the `/lab/automations/proof` route.
- **Every `/lab` page** still returns 404 in production.

## Dev-only code removed
- **The `?light=haze` flag**, the haze shader and its mesh. Clean is the only light.
- **The `__vitrine` render call** used by the WebKit harness, and the frame counters behind it.

## The page's motion
- **The site's own smooth scroll now drives the page.** The proof brought its own Lenis; in the `[lang]` layout that would have been a second Lenis running against the site's.
- **So the page loads GSAP, ScrollTrigger and SplitText only,** and rides the site's Lenis.
- **The feel of the wheel is the site's:** a duration of 1.1 s on an expo curve, where the proof used a lerp of 0.11. On touch, both keep the phone's native scroll.

## Nav
- **The real `SiteNav`** at the top, in each language, plus the page's own section dock.
- **No `FloatingNav` pill:** the dock already does that job on this page, and two floating bars would duplicate it.
- **Links checked on all 21 pages (7 × en/pt/es):**
  - "Automations" goes to `/<lang>/automations`.
  - "Book a call" goes to `/<lang>/book`, except on the homepage, where it has always gone to its own `#book` section.
  - "See it answer" goes to `/<lang>#demo`, and that anchor exists.

## Footer b is the site-wide footer
`src/components/chrome/SiteFooter.tsx`, on every page.

**Legal items in the old footer (also on the live ryvodigital.com footer), every one kept, word for word:**
- the legal name: Ryvo Digital is a brand of PEDRO SEIXAS VALE - CONSULTORIA, LDA;
- the NIPC: 513853847;
- the address: Rua Tomás da Fonseca, N 26, Edifício 3, 5º Esq, 1600-256 Lisboa, Portugal;
- © 2026 Ryvo Digital, and All rights reserved.;
- the contact email: hello@ryvodigital.com (large, with copy);
- the Privacy Policy and Terms of Service links, for each language;
- LinkedIn. Footer b had dropped it in round 4; it is back as a quiet link beside Privacy and Terms, because the live footer has it.

**Labels:** in i18n (`t.footer`). The legal block stays in English, as before.

**Language links:** they keep the visitor on the same page (`/pt/websites` from `/en/websites`).

**On the light `/websites` page:** the footer keeps that page's tones. The dark fade made the legal lines unreadable there.

## Three languages
- **The page's copy** comes from `src/i18n` (`pages.automations` and its new `ui` block, plus `t.footer`).
- **English** is the approved wording.
- **PT and ES:** the page's existing PT/ES copy is used as it was. The new labels follow the same formal tone (European Portuguese; Spanish from Spain, *usted*).
- **Metadata:** title and description per language, from `pageMeta`, the same as the other pages.
- **"Illustrative figures, not a real agency"** is on the report in every language. ("Simulated" appears only in the homepage demo's caption, which is unchanged.)

## Checks
- **Static checks:** `tsc` (app and video) passes; `eslint` shows 0 errors and the same 10 warnings; `next build` passes.
- **Production routes (`next start`):**
  - home, automations, websites, about, book, privacy-policy and terms-of-service return 200 in en, pt and es (21 pages);
  - `/lab`, `/lab/automations/proof`, `/lab/glass` and `/lab/palette` return 404.
- **Homepage pricing is unchanged:** the `#pricing` section is pixel-identical before (makeover 982ecac) and after, at 1440 and 390 px. No pixel differs by more than 8 of 255. Files: `home-{before,after}-pricing-*`.
- **60 fps in Chromium:** 60.2 and 60.0 new video frames a second while an object turns (measured by pixel content), with rAF at 60.1.
- **Safari's engine (WKWebView, Safari's user agent):** it loads the `.mov` HEVC clips (01, 02, 03, 05).
  - Its frame callback reports 52.8–53.4 frames a second.
  - A bare page that only plays the same clip reports 52.2–53.9.
  - So the page loses nothing; in this harness WebKit itself reports about 53.
- **Console:** no errors on en/pt/es.
  - One warning, on every inner page, already in makeover: the homepage hero image is preloaded by Next's prefetch.
  - A full scroll in PT: every section revealed, one Lenis, the FAQ opens, no errors.

## At 390 px (reported, not redesigned)
- **The PT hero headline** wraps to six lines, which shrinks the vitrine below it (`automations-pt-hero-390`).
- **The caption under the case** (name and tagline) was mid-fade in the shot. Nothing else looked broken. There is no sideways scroll on any page checked.

## Screens
- `automations-{en,pt,es}-hero-1440`, `automations-{en,pt,es}-footer-1440`, `automations-en-{hero,footer}-390`, `automations-pt-hero-390`.
- `home-{before,after}-footer-{1440,390}`, `home-{before,after}-pricing-{1440,390}`, `websites-after-footer-{1440,390}`.
