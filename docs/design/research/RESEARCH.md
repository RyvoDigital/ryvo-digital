# Page redesign: Step 1 research and component palette (17 Oct 2026)

Branch `design-research` (from `makeover` 982ecac). Nothing on the real site changed.
The homepage is locked and is the bar: Obsidian & Mercury, Archivo wide, Geist Mono,
liquid glass, chrome objects, calm GSAP motion. Four pages are redesigned:
**/automations, /websites, /about, /book**. The content stays as written (true claims only).
The layout and visuals are rethought.

- **Palette:** `localhost:3001/lab/palette` (dev only: 404 in production, `noindex`, linked from nowhere)
- **References:** `mobbin/` (24), `21st/` (15 previews), `pinterest/` (44, with `pinterest/INDEX.md`)
- **Sources:** Mobbin MCP (web sections), 21st.dev MCP, and Pinterest, searched in Manuel's logged-in
  Chrome (read-only: no likes, saves or follows) through Claude in Chrome.

---

## A. Findings

### What the best references share
1. **One object, lots of black.** The strongest dark pages carry each section with one lit object:
   a chrome arch, a sculpture, a ring. They avoid illustration clusters (Pinterest `automations-06`,
   `-03`, `-08`; Mobbin `a-05` Threads). We already own the language: five chrome objects
   (`public/media/objects/`). The redesign should give each automation **its own stage**.
2. **Glass only works over light.** Every convincing glass reference sits over a glow, an object or a
   photo (`automations-12`, `-14`, `-15`; `websites-08`, `-12`). Over flat #07080A, glass reads as grey
   boxes. Rule: **every glass surface gets a backdrop** (a mercury glow, an object, a texture).
3. **Numbered editorial structure replaces imagery.** Linear's `1.0` columns, Büro's giant pinned
   numeral, Studio Freight's superscripted principles, Raw Materials' pill indices (Mobbin `a-01`,
   `b-03`, `c-02`, `b-05`). This suits the no-photos, no-proof rule. Mono indices and wide display
   type carry the structure on their own.
4. **Pricing as a picker with a live receipt** (Mobbin `a-02` Cartesia, `a-03` Cofounder, `a-04` Grok,
   `a-06` V7). Toggles on the left, a sticky glass card on the right that itemises and rolls the total.
   Our pricing model (any combination, base plus add-ons) is exactly this shape.
5. **Trust without testimonials = stated trade-offs + facts as type** (Mobbin `c-01` Instrument,
   `c-05` Gumroad "Instead of…", `c-03` Webflow behaviours; Pinterest `about-02`, `-08`). Our true
   material for this is strong: AI always disclosed, price stays with your team, documented-origin
   contacts only, 3,600+ tests on every change, EU hosting with named exceptions.
6. **Booking pages that convert are two panes:** what the call is and who you meet on the left, then
   the calendar as one raised object (Mobbin `d-01` Shade, `d-02` Wellfound; Pinterest `book-02`,
   `-03`). Objections go in an accordion directly under it (`d-05` Studio Freight).

### Per page
| Page | What to take | Best references |
|---|---|---|
| /automations | A stage per automation (object + one claim), a sticky story for 01, the picker + receipt, numbered modules as the page index | Mobbin a-01, a-02, a-03, a-05 · Pinterest automations-01, -06, -09, -11, -13 · 21st abui Scroll Reveal, Alqemist Security |
| /websites | Light, editorial, wide type over architecture; services as hairline rows or an accordion; "you are looking at our work" made literal (show this site being built) | Mobbin b-01, b-02, b-03, b-06 · Pinterest websites-01, -05, -07, -10, -13 · 21st hyperiux Horizontal Feature Reveal |
| /about | Proof as giant type, principles as trade-offs, place without faces (coordinates and architecture) | Mobbin c-01, c-02, c-04, c-05 · Pinterest about-01, -03, -04, -07 |
| /book | Two panes, the calendar as one glass object, "what happens next" rail, objections underneath | Mobbin d-01, d-02, d-03, d-05 · Pinterest book-01, -02, -05, -06, -07 |

What we do **not** take: other sites' colours (red, orange, purple), people photography, logo strips,
testimonials and invented numbers. Two of the Mobbin picks show logos or testimonials; only their
layout is used. One reference's suggested "24h replies" figure is **not** a claim we can make, so it is
not used anywhere.

---

## B. Components: 21st.dev findings and verdicts

The repo has **no framer-motion and no shadcn**, so anything built on them is rebuilt in GSAP/CSS
(idea only). The free tier allowed two code reads: the educalvolpz Glass Card and paceui Liquid Glass
techniques are confirmed from their source. For the rest, the technique is read from the description.

