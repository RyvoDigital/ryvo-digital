# Kie.ai log: /automations proof objects (18 Oct 2026)

Model: **Google Nano Banana Pro** (`nano-banana-pro`), `resolution: 4K`, `aspect_ratio: 1:1`, `output_format: png`, via `POST /api/v1/jobs/createTask`, polled with `GET /api/v1/jobs/recordInfo`. The reference image was uploaded with Kie's base64 file upload. API shape from Kie's docs (context7 `/websites/kie_ai` and docs.kie.ai/market/google/pro-image-to-image).

Cap for this job: 600 credits. **Balance before: 1,945. Used: 216 (9 × 24). Balance after: 1,729.** Balance checked before every batch.

One family: same rig prompt for 01; 02–05 were made **from 01 as the reference image** ("match the reference exactly … only the object changes"). The stray softbox strip in 01's top-left corner was painted black on the reference copy only, so the others would not repeat it.

| # | Name | Task id | Credits | Ref | Verdict |
|---|---|---|---|---|---|
| 1 | 01-concierge-a | e3aaa32dabee7c517eda25ab2ea19a79 | 24 | none | **Kept.** Liquid dark chrome, crisp streaks. A softbox strip shows in an empty corner; the cut-out drops it |
| 2 | 01-concierge-b | feb869604cfe66b74f51269298caf584 | 24 | none | Rejected: read as flat brushed aluminium, too big |
| 3 | 02-reactivation-a | 22907d3869791bbf289bd2f8754df12d | 24 | 01-a | **Kept** |
| 4 | 03-follow-up-a | d91f8cf0db66d5f1aa776a301d3e1f3e | 24 | 01-a | **Kept** |
| 5 | 04-launch-a | e08a07f3ea10ef98cb73336d90ee4559 | 24 | 01-a | Rejected: brighter and flatter than the family |
| 6 | 05-deed-a | 4c6f8f1298c1a470dce1300dd9b55211 | 24 | 01-a | Rejected: too large, cropped out of frame |
| 7 | 04-launch-b | 211b54260cdccebfe8407b977ff30f9e | 24 | 01-a | **Kept**: the dark liquid finish matches |
| 8 | 05-deed-b | 85395942f9c1528f798a24f3450dbec9 | 24 | 01-a | Rejected: a visible light beam, odd mushroom collar |
| 9 | 05-deed-c | 786e35e1264d85d8e17acb892458e09a | 24 | 01-a | **Kept** |

