# /lab/automations/proof, round 5 (final polish, 18 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

**One version.** Manuel's picks are now the only page: the editorial-list spreads (round 4 b) and the mercury-horizon footer (round 4 b).
- The `?crystal`, `?spread` and `?footer` switches are gone, with the unused variants' code: the crystal forms, the spread grid, the crystal footer and the old hero crystal in `stage-scene.ts`, which now holds only the mercury close.
- Approved words, in use: "Show the rest of this point", "Show less", "Copy the email address", "Copied", "Lisbon", "Madrid".
- Everything else is unchanged.

## 1. The hero: a museum vitrine (`vitrine-scene.ts`)
- **The case:** a clear glass case, 3.3 × 3.4 × 3.0, with softly rounded edges and corners (0.16 radius). The glass is round 4's:
  - transmission with real wall thickness and ior 1.5;
  - a clearcoat for bright Fresnel edges;
  - dispersion weighted to grazing angles only, so the edges and never the faces;
  - the soft softbox studio, which turns with the idle drift and the pointer, so the reflections slide over the faces.
  The inner walls add their faint reflections from inside. There is no outline.
- **The plinth:** obsidian-dark metal, softly bevelled, a little wider than the case. On its top, under the object, a thin light slot.
- **The uplight:**
  - The underside of each object catches the light from below, strongest at the bottom and gone by the top.
  - A faint cone of light rises from the slot and fades well below the lid.
  - A soft pool of light lies on the case floor.
  - All of it is quiet: the light textures are drawn at full 8-bit range and dimmed by opacity, so no gradient shows steps.
- **The camera:** a three-quarter view, 17° above and 25° from the left, so the top and the left faces read and the case clearly has an inside. It drifts a degree or two with the pointer and the idle sway. The composition is centred and fits one screen at 1440×900, 1280×720 and 390×844, keeping the round-4 spacing to the caption and the marks.
- **The motion** (still the self-playing loop, with the clickable 01–05, drag and swipe, hover to hold, and no scroll lock):
  - Each object glides along the screen's horizontal and passes into the case through its glass: through the right wall in, through the left wall out, refracted as it crosses.
  - It settles above the lit slot, perfectly crisp, and **turns slowly in the uplight**: at rest, the still hands over to the object's own Seedance footage at 0.45× speed. The footage begins on the still's exact pose, checked: the stills and the clips' first frames differ by under 0.6/255. So the hand-over is seamless.
  - It leaves the same way as the next one arrives. The objects waiting outside stay as before, dimmer.
- **How the turning object is drawn:** the crisp copy is composited with MAX blending (the GPU's "lighten"), still or footage alike. The black of the footage adds nothing, and dark chrome stays chrome; a brightness key had punched holes in dark faces. It is limited to the object's own silhouette, so the codec's faint blocks never show.
- **Footage for the vitrine:** `public/media/proof/turn/0X-v1.{webm,mp4}`, 512 px, 60–160 KB each (1.0 MB for all ten files). One clip is made only when needed; the next one is readied while the current one rests. They are never loaded under reduced motion.
- **Performance:**
  - One render target (half resolution, 2× MSAA).
  - Pixel ratio capped at 2 (phones at DPR 3 render at 2).
  - 11 draw calls.
  - Rendered from gsap.ticker only while on screen. The clip pauses off-screen and holds its time (checked: playing at rest, paused at 0.3 s when scrolled away, playing again on return).
  - Without WebGL, a rendered poster of the vitrine (`public/media/proof/vitrine-poster-v1.webp`, 12 KB; checked with WebGL forced off).
  - Reduced motion: 01 resting in the lit case, still, with no footage.

## 2. The intro under the hero
The paragraph now uses the homepage's own `WordReveal` and `Words` (the same component and timing): each word lights from #2A2D32 to #F1F2F4 as it scrolls through.
- **Checked mid-scroll:** 10 words lit, 24 still dark, the rest in between.
- **Reduced motion:** fully lit (checked: every word computes as #F1F2F4).

## 3. The film (v3)
- **Footage:** 03 (the key) and 05 (the pen) are now Seedance 2.5 image-to-video clips from our stills, made like 02 and 04 (480p, 4 s, first frame = last frame). The 3D models and `@remotion/three` are removed.
  - **Price checked first:** 28 credits/s at 480p, so 112 each and **224 in all** of the ~360 budget. Logged in `../KIE-LOG.md` (#17, #18).
  - Both loop; the first and last frames differ by 2.8/255 and 0.8/255.
- **Files:** 34.6 s, the same cut, captions and rhythm.

| File (`public/media/lab/automations/`) | Size |
|---|---|
| `brand-film-v3.mp4` (H.264, CRF 29) | 2.57 MB |
| `brand-film-v3.webm` (VP9, CRF 46) | 2.12 MB |
| `brand-film-poster-v3-{960,1920}.{avif,webp}` | 9–26 KB |

  The v2 files are removed from `public/` (they stay in git).
- **Frames:** `film-1-any-hour`, `film-2-01-inbound-concierge`, `film-3-03-buyer-follow-up`, `film-4-05-after-the-deed`.

## Checks
**Static checks:**
- `tsc` passes (app and video).
- `eslint` shows 0 errors and 10 warnings: the 9 existing ones, plus the same `<img>` warning for the vitrine's poster.
- `next build` passes.
- In production, `/lab/automations/proof` returns 404; `/en` and `/en/automations` return 200.

**Smoothness** (Playwright Chromium, dev mode):

| Test | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Vitrine, self-playing loop, 13 s (1440 × DPR 2): glides, rests, footage turning | 16.7 | 17.6 | 17.8 | 0 | 0 |
| Vitrine, hover, then three clicks mid-glide | 16.7 | 17.7 | 17.8 | 0 | 0 |
| Vitrine, a drag | 16.7 | 17.7 | 17.8 | 0 | 0 |
| The whole page, mouse wheel | 16.7 | 17.7 | 17.8 | 0 | 0 |
| Phone 390 × DPR 3 (renders at 2): the vitrine 7 s, then the page | 16.7 | 17.7 | 17.8 | 0 | 0 |

**Contrast:** 324–334 text samples at 1440, 1280 and 390, measured in the read state: **0 real fails.**
- The one flag is the footer's small chrome RYVO, the same gradient-text artefact as in rounds 3 and 4 (its CSS colour is transparent).
- The lit intro words are #F1F2F4 on #07080A, 18.4:1.

**Reduced motion:**
- 0 hidden elements.
- No autoplay: the vitrine holds 01 and no footage is created.
- The film shows its poster with a play button.
- The intro is fully lit.

## Screens (this folder)
- **The vitrine:** `desktop-vitrine-01-concierge` … `-05-deed` (each object inside), `desktop-vitrine-mid-entry` (the pen leaving through the left wall as the bubble enters through the right), `desktop-1280-vitrine`, `phone-vitrine`, `desktop-vitrine-no-webgl-poster`.
- **The intro mid-reveal:** `desktop-intro-mid-reveal`, `phone-intro-mid-reveal`.
- **Spreads and footer:** `desktop-spread-01`, `desktop-spread-03`, `desktop-footer`, `phone-spread-01`, `phone-spread-03`, `phone-footer`.
- **The film:** the four `film-*` frames.

**Kie this round:** 224 credits. **Balance 870.**
