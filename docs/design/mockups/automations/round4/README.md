# /lab/automations/proof, round 4 (18 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof?crystal=a&spread=a&footer=a
localhost:3001/lab/automations/proof?crystal=b&spread=b&footer=b
```

Each switch is independent (`?crystal=b&spread=a&footer=b` works too); anything else falls back to `a`.

Unchanged, as asked: the report, the pricing, the mercury close, the smoothness rules and the MacBook device. The approved copy (the film captions, "What Ryvo builds", the point titles, "09 · Questions", the footer column labels) is used as approved.

## 1. Hero: the crystal
**Both forms:**
- **Material:** physically based, in the scene's own transmission pass. It has ior 1.5 and real thickness (0.85 for a, 1.5 for b), and a clearcoat whose Fresnel makes the polished bevels bright at grazing angles while the face stays clear.
- **Studio:** a soft studio of large feathered softboxes (`softStudio()` in `stage-scene.ts`), in place of the thin strips that drew an outline round the edge. A key box sits high left, an overhead box lights the top face, a tall box behind right lights the right bevel, and a broad dim fill plus a soft band behind the camera light the front face.
- **Moving reflections:** the environment turns with the idle sway and with the pointer, so the softbox reflections sweep across the faces.
- **Camera:** 6.5° above the crystal, so its top face and thickness read. The objects inside are tilted to face it.
- **Dispersion:** the colour split is weighted by grazing angle, `(1 − |n·v|)²`, so it shows only on the bevels and the flat face has no fringes.
- **Kept:** the soft caustics and the floor reflection, drawn only in the final pass. There is no outline.
- **Breathing room:**
  - The crystal steps back on short screens: the camera distance scales with height.
  - Caption to marks: 22 px (was 14). The caption block sits 30 px from the bottom.
  - Free space from the crystal's floor reflection to the caption: about 90 px at 1440×900 and about 40 px at 1280×720.
  - One screen still: the marks end at 870/900 (1440), 690/720 (1280) and 762/844 (390).

| | Form |
|---|---|
| `?crystal=a` | The tall slab, perfected: 3.0 × 3.75, 1.0 deep, 0.3 bevels. Upright, so its top face shows. |
| `?crystal=b` | **A thick rounded cube**: 3.15 square, 2.1 deep, 0.62 radius, turned 7° so one side face and its depth show. More sculptural; the bevels catch far more light. |

**Pick: b.** It reads as an object, not a pane: the depth, the side face and the bright rounded bevels all show at a glance, and the objects inside look held by glass.

## 2. The brand film (v2)
**Specs:** 34.6 s, silent, looping, 1920 × 1200, 30 fps. Same story and approved captions. Sources are in `video/src`, rendered with Remotion 4.0.536.

**Rhythm:** an imagined 106 bpm (17 frames a beat): a fast montage for the five, then a slower breath for "how we work".

**Footage:** real Seedance 2.5 image-to-video for **01, 02 and 04**, 539 credits (see `../KIE-LOG.md`). Five clips at the measured price (about 1,575) would have broken the 600 cap, so **03 (the key) and 05 (the pen) are modelled in 3D** with `@remotion/three`: dark mirror chrome in a softbox studio, every motion from the frame number.

**The sequence:**
1. **The night (9 beats):**
   - An odometer clock rolls from 21:52 to 23:47 while messages arrive on three planes of depth (the far ones soft and slow; parallax).
   - A slow camera push.
   - "Enquiries arrive at any hour." arrives word by word, each word out of focus and settling.
2. **A liquid mercury wipe** rises over the frame: a moving wave with a chrome edge. The outgoing scene sinks back and dims.
3. **Five automations (8 beats):**
   - The letters rise one by one.
   - The five objects swoop in, motion-blurred (`CameraMotionBlur`), and orbit the words, passing behind them (small, soft) and in front (large, sharp).
4. **The five moments (6 beats each)**, joined by **whip pans** (a horizontal motion blur):
   - Each object arrives out of focus in front of its own giant outlined numeral, which drifts the other way (parallax).
   - A band of light sweeps over the object.
   - The name rises letter by letter and the tagline arrives word by word.
5. **A second mercury wipe**, then **how we work (17 beats):** the four statements, each racked into focus and out again, over one far, defocused chrome object drifting behind the type. Four ticks mark the place.
6. **A light sweep** into **RYVO (7 beats):**
   - The four letters assemble out of focus.
   - One sweep of light crosses the chrome.
   - The line beneath tightens its tracking.
   - The frame goes to black, so the loop is seamless.

Throughout: one slow silver glow drifts behind everything, with a faint vignette, a very fine grain, and three soft silver light leaks riding the wipes and the end.

| File (`public/media/lab/automations/`) | Size |
|---|---|
| `brand-film-v2.mp4` (H.264, CRF 29, x264 slow) | 2.53 MB |
| `brand-film-v2.webm` (VP9, CRF 46) | 2.14 MB |
| `brand-film-poster-v2-{960,1920}.{avif,webp}` (frame 215, "Five automations") | 9–26 KB |

That is **4.7 MB in all**; a visitor loads one of the two films. The v1 files are removed (they remain in git history). Frames: `film-1…7-*.webp` in this folder.

**Remotion licence:** the company has 3 or fewer people, so Remotion's free licence applies (per Manuel, 18 Oct 2026).

## 3. The spreads
**Both variants:**
- No per-point numbers and no heavy rule under every item.
- Titles in the brand display face (Archivo, width 118%) at 20–24 px; descriptions softer (#a3a8af) and smaller, two or three lines.
- **Long points:** a point over 140 characters with more than one sentence shows its first sentence; a small ⊕ shows the rest, inline and word for word (1·4, 2·2, 3·2). 1·5 is a single sentence, so it is shown whole (cutting it would change it).

| | Layout | Motion |
|---|---|---|
| `?spread=a` | A clean three-column grid with 56 px gaps. A point that still shows over 140 characters (1·5) spans two columns. Rows fill in reading order and never leave a hole. One column on phones. | A quiet rise in reading order. |
| `?spread=b` | An editorial list: each title large (24 px) on the left, its words on the right, a thin hairline between rows. On phones, the title above its words. | A slow stagger: each hairline draws, then its row rises (0.2 s apart). |

The numeral, name, lead and object keep their own entrance per spread.

**Pick: b.** It is the calmer read: the titles scan like a contents page and every description has a full line length. It is longer (about 260 px more per spread on desktop). If length matters more, a is the compact choice.

## 4. The footer
**Both variants:**
- No floating scroll-to-top button and no LinkedIn.
- **The legal block is the landing page's own:** the same `LEGAL` text and the same privacy and terms links.
- **The email:** large and copyable, with a copy button that says "Copied".
- **Local time:** live clocks for Lisbon and Madrid, set in the browser after load.
- Pages, the language switch and Book a call.

| | Footer |
|---|---|
| `?footer=a` | **The crystal.** RYVO set very large in clear crystal: a glass body with a fine bevel line. A soft light follows the pointer across it and the edges catch the light where it passes, with a faint spectrum. On entry it rises and one sweep of light crosses it (the light a touch screen sees). |
| `?footer=b` | **The mercury horizon.** The email as very large type above a living line of liquid mercury the width of the page: a chrome stroke with a moving sheen, a soft glow and a faint pool beneath. It draws out from the centre on entry and moves only while on screen. A small chrome RYVO sits below. |

**Pick: a.** The page already closes on mercury just above, so footer b would repeat it. The crystal wordmark answers the hero's crystal, so the page opens and ends on the same material.

## For approval: new words
- `Show the rest of this point` / `Show less`: the accessible names of the ⊕ on long points.
- `Copy the email address`: the copy button's name.
- `Copied`: shown for 2 s after a copy.
- `Lisbon` / `Madrid`: the clock labels, from "Lisbon & Madrid".
- `Contact`: the label above the email (round 3's approved column label, reused).

No new film captions.

## Checks
**Static checks:**
- `tsc` passes (app and video).
- `eslint` shows 0 errors; its 9 warnings are the same 9 as on the previous commit.
- `next build` passes.
- In production, `/lab/automations/proof` returns 404 (with and without the variant parameters); `/en` and `/en/automations` return 200.

**Smoothness** (Playwright Chromium, dev mode):

| Test | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Hero a, 1440 × DPR 2: autoplay, hover, two clicks mid-glide | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Whole page a, mouse wheel | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Hero b, same | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Whole page b, mouse wheel | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Phone 390 × DPR 3, set a: hero, then the page | 16.7 | 17.7 | 17.7 | 0 | 0 |
| Phone 390 × DPR 3, set b | 16.7 | 17.7 | 17.7 | 0 | 0 |
| The v2 film playing, 8 s (WebM served) | 16.7 | 17.7 | 17.7 | 0 | 0 |

**Contrast:** about 290 text samples per run, at 1440, 1280 and 390, for both variant sets.
- **One real fail, fixed:** the closing label "NEXT STEP" (steel) measured 3.4:1 where the mercury's reflection of the bubble passed under it. It is now silver: about 8.6:1 over the same pixel.
- **One artefact, set aside as in round 3:** footer b's small chrome RYVO (its CSS colour is transparent; it is drawn with a gradient whose darkest stop is about 6.5:1, and it is large text).
- Footer a's crystal wordmark is a decorative layer inside a labelled link (aria-hidden).

**Reduced motion** (both sets):
- Every element is visible: 0 hidden.
- No hero autoplay.
- The film shows its poster with a play button.
- The mercury horizon is drawn still.

**WebGL:** still lazy and paused off-screen, with posters as the fallback (unchanged).

## Screens (this folder)
- **Hero:** `desktop-hero-crystal-{a,b}`, `desktop-1280-hero-crystal-{a,b}`, `phone-hero-crystal-{a,b}`
- **Spreads:** `desktop-spread-{a,b}-{01,03}`, `phone-spread-{a,b}-{01,03}`
- **Footers:** `desktop-footer-{a,b}`, `phone-footer-{a,b}` (desktop a is shown with the pointer over the V)
- **Film:** `film-1-any-hour` … `film-7-ryvo` (seven frames)

**Kie this round:** 539 credits (three Seedance clips) of the 600 for footage, and 0 of the 100 for anything else. **Balance 1,094.**
