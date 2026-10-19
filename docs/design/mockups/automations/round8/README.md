# /lab/automations/proof, round 8 (real light, a true 60 fps turn, 19 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof              # clean (the default)
localhost:3001/lab/automations/proof?light=haze   # with the faint haze
```

Nothing else on the page changed.

## 1. The light is real
**The old glow is removed.** It was a camera-facing plane: it floated in front of the case like a sticker.

All the light now comes from one source: the slot, a segment in world space (1.56 long, at the floor's front-to-back middle). Every term below is computed from the distance to that segment in 3D, so it stays put as the camera sways and the pointer moves.

- **The slot:** the diffuser strip, warm white (one light colour everywhere, `LIGHT`).
- **Floor spill:** an analytic falloff on the floor, three exponentials by distance to the segment, dithered. It fades to exactly zero before the floor's edges, so it has no outline.
- **The object's underside:** each object is lit by the same falloff, brightest at its lowest point, and catches on its lower edges.
- **The glass:** a graze rising up the inner faces, keyed to the same segment (`uUpHalf` in `transmission-material.ts`).
- **Haze (only with `?light=haze`):** a raymarch in a box inside the case, 40 dithered steps. It widens and fades as it rises and ends below the resting object's underside, with soft ends. There are no planes and no edges.

**Default: `clean`.** The haze reads as a stage effect; in a real vitrine the air is clear, and the light shows only where it lands. The haze is there to compare.

**The flag cannot reach production.** The page calls `notFound()` in production before it reads `light`. Only `"haze"` or `"clean"` are accepted, and the production build returns 404 with or without the flag.

**Identical in both engines:** compare `webkit-*-zoom200-slot-spill` with `chrome-*-zoom200-slot-spill`. No banding at 200%.

## 2. Shadows at a true 60 fps
**What moves during a turn:** only the shading in the footage. The scene casts no shadow from the objects, so any unevenness had to come either from frame delivery or from the footage.

**Frame delivery (measured):**
- **Chrome:** the clip presents 60 frames a second and 60.5 are copied; across 121 renders, each one had exactly one new frame.
- **WebKit:** HEVC decodes at 62–63 frames a second. Its `requestVideoFrameCallback` merges frames (only 54–59 a second arrived), so the frame is now also copied on every render while the clip plays. With that, 100% of renders show a new frame.

**The footage (measured with a second temporal difference of luma, dark regions and alpha):**
- **01:** its dark face read as background around the loop seam, so the matte flickered. It is fixed from the still's own matte, clipped to each frame's outline. The alpha flicker fell from a mean of 1.09 to 0.37 (p99 10.11 → 4.32). Re-encoded as v4.
- **03:** temporal matte smoothing; alpha flicker 0.31 → 0.15. Re-encoded as v4.
- **02, 05:** already smooth, unchanged.
- **04:** the flicker came from RIFE itself. One pose jump in the source footage (frames 48 → 49) is too large to interpolate, so it ghosts. RIFE with test-time augmentation ghosted too. **04 now turns as its clean still with a gentle 3D sway**, like the side objects. Its clips are removed.

**The side objects:** they hold one frame or a still and only bob, so they are smooth at any frame rate.

**Proof:** six consecutive frames (1/60 s apart) of 01 and 05 mid-turn, WebKit on top, Chrome below: `strip-*-6-consecutive-frames.png`. The highlights and shadows move by an even step each frame, with no repeated frame and no jump.

## Checks
- `tsc` passes (app and video).
- `eslint`: 0 errors, the same 10 warnings.
- `next build` passes.
- In production, `/lab/automations/proof` returns 404, also with `?light=haze`. `/en` and `/en/automations` return 200.
- Matting this round peaked at 2.97 GB per batch, with the model kept loaded between batches.

## Screens (this folder)
- **Safari's engine (WKWebView, Safari's user agent, HEVC with alpha):** `webkit-{clean,haze}-01-concierge` … `-05-deed`, `-mid-glide`, `-zoom200-slot-spill`, `-zoom200-light-column`.
- **Chrome's engine (Chromium, VP9 with alpha):** the same set as `chrome-*`, plus whole-page shots `chrome-page-{clean,haze}`.
- **The 60 fps proof:** `strip-{webkit,chrome}-{01,05}-6-consecutive-frames.png`.

No Kie credits used.