| # | Component | Link | Use | Deps | Verdict |
|---|---|---|---|---|---|
| 1 | Glass Card (educalvolpz) | https://21st.dev/@educalvolpz/components/glass-card | Base surface everywhere | motion (springs) | **Port**: the best recipe found (see below); springs → GSAP |
| 2 | Apple Tahoe Liquid Glass Button (jahed) | https://21st.dev/@jahed/components/apple-tahoe-liquid-glass-button | Book pills | none | **Idea**: a pre-baked displacement map refracts more evenly than noise |
| 3 | Liquid Glass (paceui) | https://21st.dev/@paceui/components/liquid-glass | Cursor lens | gsap | **Idea only**: scale 80 warps too hard for calm |
| 4 | Elevate Navbar (hyperiux) | https://21st.dev/@hyperiux/components/elevate-navbar | – | gsap | Not needed: our notch nav is locked |
| 5 | Halo Toggle Group (cult-ui) | https://21st.dev/@cult-ui/components/halo-toggle-group | Call-type switch | motion | **Rebuilt** as palette 02 (CSS, no spring) |
| 6 | Bento Grid (kokonutd) | https://21st.dev/@kokonutd/components/bento-grid | Automations index | motion | **Rebuilt** as palette 05 |
| 7 | Scroll Reveal Content A (abui) | https://21st.dev/@abui/components/scroll-reveal-content-a | Pinned 3-beat story | motion | **Rebuilt** as palette 07 |
| 8 | Horizontal Feature Reveal (hyperiux) | https://21st.dev/@hyperiux/components/horizontal-feature-reveal | /websites process | gsap SplitText | **Fits**: GSAP-native, mobile stacks |
| 9 | Timeline (aceternity) | https://21st.dev/@manuarora700/components/timeline | Onboarding steps | framer-motion | **Rebuilt** as palette 08 (ScrollTrigger scrub) |
| 10 | Product Timeline (hyperiux) | https://21st.dev/@hyperiux/components/timeline | – | gsap + lenis | Our stack; we have no real dated milestones, so idea only |
| 11 | Line Draw SVG (pulkitxm) | https://21st.dev/@pulkitxm/components/line-draw-svg | Icons, dividers | ? | **Rebuilt** as palette 04 |
| 12 | Animated Signature (dqnamo) | https://21st.dev/@dqnamo/components/signature | Ryvo mark on /about | none | Optional |
| 13 | Two-Plan Diff Comparison (dhxwhy) | https://21st.dev/@dhxwhy/components/two-plan-diff-pricing-table | Websites vs care | React only | **Fits** (restyle) |
| 14 | Plan Add-on Selector (cnippet-dev) | https://21st.dev/@cnippet-dev/components/plan-addon-selector | Picker | shadcn | **Rebuilt** as palette 09 |
| 15 | Alqemist Security (jasonmohab-ali) | https://21st.dev/@jasonmohab-ali/components/alqemist-security | "How we handle data" module | ? | **Idea**: the best trust pattern; filled with true facts only |
| 16 | Liquid Metal (paper-design) | https://21st.dev/@paper-design/components/liquid-metal | Mercury backdrop shader | zero-dep, Apache-2.0 | **Fits**: a live alternative to a Kie loop behind glass; pause off-screen |
| 17 | Liquid Metal (educalvolpz) | https://21st.dev/@educalvolpz/components/liquid-metal | Same | WebGL2 | Fits (second choice) |
| 18 | Prism Hero (bevelui) | https://21st.dev/@bevelui/components/prism-hero | Refracting crystal accent | three.js | **Fits** (we ship three 0.186 already); tint silver |
| 19 | Transmission (vgpu) | https://21st.dev/@vgpu/components/transmission | Glass orb reference | WebGL | Idea |

Not found on 21st.dev: a glass modal or a glass slider. Use the glass recipe plus native `<dialog>` and
`<input type=range>`. Code still to read when the free quota resets (18 Oct): ids **12460** (jahed's
baked map) and **25977** (bevelui Prism Hero).

### The glass recipe, round 2 (17–18 Oct 2026): one shared system
Manuel's note on round 1: "It should look like premium actual glass, not slightly smudged and forced."
The round-1 recipe (noise displacement, heavy blur, soft rims) is **replaced**. One component,
`LiquidGlass` (`src/components/lab/LiquidGlass.tsx` + `glass.module.css`), now draws every glass piece:
01 card, 02 tab switch, 03/09 switch, 09 receipt, 13 FAQ, 14 CTA band, 15 dock, the timeline's card and
chips, the bento tiles and the story cards. Buttons stay the solid off-white pills (locked homepage rule).

