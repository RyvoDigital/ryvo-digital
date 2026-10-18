# /lab/automations/proof, round 2 (18 Oct 2026)

Manuel's review of round 1 ("Overall, well done"), applied. One version now: **crystal in the hero, mercury at the close**; there is no `?sig` switch.

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

## What changed
1. **The hero is a short film loop, never tied to scroll.** The five objects pass through a centred crystal in turn: each glides in, rests inside it for 2.8 s, then moves on, 01 → 05 and back to 01 with no seam. The first frame already shows 01 at rest. Under the crystal, a caption cross-fades with each object ("01 · Inbound concierge" plus its tagline), and the five numbers fill while each object rests.
   - **Taking over is optional:** click a number (the glide plays, never a cut); drag or swipe the scene; hover to hold it. Every move starts from wherever the row is, so a click mid-glide never jumps.
   - **Scroll:** nothing pins and nothing is hijacked; the hero fades and lifts away as it leaves. Off-screen or in a hidden tab, the loop pauses (the glide too), so coming back resumes where it left off.
   - **Reduced motion:** no autoplay; 01 rests in the crystal, and the numbers switch objects with a simple fade.
   - **Composition:** the crystal is centred and the headline frames it from two corners (first half top left, second half bottom right), with the buttons bottom left. The sub-paragraph now sits just after the hero.
   - **One screen, measured** (lowest element on screen): 1440×900 → 878 px, 1280×720 → 698 px, 1440×800 → 778 px, 390×844 → 822 px.
2. **The crystal's rim** is one clean line of light. The doubled, broken lines had three causes, all fixed:
   - the slab's top and side faces showed as thin bands, so it now sits edge-on to the camera;
   - lights in front of the slab drew a second line partway round the bevel, so every strip light now sits level with it or behind it;
   - per-pixel random jitter speckled the edge (already fixed at the end of round 1).

   The colour split is halved (0.045). The canvas is antialiased, and the back-face buffer gets 2× MSAA. Checked at 200%: `crystal-rim-200pct.png`, `crystal-rim-corner-200pct.png`.
3. **The five spreads:** one composed editorial spread each, not alternating rows. Each has a large chrome numeral, the name, the tagline as the lead line, a small object as an accent (about 220 px), and the points as an aligned grid of numbered items (two columns, or three for three points).
4. **The 01 film:** a Kie render of a logo-free aluminium display (one take), shot perfectly front-on, so the screen is an exact rectangle that the film covers with no warp.
   - **The film:** live DOM driven by one GSAP timeline, sized in container units, so its type stays sharp at any size. It is labelled Simulated and has five scenes: the enquiry arrives, the assistant answers in the buyer's language, free times appear and 11:00 is picked, the viewing lands in the calendar, and the handover card reaches Ana, the consultant who covers Cascais.
   - **The content** is all the homepage's own simulated conversation, its handover card and its example consultants.
   - **The beats** (Enquiry, Booked, Handover) sit under the screen, aligned to its edges, and light as the film reaches them; clicking one dips to black and jumps there.
   - **Playback:** it plays in view and pauses off-screen. Under reduced motion it rests on the booked frame with every beat lit.
   - **Phones** get their own composition: the film zoomed 1.6×, with the camera centring one element at a time.
5. **The close** is round 1's mercury version, unchanged.
6. **Pricing** is the homepage's own picker (`components/home/Pricing.tsx`), with a new opt-in `addOns` prop that shows each row's amount. Of the chosen rows, the one with the highest add-on shows €350 and every other row shows its +€X. The homepage, which doesn't pass the prop, is unchanged.

## Checks (Playwright Chromium, dev mode: the page 404s in production)
- `tsc`, `eslint` and `next build` pass. In production `/lab/automations/proof` returns 404; `/en` and `/en/automations` return 200.
- No console errors and no sideways scroll at 1440, 1280 and 390.
- **Smoothness** (1440 × DPR 2; frame times p50 / p95 / worst):

| | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Hero autoplay, 9 s | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Hero: three clicks mid-glide | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Hero: drag, then flick | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Hero: scroll away mid-glide, and back | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Film, 16 s, three beat jumps (one mid-jump) | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Whole page, mouse wheel | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Phone 390 × DPR 3: hero 6 s, then the whole page | 16.7 | 17.6 | 17.7 | 0 | 0 |

  CLS 0.003 (desktop and phone). During the clicks, the drag and the scroll-away, the objects never jumped: the largest per-frame step was the natural peak of a two-object glide.
  **One regression was found and fixed this round.** Once the crystal's canvas filled the whole hero (about 5.2 MP at DPR 2), the first build ran at 30 fps. It was rendering full-resolution 4× MSAA buffers, three passes and 12 samples. The refraction buffers are now half resolution (no MSAA behind, 2× on the back faces) with 8/4 samples, which brings it to 60 fps with the rim still crisp. **Not measured here:** 120 Hz, a real trackpad, Safari, a real phone.
- **Contrast:** 673 text samples (1440×900, 1280×720, 390, plus the film's booked frame) measured against the real pixels behind them. **0 fails.** Fixes this round:
  - the homepage picker's off rows (45% opacity, 1.9–4.2:1) and its fine print (4.3:1), raised **on this page only** through a wrapper (the homepage's own picker has the same fails today: worth fixing there too);
  - the 01–05 numbers over the crystal's glow;
  - the film's calendar labels, and the dimmed consultant.
- **Reduced motion:** no autoplay; the numbers switch objects; the film is paused on the booked frame with all beats lit; 0 hidden elements; no pins.

## Not done
- **The homepage notch nav:** the notch is cut out of the homepage's hero *card* (its CSS, scroll states and layout belong to that card). This hero is full-bleed, so adopting it means rebuilding the hero inside that card. That isn't simple, so the plain site nav stays, as briefed.

## Screens (this folder)
- `desktop-hero-01…05`, `phone-hero-01…05`: each object resting in the crystal. `desktop-1280-hero-01`: the one-screen check at 1280×720.
- `desktop-film-1…5-*`, `phone-film-1…5-*`: the five scenes.
- `*-intro-index`, `*-spread-01`, `*-spread-03`, `*-pricing`, `*-close`, `*-reduced-hero`, `*-00-fullpage` (final state, reduced motion).
- `crystal-rim-200pct.png`, `crystal-rim-corner-200pct.png`.

Kie: 24 credits this round (1 take of the display; the second budgeted take was not needed). See `../KIE-LOG.md`.
