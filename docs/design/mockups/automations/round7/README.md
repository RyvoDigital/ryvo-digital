# /lab/automations/proof, round 7 (four hero fixes, 19 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

## ⚠ Not done: screenshots from the real Safari and Chrome apps
I tried this overnight, in the real apps as the brief asks. It could not be done without Manuel:
- **The screen was locked**, and with it locked macOS treats every window as hidden.
- **This process has no screen-recording permission**: `screencapture` fails with "could not create image from display", and the permission check returns false.

Unlocking and granting that permission need him.

**What was done instead:**
- **Safari's own engine:** a small Swift program drives the system WebKit (`WKWebView`: the framework Safari 26 is built on, with the same media decoders, HEVC with alpha included) with Safari's exact user agent.
- **Rendering each frame:** with the screen locked, WebKit's animation loop is paused, so each frame is rendered through a dev-only call, `__vitrine.shot(p)`. It places the row, seeks the clips mid-turn, renders and returns the canvas. That is the same WebGL scene Safari draws.
- **Chrome:** Playwright's Chromium, Chrome's engine.

**For Manuel, in the morning:** open the page in Safari and Chrome. The `webkit-*` files are the scene as Safari's engine draws it, without the page text around it.

## 1. Clean cut-outs in every browser
**The cause of the blotchy box:** Safari ignores VP9's alpha, so it fell back to the footage on black, and that video's dark, noisy ground showed inside the lit case. There was a second, hidden cause, found and fixed here: **WebKit also drops HEVC's alpha when a video is uploaded straight to WebGL**, though it keeps it when the frame is drawn into a 2D canvas.

**Now:**
- **Formats:** Safari plays **HEVC with alpha** (`.mov`, hvc1, from `hevc_videotoolbox` with `-alpha_quality 0.9`, encoded from the PNG alpha frames). Chrome and Firefox play **VP9 with alpha** (`.webm`).
- **Upload:** every frame goes through a small 2D canvas into the texture, in every browser. That keeps the alpha in Safari, and it also fixes a pale cast in Chrome, whose direct video upload skipped the sRGB decode. Both engines now match within about 6% on the objects (the remainder is the two codecs).
- **Detection:** the format is chosen by browser and `canPlayType`. The first decoded frame is then checked: its corners must be transparent.
- **Fallback:** if a browser can play neither alpha format, or drops the alpha, every object uses its clean alpha still with a gentle three.js turn. **The footage-on-black path is deleted**, so footage with a ground can never show.
- **Empty pixels write nothing** (discarded), in any browser. The object's uplight now scales with its coverage; it had lifted the whole square faintly.
- **The buffer** is half float only where the browser can blend into it (`EXT_float_blend`), otherwise 8-bit sRGB.

**Checked at 200% in both engines:** no box, halo, fringe or noise around any object (`*-zoom200-object-edge`).

## 2. The light: only a smooth glow
- **Removed:** the raymarched beam, both bloom sprites, and the case's inner-wall layer. That layer's faint reflection read as a lit panel behind the object.
- **Added:** one soft vertical glow from the slot to the resting object's underside.
  - It is brightest at the slot and falls to exactly zero at the object's underside: its height follows whatever rests, moving smoothly across a glide.
  - It is a camera-facing plane whose light also falls to exactly zero at its sides, so it has no outline at any angle.
  - It has no texture, and it is dithered against banding.
- **Kept:** the slot strip, the faint floor pool, the glints on the glass, and the light on the object's underside.
- **Identical in both engines:** compare `webkit-zoom200-glow` with `chrome-zoom200-glow`.

## 3. A smooth 60 fps turn
- **The clips:** each was interpolated with **RIFE** (rife-ncnn-vulkan, model v4.6, run locally on the GPU) from 24 fps to **60 fps at its final speed** (0.45×). The clip now plays at 1×: 533 frames, 666 for 01, looping.
- **The matte:** every new frame was then **re-matted** with BiRefNet, so colour and matte always come from the same frame and the edges stay clean.
  - BiRefNet ran in batches of 20, at 768 px, half precision; the peak was 2.97 GB per batch.
  - The alpha is blended with the neighbouring frames and the colour un-premultiplied.
  - 04's enclosed faces are filled.
- **Checked at 100%:** consecutive in-between frames show no warping or ghosting, so no object needed the still fallback.
- **Measured in Chromium:** the resting clip presents **60 new frames a second**. The Safari HEVC versions are made from the same frames.
- **Files** (`public/media/proof/turn/`, 512 px): WebM 0.4–1.4 MB, HEVC 1.8–3.7 MB. Only one clip loads at a time, and only in the format that browser plays. The v2 clips are removed (they stay in git).

## 4. No refraction on a resting object
- **The geometry:** seen from 25° left, the case's front face spans about −0.86 … +2.13 across the screen from the case's centre. A resting object 1.75 wide, centred, crossed its left edge.
- **The fix:** it is now **1.5 wide and sits 0.4 to the right**, easing in as it settles. It is 0.5 clear of the front-left edge, with margin above and below, so the glass never bends it at rest.
- **Waiting objects** keep their places, and refraction still shows as objects glide in and out (the mid-glide shots).

## Checks
**Static checks:**
- `tsc` passes (app and video).
- `eslint` shows 0 errors and the same 10 warnings.
- `next build` passes.
- In production, `/lab/automations/proof` returns 404; `/en` and `/en/automations` return 200.

**Smoothness** (Chromium, 1440 × DPR 2):

| Test | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| The loop, 25 s | 16.7 | 18.6 | 18.7 | 0 | 0 |
| 12 rapid clicks | 16.7 | 18.6 | 18.7 | 0 | 0 |
| A drag | 16.7 | 18.5 | 18.6 | 0 | 0 |
| The page, wheel | 16.7 | 18.6 | 18.7 | 0 | 0 |
| Phone 390 × DPR 3 | 16.7 | 18.6 | 18.7 | 0 | 0 |

**Without WebGL:** a new poster, `vitrine-poster-v3.webp`.

## Screens (this folder)
- **Safari's engine (WKWebView):** `webkit-01-concierge` … `-05-deed`, `webkit-mid-glide`, `webkit-zoom200-glow`, `webkit-zoom200-object-edge`.
- **Chrome's engine (Chromium):** `chrome-vitrine-01-concierge` … `-05-deed`, `chrome-vitrine-mid-glide`, `chrome-zoom200-glow`, `chrome-zoom200-object-edge`.

No Kie credits used (balance 758).
