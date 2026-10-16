# Ryvo homepage — approved design brief (16 Oct 2026)

Manuel approved **homepage v2** on the design canvas. This folder is the hand-off for the build.

## Files in this folder
- `homepage-v2-desktop.dc.html` / `homepage-v2-mobile.dc.html`: the approved design. These files are design-canvas source and will not run on their own: `support.js` and `<x-dc>` are canvas runtime. Read the markup and inline styles as the visual spec. `{{…}}` values and `<sc-for>`/`<sc-if>` are template bindings. Their logic (the 5-language chat strings, the calculator formula, the pricing tiers) is in the `<script type="text/x-dc">` block at the bottom.
- `references/ref-01…09.png`: Manuel's 9 inspiration references. Take their **layout, depth, light and motion ideas**. Do NOT take their colours (red/orange), their people photography or their fake stats.
- `../website-makeover-plan.md`: the full content plan (copy, site map, PT/ES notes, SEO, booking, analytics). The copy in the v2 design overrides the plan where they differ.

## Locked decisions
- **Palette "Obsidian & Mercury"**: obsidian `#0B0C0E`, page `#07080A`, surface `#131418` / `#1C1E22`, lines `#24272B`, silver `#CDD1D9`, steel `#7E838B`, text `#F1F2F4`, body `#C4C8CE`, phone edge `#4A4E54`. Mercury chrome gradient: `linear-gradient(135deg,#FAFBFC 0%,#A9AEB6 38%,#EEF0F2 58%,#8E939B 100%)`. Silver glow: `radial-gradient(… rgba(205,209,217,0.12–0.20), transparent 70%)`. The Websites section switches to light mode (`#EEF0F2` ground, `#0B0C0E` text).
- **Type (free, Google Fonts)**: Archivo variable (`wdth 62..125, wght 300..800`). Headlines use `font-stretch: 112–116%`, weight 500, letter-spacing −0.035 to −0.05em, line-height 0.92–1.02. The wordmark uses stretch 125%, weight 700. Body is Archivo at normal width, 15–17px, line-height 1.6. Labels use **Geist Mono** 10–12px with 0.12–0.14em tracking. Numbers use tabular figures. Remove the old Geist body font.
- **Chrome is used sparingly**: on a few headline words, the big numbers, the hero/footer RYVO and the "Qualify" pill. **Buttons are solid off-white `#F1F2F4` pills with a small dark arrow circle, kept small** (about 38px tall desktop, 46px mobile). Manuel said earlier versions were far too big.
- Languages: the site is PT/EN/ES (`/pt /en /es` + hreflang). The assistant is described as replying in PT/EN/ES/FR/DE.
- Prices: "from" €350 / €650 / €1,200 per month, labelled "launch pricing", plus "Get a tailored quote". Websites from €1,500, care from €150/month. No setup fee is shown.
- Team: automations side, Manuel Vale (Founder) and Martim Gabriel (Marketing & Communications). Websites side, Manuel Vale and Phil Hajjar. No people photos for now.
- Booking: two Google Calendar appointment schedules (automations call / websites call), replacing Calendly.
- **Legal footer kept exactly** as it is now (company, NIPC, address, privacy and terms links).

## Section order (homepage)
1. **24-hour ruler** above the hero (ticks 00–24, marker at 23:47, "23:47 · ANSWERED").
2. **Hero card** (rounded 34px). Headline top-left, paragraph and buttons top-right, small mono corner labels. A giant chrome-fade RYVO sits behind the **3D hand + phone** (the phone overlaps the letters). One glass chip reads "Viewing booked · Thu 22 Oct · 11:00". A silver glow spills out of the card onto the page.
3. **Panel under the hero**: a slightly lighter panel tucked under the card, fading to the page. It holds the 01–05 automation names. (Manuel's note 1: keep the card's rounded bottom crisp, with a soft shade transition below.)
4. **"The night shift"**: a staggered headline with an inline typing-dots pill, then the row of big pills: Answer · Qualify (chrome) · → · Book.
5. **Calculator as a sentence**: the numbers are typed inline into underlined fields. A huge chrome "€ at risk every month" figure follows, labelled as an estimate.
6. **01 / Automations**: the **3D chrome loop** on the left, the [01]–[05] accordion on the right (01 open).
7. **02 / See it answer**: a timeline with a thin line, plus the chat demo with a 5-language switch. The demo is labelled "Simulated conversation".
8. **03 / How we work**: three steps on the left. On the right, an object panel showing a **crafted weekly-report email** ("Your week with Ryvo", clearly labelled example figures). It says "every week". Never name a weekday.
9. **04 / Trust, shown not claimed**: three rules, each proven by a mini chat (a price question goes to a consultant; "I'm the agency's AI assistant"; asking for a person). Then one quiet line: EU hosting, PT/ES consent rules, licence number.
10. **05 / Pricing**: one 3-stop control (Start / Core / Full journey). The big "from" price and the "Included" list update together.
11. **06 / Websites**: the page fades from dark to light silver. Headline "Websites, made by hand.", prices, a browser and phone mock with Kie.ai architecture imagery.
12. **07 / About**: the page fades back to dark. "Small by choice. Lisbon & Madrid." Two Kie.ai architecture tiles (Lisbon, Madrid).
13. **08 / Book a call**: the Google Calendar booking in a glass panel.
14. **Footer**: links, a giant full-width chrome RYVO (bookend to the hero), then the legal line.