1. **Lens refraction from a bezel profile, not noise.** Each element gets its own displacement map,
   drawn in code from its measured size and corner radius. The map uses a circular-arc squircle bezel:
   zero displacement on the flat face, rising smoothly to the rim (bezel ≈ 30% of the short side,
   10–30 px), so the image bends **only near the edge** (ref 01). It is applied with
   `backdrop-filter: url(#lens)` in Chromium, regenerated when the element resizes (ResizeObserver),
   cached by size, and attached **only while the element is on screen** (IntersectionObserver).
   Safari and Firefox get no displacement but keep every other layer.
2. **A clear centre.** Clear glass has 0–0.6 px blur and an almost-zero tint. Smoked glass (cards
   with body text) has a dark tint and 2 px blur, so text stays AA: about 7:1 for body text even over
   the brightest backdrop in the palette. No grain or noise on glass.
3. **Visible thickness.** A bevel band (5–10 px, scaled to size) in a gradient: bright top-left, in
   shade bottom-right, with a hairline where it meets the face.
4. **Crisp speculars.** A sharp 1.5 px white line rides the top curve, and a shorter one sits on the
   opposite corner. A faint prism fringe (blue above, pink below, under 0.4 alpha) is the only colour.
   They drift up to 3 px toward a fine pointer (GSAP quickTo, expo 0.8 s); off with reduced motion.
5. **Light passing through.** A glow pools on the inner bottom edge, with a bright 1.5 px line. Under
   the object sit a silver caustic pool (offset down-right, blurred) and a soft contact shadow.
6. **Backdrop rule:** glass always sits over a glow, an object or an image.

**Pieces:** the **tab switch** is a clear pill whose active thumb is a thick clear lens (magnify
0.14) gliding over the labels (expo 0.45 s). The **switch** is a clear glass pill holding a recessed
track and a **glossy solid pearl** knob that glides and stretches; it still supports drag, Space and
Enter and has a 66 × 38 target. Off rows dim to ~45% through a dark veil and dimmed content.

**Two traps found while building this** (both cost the round-1 glass its refraction without anyone
seeing it):
- Any `mix-blend-mode` layer inside the glass element stops Chromium from applying the `url()`
  backdrop filter. The caustic originally used `plus-lighter`, and round 1's rim did too. Rule: no
  blend modes inside glass.
- `opacity < 1` or `filter` on a glass element (or an ancestor) cuts its lens off from the page
  behind. Dim the content, not the glass.
- Also: in Chromium `-webkit-backdrop-filter` is an alias, so Chromium gets only the unprefixed property.

**Checked** (screens in `glass-refs/`, `compare-01-clear-pill.jpg` and
`compare-02-slabs-and-controls.jpg` put ours next to the two references):
- clear centre, no smudge or wobble: pass;
- bends only at the edge: pass (the ring and the arch bend at the pill ends and slab edges);
- edge thickness visible: pass;
- crisp top highlight: pass;
- bottom inner edge glows: pass;
- caustic pool and contact shadow: pass;
- reads as an object, not a grey layer: pass.

