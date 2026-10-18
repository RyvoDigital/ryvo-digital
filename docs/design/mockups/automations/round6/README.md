# /lab/automations/proof, round 6 (final fixes, 18–19 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

Everything not listed here is as it was in round 5.

## 1. The vitrine (`vitrine-scene.ts`)
### The light: real time, not a plate
**Decision:** I kept real time. I did not generate a photographic plate: no credits were spent on one.
- **The camera moves:** it drifts with the idle sway and with the pointer. A fixed plate would freeze that parallax, and it could not follow the reflections sliding over the glass.
- **The object crosses the glass:** it refracts through real wall thickness. Over a plate, that would have to be faked.
- **Real time now looks clean** at 100% and 200% (crops in this folder).

### The movement
**The row:** the row's position is a critically damped spring, integrated exactly with the real frame time (`HeroScene.tsx`).
- No overshoot and no snap at the end of a glide.
- The same speed at any frame rate.
- A click mid-glide retargets it smoothly and keeps its velocity; a drag hands its flick velocity to the spring.

**The case and pointer:** they move through time-based smoothing, the same at any frame rate.

**The footage hand-over:**
- Every object plane is composited the same way (MAX blending), still or footage.
- Each object's footage is now **alpha-matted** (a clean cut-out).
- It takes over from the still the moment its first frame, the still's own pose, is decoded.
- After that it plays at rest and holds its frame otherwise. Nothing ever jumps back to the still.

**Tested** with a 25-second run, 12 rapid number clicks and a drag (table below).

### The light slot
- **The channel:** a 1.56 × 0.09 channel cut through the plinth's cap, with bevelled (chamfered) edges catching fine lines of light.
- **The diffuser:** a soft emissive strip set nearly flush inside it, brightest along its middle and fading at its rounded ends. At a 17° view, a deep slot would hide its diffuser behind the near wall.
- **The walls:** the slot's walls carry a faint glow.

### The light
**The uplight on the objects:** one physically shaped falloff from the slot, inverse-square-like by height and soft with distance from the slot's line. It lights each object:
- brightest at its lowest point;
- lifting what the chrome already reflects;
- catching on its lower edges.

**The beam:** a raymarched volume (32 dithered steps), wider and dimmer as it rises and fading out well below the lid. It has no edges and no flat opacity. Its box reaches below the floor: a face on the plinth top fought it for depth and striped the floor.

**The glass:** glints along its lower edges where the bevels face the light (Fresnel), and a soft gradient rising up the faces. This is a new uplight term in `transmission-material.ts`.

**Around the slot:** a gentle pool on the floor and a soft authored bloom, all drawn at full 8-bit range so no gradient shows steps.