**Rig prompt (01):** studio product photograph; a single sculptural object of flawless mirror-polished liquid chrome, like mercury frozen mid-flow; seamless deep black (#050506), no floor; one long thin strip softbox high left for crisp streak highlights, one narrow rim light behind right; graduated silver reflections on broad faces; light sources never in frame; 100 mm, slightly above eye level, three-quarter view, object ~55% of the frame; neutral silver and black only; no bloom, flare, glare, text, logos, brand marks or people.

**Objects:** 01 a plump speech bubble with a short tail · 02 two interlocking rings · 03 a house key · 04 four fanned blank cards · 05 a fountain-pen nib with a plain grip.

**Cut-outs (free, local):** BiRefNet (`ZhengPeng7/BiRefNet`, MIT) at 1024 on Apple MPS. The HR-matting variant was tried first and rejected: it treats the dark mirror faces as see-through. Files: `public/media/proof/objects/`, AVIF + WebP at 480/800/1200 px, versioned `-v1`.

No video generated.

## Round 2 (18 Oct 2026): the display for the 01 film

Cap left for this page: 384. **Balance before: 1,729. Used: 24 (1 × 24). Balance after: 1,705.** One take was enough, so the second budgeted take was not used.

| # | Name | Task id | Credits | Ref | Verdict |
|---|---|---|---|---|---|
| 10 | display-a | f4bbeb4530cad9b58c71484ad2c0ed0b | 24 | none | **Kept.** Perfectly frontal, so the screen is an exact rectangle (2,954 × 1,654 px, 16:9) and the film needs no perspective warp. No logo or marks anywhere |

**Prompt (16:9, 4K):** a premium desktop display, an ultra-thin slab of bead-blasted silver aluminium with a slim even black glass border, on a thin aluminium stand with a flat foot; perfectly front-on at the height of the screen's centre; the screen on, showing a flat uniform mid-grey (#7F7F7F) so its edges can be measured exactly; no logo, lettering, notch, buttons or brand marks anywhere; seamless deep black; one strip light high left, a rim light behind right, a faint glow under the foot.

**Processing:** cut out with BiRefNet; the screen found from the grey (x 1277–4230, y 474–2127) and painted dark glass; cropped and exported to `public/media/proof/device/display-v1-{760,1200,1800}.{avif,webp}`. The film plays in code over the screen rectangle (left 4.404%, top 5.753%, width 91.687%, height 67.564% of the image).

## Round 3 (18 Oct 2026): the whole display, re-rendered

Cap left for this page: 360. **Balance before: 1,705. Used: 24 (1 × 24). Balance after: 1,681.** One take was enough (2 allowed).

| # | Name | Task id | Credits | Ref | Verdict |
|---|---|---|---|---|---|
| 11 | display-b | 625338b54a4dbe603ca26849135d2cf4 | 24 | none | **Kept.** The whole device in frame; an even silver edge all round; thin, even bezels; a slim stand curving to a small foot; no marks. Replaces display-a (lit on one edge only, with a boxy stand) |

**Prompt (4:3, 4K):** as round 2's, plus: the whole device fully in frame with generous black space; thin, perfectly even black borders on all four sides; a fine aluminium edge with one even highlight all the way round; a slim stand of one thin aluminium sheet curving softly to a small flat foot ("a slender, gently tapering neck, never a box"); soft even light from above and both sides.

**Processing:** not cut out this time, because BiRefNet reads the black bezel on black as background and drops it. Instead every pixel darker than the page was lifted to the page colour (#07080A), so the image needs no alpha. The screen was measured from the grey (x 725–4074, y 615–2504, 3,350 × 1,890) and painted dark. Exported as `public/media/proof/device/display-v2-{760,1200,1800}.{avif,webp}`. Screen rectangle: left 5.592%, top 7.236%, width 88.842%, height 65.196% of the 3,773 × 2,902 image.

## Round 3, corrected brief (18 Oct 2026): the MacBook for the brand film

Cap left for this page: 336. **Balance before: 1,681. Used: 48 (2 × 24). Balance after: 1,633.** (`display-b`, from the earlier draft of this round, is no longer used on the page.)

| # | Name | Task id | Credits | Ref | Verdict |
|---|---|---|---|---|---|
| 12 | macbook-a | 7ccb900629ca5362a9ed91c15d038849 | 24 | none | **Kept.** A full laptop, front-on: thin, even bezels, the notch at top centre, a thin slice of the base, no stand, no logo or lettering anywhere (the chin was checked at full size) |
| 13 | macbook-b | 8a1b8a3f98a909fac786a5e721bbb1e2 | 24 | none | Rejected: it came back on a white background. Asked for a taller screen; not needed, since take A's screen measured 16:10 within 1% |

**Prompt (16:9, 4K):** a premium ultra-thin laptop, open, perfectly front-on; thin even dark bezels; a small rounded camera notch at the top centre; the screen flat mid-grey (#7F7F7F, for exact measurement), visible area 16:10; only a thin slice of the keyboard base and hinge below the lid; no logo, lettering, stickers or ports; seamless deep black; soft even light from above and both sides.

**Processing:** the screen found as the largest grey region (its shape keeps the notch and the rounded corners), grown by 3 px past the anti-aliased edge, and made **transparent**: the film plays behind the image, so the bezels and notch sit on top of it exactly. Screen: 2,866 × 1,806 px (1.587, i.e. 16:10 within 1%). The black around it was lifted to the page colour. Exported as `public/media/lab/automations/macbook-v1-{800,1400,2000}.{avif,webp}` (with alpha). Screen hole: left 12.329%, top 7.137%, width 75.342%, height 70.437% of the 3,804 × 2,564 image.