Chromium (Playwright and Manuel's Chrome 154) refracts. WebKit (Playwright 2368) shows clean glass
without the bend and has no console errors. Scrolling the whole palette at 1440: p95 frame 16.8 ms,
one frame at 33 ms out of 629, with only the on-screen lenses live.

### Glass round 3 (18 Oct 2026): three borderless specimens, `/lab/glass`
Manuel on round 2: "Way more elegant, minimalistic and more beautiful. I don't like the borders… it's
something you'd get for €5 at a cheap store, not a high-end Loro Piana glass item." Round 2 stacked
effects (outline, bevel band, inner hairline, double rim, fringes, caustics, glossy knob); stacked
effects read as cheap. Round 3 removes all of them. Nothing is rolled out until Manuel picks.

**What makes the references feel expensive (study: Apple HIG Materials + Liquid Glass, visionOS,
apple.com, rauno.me, emilkowal.ski, linear.app, vercel.com, arc.net, Mobbin, 21st.dev):**
1. Glass is a separate, sparing layer for controls and navigation, never decoration on content. Apple says to use it "sparingly", never stacked glass on glass.
2. The edge comes from the blur and a step in brightness against what is behind, never from a stroke. The best borderless examples (Bond, Halide on Mobbin) have no outline at all.
3. Shadows are large, soft and almost invisible: several layers at 2–6% black (Vercel's menu stack). At most one quiet highlight.
4. Legibility comes from tint (a "thicker" material where there is text), not from effects. Clear glass over bright content gets a dimming layer (Apple: 35%).
5. Motion is short and starts fast with an ease-out, `cubic-bezier(.23,1,.32,1)` at 150–300 ms (Emil, Vercel, Linear), and nothing springs. Corners are continuous and concentric with their container.

**The specimens** (`src/components/lab/Specimens.tsx`, `specimens.module.css`; one card, a two-option
tab switch, two switch rows and a chip, over the light room, the mercury glow and a chrome object):
- **A Satin:** acid-etched frost, `blur(28px) saturate(1.8)` with a whisper of white fading down; on dark backdrops it sits over a dim, thicker where there is text.
- **B Crystal:** no blur. A low-strength edge bend in Chromium (the round-2 lens, scale ≤ 0.42 × bezel, least on pills), a 35% dim on dark backdrops, and a deeper dim under body text.
- **C Smoked:** a deep dark tint over `blur(16px)`, like a watch crystal at night.

Shared rules:
- No borders, outlines, bevels, double rims or fringes.
- One highlight only: a hairline on the top edge (1 px, or 0.5 px on retina) that fades out before the corners. It is clipped inside the shape so it can never float past a squircle corner.
- Three soft shadow layers, about 4–8% on light backdrops.
- `corner-shape: squircle` (radius × 1.6) where supported, with a plain radius elsewhere.
- Plain switches: a soft filled track and a white knob with a soft shadow.
- Motion: 0.25–0.32 s on Emil's ease-out; a 1 px lift on hover.

**Checked:**
- **Contrast:** worst-case contrast for every text sample was measured against the real pixels behind it (the 98th-percentile pixel, with the text hidden). That is body, title, tab, row label and chip, in 9 cells (45 samples), and all pass AA (≥ 4.5). The two lowest are Crystal's card over the chrome object (4.71) and Satin's tab there (4.75). Two fixes came out of this measurement, not from looking: Satin needed a dim under its frost over the chrome object (it was 1.37), and Crystal needed a dim (its inactive tab label was 1.92).
- **Chromium (1440 and 390):** no console errors, no sideways scroll, 60 fps scrolling, and every label is the topmost element at its centre.
- **WebKit:** no errors and no sideways scroll. **Playwright's headless WebKit does not render `backdrop-filter` at all**, not even on a bare test page (`glass-specimens/webkit-test-backdrop-filter-not-rendered.jpg`). So its screenshots show only the no-blur fallback (tint, hairline, shadow), which still reads as intentional. The frost itself has to be looked at in real Safari. (This also means round 2's "WebKit shows clean glass" was the fallback, not the frost.)
- **WebKit layering:** a negative z-index layer inside an isolated element leaves the backdrop filter nothing to see, so the material uses neither.
- **Screens** are in `glass-specimens/`:
  - each specimen over each backdrop: `A-satin-over-room.jpg` and the rest;
  - the 3 backdrop rows side by side;
  - 3× corner crops for every specimen and backdrop: `*-corner-3x-*.jpg`;
  - the WebKit rows and one 390 shot.

### Glass round 4 (18 Oct 2026): Crystal, `/lab/glass`
Manuel picked **B · Crystal**, especially over a chrome object: "I want it to feel even more premium,
like an actual crystal… Super crispy." Target: ref-03 (`glass-refs/glass-ref-03-crystal-weather-card.png`).
`/lab/glass` now shows **B (round 3) · C1 (CSS crystal) · C2 (WebGL crystal)** over a chrome object,
the mercury glow and the light room, with round 3 kept below. Nothing is rolled out yet.

**C1 · CSS crystal** (`Crystal.tsx`, `crystal.module.css`, the lens map in `LiquidGlass.tsx`):
1. **Zero blur in Chromium:** the centre is untouched.
2. **A thick optical edge:** a lens map drawn per element from its real size and radius. The band is
   15% of the short side (30% on pills), at least 10 px. The profile is a **tapered crystal bevel**:
   zero at the rim, peaking about a third of the way in, zero on the face. The first try (strongest at
   the rim) made the backdrop jump at the edge, so a curved corner read as square. With the taper the
   backdrop flows continuously into the glass and bends inside the band, as in ref-03. Strength is 1.25
   × the band (0.9 on pills); 1.7 looked melted over chrome.
3. **Dispersion:** R, G and B are displaced separately (±1.6/S, about 0.8 px each way at the peak) and
   screened back together, so colour appears only where the image bends.
4. **The rim:** one device pixel (0.5 CSS px on retina), bright top-left, a faint counter-highlight
   bottom-right and 13–16% in between, so the curve always reads. It turns a few degrees toward the
   pointer (quickTo 0.9 s), off under reduced motion.
5. **The material:** brightness and contrast +4%, saturation +6%. On light backdrops the slab carries
   34% white, so dark type holds AA.
6. **Type and composition:** pure white type with a barely visible 1 px shadow on dark. The busy chrome
   rides the card's top edge and corner (the card keeps an empty top band, as ref-03 does), never sits
   behind body text. A soft local shade sits behind the text block only, never a blur.
7. **Fallbacks:** Safari and Firefox get no bend; they get a 1 px blur, the lift and the rim.
8. **Speed:** live lens filters only while on screen.

**C2 · WebGL crystal** (`crystal-scene.ts`): a three.js `RoundedBoxGeometry` slab with
`MeshPhysicalMaterial` (transmission 1, roughness 0, ior 1.75, thickness 0.7, dispersion 3.5) over the
same composition painted into the scene. It loads near view, pauses off-screen and in hidden tabs, caps
DPR at 2, and keeps a poster if WebGL fails. It is real optics: a thick edge, true dispersion and an
inner reflection at the corner. But it reads as a heavy dark object, can only refract what we paint
into its scene (never DOM content), and costs a WebGL context per stage.

**Two Chromium findings worth keeping:**
- A `url()` backdrop filter **is** clipped to the rounded corner (proved with a red flood). A corner
  that "looks square" over busy chrome is the bent and unbent backdrop meeting at the edge, so the
  rim's in-between light is what makes the curve read.
- A plain `<img>` or `isolation` beside the glass changes nothing. Removing the masked `<img>` was not
  the fix; the taper was.

**Checked:**
- **AA:** 48 text samples (C1 kicker, title, body, tab, row and chip; C2 title and body, over 3 backdrops
  at 1440 and 390), measured against the real pixels behind them. All pass; lowest 5.46 at 1440, 4.79 at
  390.
- **Errors and layout:** no console errors and no sideways scroll at either width. WebKit: no errors and
  no sideways scroll; headless WebKit draws no backdrop filters (see round 3), so Safari must be judged
  in real Safari.
- **Scroll:** the headless browser in this run was capped at 30 fps for every page, including the
  locked homepage (33.3 ms p50 for both). Removing C1's filters, C2's stages or B changed nothing, so the
  glass adds no measurable cost, but 60 fps could not be measured this time.

Screens are in `glass-crystal/`: each column over each backdrop, the rows, 3× corner crops, a 390
shot and the WebKit rows.

## C. Animated icons: the approach (palette piece 04)

**Chosen: inline SVG line icons, drawn with GSAP.** Stroke-dashoffset is DrawSVG's technique, and
**DrawSVGPlugin, MorphSVG and SplitText are free and already in `node_modules/gsap` 3.15**, so no new
dependency is needed.
- **Scroll-in:** each icon's strokes draw once, staggered (1.2 s, power2.inOut), when the set enters.
- **Hover and focus:** one small gesture per icon, never a bounce. 01: typing dots breathe. 02: the
  arrows turn 180°. 03: the inner ring pulses out. 04: the listing lines redraw. 05: the star draws.
- **Reduced motion:** drawn and still.

| Option | Verdict |
|---|---|
| **GSAP stroke drawing on our own SVGs (chosen)** | Zero new weight, exact to our 1.5 px line, plays with ScrollTrigger, same paths as the nav icons |
| lucide-animated (pqoqubbw/icons) | Good motion ideas, but framer-motion and Lucide's look. Borrow gestures, not code |
| Lottie | Rejected: a 60 KB+ player, JSON from After Effects, colours baked in |
| CSS-only `@keyframes` on dashoffset | Fine for hover; scroll-linked staggering is cleaner in GSAP |

The five icons in the palette are drafts drawn for this step. Once a direction is picked they get a
final pass at 20/24 px with the nav icons.

---

## D. The component palette (`/lab/palette`)

Fifteen pieces, all in the locked tokens, each live with its motion, and each simply there with
reduced motion. Files: `src/app/lab/` (own root layout) and `src/components/lab/`.

| # | Piece | Motion | Used on |
|---|---|---|---|
| 01 | Liquid-glass card | pointer specular (quickTo), refracting rim | all |
| 02 | Glass tab switch | thumb glides (expo, CSS) | /book, /websites |
| 03 | Glass switch (shared `GlassSwitch` + `SwitchRow`) | a glass lens glides over a recessed track (expo 0.45 s) and stretches in travel; mercury glow when on; drag or click; off, the whole row dims to 45% and desaturates | pricing, any on/off |
| 04 | Animated icon set (5) | draw on scroll-in, gesture on hover | /automations, /book |
| 05 | Bento grid (5 automations + weekly report) | staggered settle, object lift on hover | /automations |
| 06 | Object frame | float, pointer tilt (quickTo), crossfade | all |
| 07 | Sticky scroll story (3 beats, labelled simulated) | pinned visual, beats light, blur-in panels | /automations, /websites |
| 08 | Feature timeline (the 8 onboarding steps) | mercury rail with a light scrubbed down it; glass chips draw their icon as it arrives; the active step lifts into a glass card (pinned beside the rail on desktop, in place on phones), counter 03 / 08; passed steps quieter, upcoming dim | /automations, /websites, /book |
| 09 | Pricing module (the real formula, `lib/pricing.ts`) | receipt rows, DigitRoll total | /automations |
| 10 | Stat / proof block (3,600+ · 5 · 2) | count-up once | /about |
| 11 | Principles rows ("Instead of…") | staggered settle | /about, /automations |
| 12 | Two cities, on a globe (three.js) | turns in from the east and settles on Iberia; a lifted arc draws Lisbon → Madrid (503 km) and a light travels it; calm mouse drag | /about |
| 13 | Glass FAQ accordion | grid-rows open, plus turns | /automations, /websites, /book |
| 14 | CTA band | lines settle | all |
| 15 | Glass section dock | section index, progress ring, prev/next, Book | long pages |

Checked in a real render (Playwright, 1440 and 390): no console errors; no horizontal scroll and no
element overflowing at 390; refraction on in Chromium; pricing 01+02 = €650 / setup €1,500, matching
the locked homepage; reduced motion gives final figures, every step lit and icons drawn. Two defects
were found and fixed: the object stills have black, non-alpha grounds that showed as squares on glass
(now feathered; the real fix is an alpha cut-out, below), and the bento left an empty slot (now the
weekly-report tile).

### Fix round, 17 Oct 2026 (Manuel's three notes)
Before/after shots: `fixes/before-03-switch.png`, `before-09-pricing.png`, `before-08-timeline.png`,
`before-12-cities.png` → `fixes/after-03-switch.png`, `after-09-pricing.png`, `after-08-timeline.png`
(+ `-390`), `after-12-globe.png` (+ `-390`).

- **03 Glass switch** (`GlassSwitch`, `SwitchRow` in `Glass.tsx`; the pricing module uses the same one).
  The knob is a clear glass lens: frost, a chrome rim light, a crescent highlight, a bottom caustic, an
  inset shade and a soft shadow. In Chromium it also bends what is under it, using a **baked lens map**
  drawn on the client (the jahed technique; his code, id 12460, stays locked until the 21st.dev quota
  resets). The track is recessed and fills with a mercury glow when on. Off, the row drops to 45% opacity
  and desaturates; in the receipt, the price fades and strikes through while the total rolls.
  It has `role="switch"`, `aria-checked`, Space and Enter, a 2 px focus ring and a 44 px target, and
  touch keeps vertical scroll (`touch-action: pan-y`). Reduced motion: instant, no stretch.
- **08 Timeline:** see the table row above. The eight icons are drawn with `pathLength=1`, so the
  draw-on is pure CSS once the light reaches them. Reduced motion: every step lit, nothing pinned.
- **12 Globe** (`Globe.tsx`, `globe-scene.ts`, `globe-shared.ts`, `globe-dots.ts`): three.js 0.186,
  no new library. Land is ~38k dots baked from Natural Earth 1:50m land (public domain): even 0.3°
  spacing across the visible side, sparse on the far side, Int16 base64, 205 KB. Data and three.js load
  only within 600 px of view. Rendering pauses off-screen and in hidden tabs, DPR is capped at 2, and
  without WebGL a 2D dot poster of the settled frame is drawn. The arc is lifted and bowed slightly
  north: a pure great circle this short reads as a straight line from above. Mouse drag only (±12°,
  eases home), so touch never traps the page. Reduced motion: the settled frame, arc drawn. Measured
  scrolling past it at 1440: p95 frame 17.6 ms, worst 17.7 ms.

---

## E. The four pages: content inventory and three directions each

Every block below is in the current copy (`src/i18n/pages.ts`) or the plan's §3. Nothing new is claimed.

### /automations
**Must contain:** label and H1 ("Five automations that look after your clients, from the first contact
until after the deed.") · the sub (boutique agencies PT/ES; adapted; run on a retainer; price and
negotiation stay with your team) · Book a call + See it answer · **01–05**, each with its tagline and
points · the "switched on only after its checks" line · the weekly report ("A report, every week",
never a weekday) · the pricing picker (monthly + setup, launch pricing, excl. VAT, the two fine-print
lines) · FAQ (9; Q11 held for the contract) · closing CTA "See it working, then decide." · nav, dock or
sticky Book, footer.

| | Direction | What makes it different |
|---|---|---|
| **A1** | **The object gallery** | Five full-height chapters, one per automation, each a stage: a new hero-grade chrome object (lit, floating, pointer tilt) left, tagline + points right, alternating. 01 opens into a **sticky story** (enquiry → booked → handover). Starts with a bento index, ends with the picker + receipt. The richest, slowest, most "keynote". |
| **A2** | **The journey rail** | One continuous silver rail runs down the page, "first contact → after the deed". The five automations are stations on it, each marked by its **animated icon** (not an object), with numbered editorial type (Linear/Büro). The objects appear once, together, in a chrome "ribbon" image at the top. Calm, typographic, fastest to read. |
| **A3** | **The control room** | Bento-first. Above the fold, a glass bento over a live mercury backdrop; each tile **shows the automation working in micro-UI**: typing dots, a contact list sorting by origin, one listing in four languages, a review star. Clicking a tile expands it in place (FLIP) to its full points. Pricing sits beside the bento as a docked receipt. Dense, product-like, the most interactive. |

### /websites (light silver page)
**Must contain:** H1 "Websites for brands that sell on detail." + sub · What we do: Design / Build /
Care · the proof line "You are looking at our work. This site was designed and built by the same
team." · How a project runs (call → design → build → care) · pricing: websites from €1,500, care from
€150/month, "final price depends on scope" · who you work with: Manuel Vale + Phil Hajjar (never
Martim) · FAQ (templates? languages? + two owed answers) · CTA "Book a website call" + hello@ ·
nav/footer.

| | Direction | What makes it different |
|---|---|---|
| **W1** | **Gallery editorial** | Light gallery architecture (Kie), giant wide headline cropped by the frame (Pinterest websites-05), services as hairline-ruled columns with mono indices (websites-10), the pricing as two quiet plaques. Reads like a design studio's print catalogue. |
| **W2** | **The making-of** | The proof line made literal: a **sticky story builds this very site** as you scroll: wireframe → design → the real hero → care log. It uses real screenshots of ryvodigital.com, which is honest proof that needs no client. Then a horizontal process reveal (hyperiux) and pricing. The most persuasive with no portfolio. |
| **W3** | **Material studio** | Design, Build and Care become three material objects on fluted glass (a chrome compass, a glass slab, a polishing cloth on chrome), each in a glass card. A browser slab floats over fluted glass as the hero (websites-12). Tactile, premium, closest to the homepage's object language in light mode. |

### /about
**Must contain:** proof first: **3,600+** automated tests on every change + its body · "Built in-house.
Lisbon & Madrid." + intro (no team-size claims, no "small") · the team by side: automations (Manuel
"Founder & Engineering", Martim "Marketing & Communications"), websites (Manuel, Phil), monograms,
no photos · where we work: Lisbon, Madrid · the company line (a brand of PEDRO SEIXAS VALE -
CONSULTORIA, LDA.) · CTA.