**Tone mapping:** a filmic shoulder, so highlights roll off smoothly to white. Its toe is linear, so the page black (#07080A) matches the page exactly; ACES would crush it into a visible box.

**Sharpness:**
- One render target at full resolution with 4× MSAA, so what is seen through the glass is as sharp as what is not (round 5's was half resolution).
- Pixel ratio capped at 2.
- A near plane of 1, for depth precision.

### The case and plinth
**The lid:**
- It reads as clear glass with one soft reflection (`zoom200-case-top`).
- The overhead studio band is narrow and dim (at a grazing angle it stretches across the lid), and the clearcoat is softer.
- The inner layer stops above the floor: a vitrine has no glass floor.

**The plinth:** dark lacquered stone, honed beneath a clear glossy coat. It has a bevelled cap with the slot, a shadow-gap reveal, and a bevelled body, so each edge draws a fine line of light.

## 2. The progress under 01–05
- No hover pause.
- The loop and its progress run wherever the pointer is. Clicking a number jumps there and restarts its progress. Drag and swipe still work.
- **The only pauses:** off screen, a hidden tab, and reduced motion.
- **Checked:**
  - With the pointer parked on the scene, the fill ran from 6% to 51% in 1.5 s and the loop moved on to 02.
  - Off screen it held at 8.0% for 3 s.
  - Clicking 05 jumped there, its fill restarting at 3%.

## 3. The film (v4)
**Length and size:** 65.5 s, silent, looping, **2560 × 1600 at 60 fps**, H.264 High profile, **11.3 MB**: `brand-film-v4.mp4`, with `brand-film-poster-v4-*`.
- **One file:** H.264 plays in every browser, and alone it meets the ≤ 12 MB aim. A WebM would only add weight, so it was skipped.
- **v3 is removed** from `public/` (it stays in git).

**Why 65.5 s, over the 50–60 s target:** every caption holds for at least 0.4 s a word plus 1 s, never under 2.5 s. 01's 15-word tagline alone needs 7 s. Each moment runs 6.4–8.6 s.

**Quality:**
- Laid out at 1920 × 1200 and rendered at an exact 4/3 scale, so the type is vector-sharp at 2560.
- Rendered to a near-lossless master (CRF 16), then encoded once at CRF 26. CRF 26 matched the master at 100% (mean difference 0.37 of 255; crops checked on type, chrome edges and the mercury line).
- 60 fps throughout: all motion is written in 30-fps units, so every move gets twice the samples. The springs became eased interpolations (Remotion's spring steps whole frames).

**Bugs fixed:**
- **Every object is a clean cut-out:** each clip is alpha-matted frame by frame and composited as VP9 with alpha. There is no box, halo or shadow round the 05 pen.
  - **The matte:** BiRefNet, its alpha blended with the neighbouring frames (no flicker) and its colour un-premultiplied from the black (no fringe).
  - **The 04 cards:** their near-black glass faces were read as holes, so their enclosed regions are filled.
- **The 03 key is regenerated** (Seedance 2.5, 112 credits) and stays rigid; it no longer melts.
- **"How we work":** the statements no longer overlap; each has left before the next arrives.
- **The end-card line** now runs below the tagline, not through it.

**Craft** (Manuel's reference, the motion and not the content):
- The camera is never static: an eased push or drift in every scene.
- One mercury line threads the film:
  - it draws under "Enquiries arrive at any hour.";
  - it becomes a comet running the five objects' orbit;
  - in each moment it circles the object as a ring of light, then passes under its name;
  - it streaks through every whip;
  - it rides the two mercury wipes;
  - it underlines each statement;
  - it makes the last stroke under RYVO.
- A rim of light and a soft glow behind each object, both following its own silhouette.
- Soft bokeh for depth.
- No grain.

**The render:** the first full render hung after about a minute. Its renderer, Chrome and encoder sat idle for 56 minutes with no error.
- **Probed:** three short ranges (night, the motion-blurred orbit, the alpha footage) each rendered cleanly, so the alpha clips were not the cause.
- **The fix:** the film now renders in 10 chunks under a watchdog (`video/scripts/render-film.sh` and `render-chunk.sh`). Progress is always shown. A chunk with no new frame for 2 minutes is killed, reported and retried once with `--concurrency=1`. The chunks are joined losslessly.
- **Result:** two full renders, 10/10 chunks each, about 7 minutes, no freeze. The cause looks specific to one long render pipe, and chunking removes it.

**Memory:** the mattes ran as one short process per 20-frame batch at 768 px, half precision. The peak footprint per batch was 2.97 GB, under the 4 GB limit. The first attempt, all frames held in one process at 1024 px, had reached about 9 GB and was stopped.

## Checks
**Static checks:**
- `tsc` passes (app and video).
- `eslint` shows 0 errors and the same 10 warnings as round 5.
- `next build` passes.
- In production, `/lab/automations/proof` returns 404; `/en` and `/en/automations` return 200.

**Smoothness** (Playwright Chromium, dev mode):

| Test | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Vitrine, self-playing, 25 s (1440 × DPR 2) | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Vitrine, 12 rapid number clicks, 140 ms apart | 16.7 | 18.6 | 18.7 | 0 | 0 |
| Vitrine, a drag and release | 16.7 | 18.6 | 18.8 | 0 | 0 |
| The whole page, mouse wheel | 16.7 | 18.6 | 18.8 | 0 | 0 |
| Phone 390 × DPR 3 (renders at 2): vitrine 8 s, then the page | 16.7 | 18.7 | 18.8 | 0 | 0 |

**Fit:** one screen at every size. The marks end at 870/900 (1440), 690/720 (1280) and 762/844 (390), with no sideways scroll.

**Contrast:** 324–334 samples at 1440, 1280 and 390: **0 real fails**. The one flag is the footer's small chrome RYVO, the same gradient-text artefact as before.

**Reduced motion:**
- Nothing is hidden.
- The vitrine holds 01, still, and creates no footage.
- The film shows its poster with a play button.

**Without WebGL:** a new rendered poster of the vitrine, `vitrine-poster-v2.webp` (12.9 KB).

## Screens (this folder)
- **The vitrine:** `desktop-vitrine-01-concierge` … `-05-deed`, `desktop-vitrine-mid-glide`, `desktop-1280-vitrine`, `phone-vitrine`.
- **200% crops:** `zoom200-slot`, `zoom200-beam`, `zoom200-case-top`.
- **Film frames at full resolution (2560 × 1600):** `film-1-night-mercury-underline`, `film-2-five-automations-orbit`, `film-3-01-inbound-concierge`, `film-4-03-buyer-follow-up`, `film-5-05-after-the-deed`, `film-6-ryvo-end`.

**Kie this round:** 112 credits (one regeneration) of the 300. **Balance 758.**