## Manuel's notes (must all be done in the build)
1. A shade under the hero that flows into the next section, with no hard edges between sections. The whole site should feel **fluid**, with each section transitioning seamlessly into the next.
2. The five-automation loop **and every diagram** must be truly premium 3D (Kie.ai), not CSS rings.
3. The button shine must not feel forced. Keep buttons solid, calm and small. Any shine is a subtle hover-only highlight.
4. The phone must be a premium 3D render (Kie.ai): a hand holding a modern phone. **No Apple logo or any brand marks.**
5. "How we work" and "Trust" need real, elegant motion (see Motion).
6. Pricing and every other section must feel elevated. Use the spacing in v2, and keep crowded spots minimal and clean.

## Elite-level additions (do these too)
- **The thread**: one hairline silver line that draws itself on scroll. It starts at the 23:47 marker, runs down the page, becomes the 3D loop, then the demo timeline, then the How-we-work step rail. This is the signature that ties every section together.
- **Film grain**: a 2–3% animated noise overlay on the dark areas, so the black feels like material, not flat screen.
- **Sticky booking pill**: after the hero, a small glass "Book a call" pill appears bottom-centre. It hides over the booking section and the footer.
- **The hero chat types live**: the chat overlaid on the Kie.ai phone video types itself in, in the visitor's site language.
- **Count-ups**: the calculator result and prices roll to their new value with tabular figures (never jumpy).
- **Scroll-scrubbed light switch**: the dark → light → dark transition around Websites follows scroll position, not a fixed gradient.

## Motion (GSAP + ScrollTrigger + Lenis are already in the repo)
- Smooth scroll (Lenis), with ScrollTrigger for scrubbed and pinned scenes. Ease is a soft expo-out. Durations are 0.6–1.2s. Nothing bounces.
- Hero: the wordmark rises from a soft blur, the phone eases up from the glow, and the chat types itself.
- Night shift: the headline reveals line by line, and the pills slide in one after another as the arrow passes.
- Automations: the 3D loop turns with scroll. The node for the open accordion row lights up.
- How we work: the section pins. Steps 01→03 change in place, and the object panel morphs (calendar → supervised chat → weekly report).
- Trust: each mini chat plays its two bubbles when its row enters view.
- Pricing: the control slides and the included rows light up in sequence.
- Respect `prefers-reduced-motion`: everything becomes simple fades with no pinning.

## Assets to generate with Kie.ai (the key is in the env, placed by Manuel)
- Hero: a cinematic hand holding an unbranded modern phone with a **plain dark screen** (the chat is overlaid in code). Silver rim light on obsidian, slight drift. Supply a short seamless loop video plus a still poster.
- Automations: a 3D polished-chrome loop/torus with 5 subtle nodes on obsidian, as a turntable sequence or a model that can be scrubbed.
- Websites: an architectural image for the browser mock (light, gallery-like).
- About: Lisbon and Madrid architecture, monochrome silver-toned. No people.
- Any other diagram gets the same chrome-on-obsidian 3D language.
- Optimise everything: hero video ≤ 2.5 MB (AV1/H.264 fallback), AVIF/WebP stills, lazy-load below the fold.

## Honest-claims rules (never break)
- No fake stats, testimonials, client logos or "trusted by". No client proof at all for now.
- Data is hosted in the EU. The AI provider and Twilio process some data outside it under GDPR safeguards. Never promise backups.
- The demo and the report are labelled simulated/example. Never name a weekday for the report.
- No Apple branding anywhere.

## Quality bar
- LCP < 2.0s on 4G. No preloader (the old site's stuck "0%" loader waited for 66 MB of frames, so it is gone). CLS ≈ 0.
- Mobile first: 16px gutters, no horizontal scroll, touch targets ≥ 44px.
- Accessibility: visible focus rings, labelled inputs, AA contrast.