| | Direction | What makes it different |
|---|---|---|
| **B1** | **Proof & principles** | Opens on a giant chrome **3,600+** counting up. Then "Instead of… we…" principle rows (five true trade-offs), the team as glass monogram cards split by side, and the two-cities globe (Lisbon → Madrid arc). No photography at all: pure type and chrome. |
| **B2** | **Two cities** | Architecture-led. Two full-bleed monochrome silver-toned frames, Lisbon then Madrid (new Kie set: facade + detail per city), each with mono coordinates. The proof line and team sit in glass over them; the two-cities globe opens the section as the map. Editorial and quiet, the most "place". (No claim about who sits in which city.) |
| **B3** | **The workshop** | "Built in-house" as the spine: a vertical rail of how we work (we design → build → check every change against 3,600+ tests → run and watch), each step marked by a chrome tool object. The team closes it. Engineering-honest, close to the Trust tone. |

### /book
**Must contain:** "Let's talk." + sub · the two call types (Automations: Manuel or Martim; Websites:
Manuel or Phil; `?kind=websites` preselects) · the booking UI (week, bookable days only, times with
taken ones struck through, form, confirmation) and the Google pages as fallback · email
hello@ryvodigital.com · the privacy note (Google passes name/email/answers) · the WhatsApp slot stays
hidden · nav/footer.

| | Direction | What makes it different |
|---|---|---|
| **K1** | **Calm two-pane** | Left: what the call is (30 minutes, who you meet, what we show) and the glass tab switch for call type. Right: the booking panel as one raised glass object over a mercury glow. Below: a "what happens after you book" timeline and a short objections FAQ. The safest, quickest to use. |
| **K2** | **Concierge stepper** | One centred glass card in three steps (call type → time → details) with a progress rail. Each call type shows its chrome object (the concierge bubble / a browser slab) that morphs on switch. Feels like the product itself: guided, one thing at a time. |
| **K3** | **Big type & slots** | A giant "Let's talk." with the week's slots as big glass pills right under it (Pinterest book-06), over a quiet dusk interior (Kie). The form slides in from the right after a slot is picked. The most editorial and the fewest clicks. |

---

## F. Kie.ai: balance and estimate (nothing generated)

**Balance: 945 credits** (`GET /api/v1/chat/credit`, 17 Oct 2026). 1 credit = **$0.005**. Prices come
from Kie's live pricing API (592 models), read 17 Oct. **No test generations were run** (0 credits
spent). The prices are published, and Nano Banana Pro was already chosen over GPT Image on the hero
in round 5.

**Model choices (best current, never the cheaper tier):**
| Asset type | Model | Credits |
|---|---|---|
| Chrome objects, architecture, textures (stills) | **Google Nano Banana Pro, 4K** | 24 / image |
| Alternative for typographic/abstract stills | GPT Image 2.5, 4K | 16 / image |
| Short loops (turntables, light moving on a facade) | **Google Veo 3.1 Quality, image-to-video, 1080p, 8 s** (first = last frame for a seamless loop) | 255 / clip |
| Alpha cut-outs of objects | BiRefNet, run locally (as on the hero) | 0 |
| Upscale (only if a still is used above 4K) | Topaz Image Upscaler 4K | 20 |

**Kie has no image-to-3D or mesh model.** "3D" here means rendered stills and turntable loops. Any
truly interactive 3D (like the homepage rings) is built in three.js at no credit cost.

**Budgeting rule:** each final still is budgeted at **2 takes** (the hero needed rerolls). Loops are
**build-stage only**: a mockup uses its poster still, so no video is generated for mockups.

### Assets per direction (mockup stage)
| Dir. | Assets (stills, Nano Banana Pro 4K) | # | Credits (×2 takes × 24) | Build-stage loops (Veo 3.1 Quality, ×2 takes × 255) |
|---|---|---|---|---|
| A1 | five hero-grade chrome objects, one consistent light rig (bubble, rings, key, listing sheets, pen) + a chrome "weekly report" sheet | 6 | 288 | 5 turntables: 2,550 |
| A2 | a chrome ribbon/loop panorama carrying five nodes · a mercury liquid texture | 2 | 96 | 1 ribbon drift: 510 |
| A3 | a mercury liquid backdrop (bento background) | 1 | 48 | 1 backdrop loop: 510 (or the paper-design Liquid Metal shader: 0) |
| W1 | light gallery interior · stair/handrail detail · pale stone facade | 3 | 144 | none |
| W2 | an unbranded browser slab on fluted glass · a fluted-glass texture | 2 | 96 | none |
| W3 | chrome compass · glass slab · cloth on chrome · the material trio composed as a hero | 4 | 192 | none |
| B1 | a chrome "3,600+" plinth/texture behind the figure | 1 | 48 | none |
| B2 | Lisbon facade + detail · Madrid facade + detail (monochrome, silver-toned, no people) | 4 | 192 | 1 light-across-facade: 510 |
| B3 | a chrome seal/stamp ("built in-house") · a macro brushed-chrome texture | 2 | 96 | none |
| K1 | a mercury glow backdrop for the glass panel | 1 | 48 | none |
| K2 | a browser-slab object for the websites call (the concierge bubble is reused) | 1 | 48 | none |
| K3 | a quiet dusk interior, monochrome | 1 | 48 | 1 slow light loop: 510 |
| **Total** | | **28** | **1,344** | 4,590 if every loop were built (only the chosen directions' loops would be) |

Plus, free: alpha cut-outs (BiRefNet) of the five existing object stills, so the current set works on
glass straight away.

### Against the balance
- **12 mockups: 1,344 credits** (28 stills at 2 takes each) **vs 945 available → 399 short.**
  **Top up at least 400 credits ($2.00).** Kie sells packs; the smallest pack at or above 400 covers
  it. A margin for a third take on the hardest pieces (the five A1 objects) is about +150 credits, so
  **~550 credits ($2.75)** is the comfortable figure.
- One take each (no rerolls) would be 672 credits and fit today's balance. I don't recommend it,
  because the objects need consistency across all five.
- **Build stage, later:** only the chosen direction's loops. For example A1 + W1 + B2 + K1 = 3,060
  for loops at 2 takes; A2 + W2 + B1 + K1 = 510. This is decided after the mockups.
