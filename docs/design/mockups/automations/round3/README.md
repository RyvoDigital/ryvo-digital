# /lab/automations/proof, round 3 (corrected brief, 18 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

The first run of round 3 (56c9955) followed an older draft of the brief. It is kept as a record in `../round3-draft/`. From it, the crisp resting objects, the soft floor glow and the one-band headline stay. Its 01 film is replaced by the brand film below.

Unchanged: the structure, the homepage pricing with +€, the mercury close, the smoothness rules.

## 1. Hero
- **Crisp at rest.** While an object rests, it is a direct, sharp copy drawn over the crystal (and faded out of the refraction buffer), so there is no blur at all. The refraction bends only the edges, and shows during the glide in and out.
- **One visual size for all five.** Each object's real bounds are measured from its alpha on load. It is then scaled and centred so its content fills at most 70% of the crystal's inner face as seen on screen (perspective included). The fanned cards (04) are no longer oversized.
- **The crystal as a thick, front-on block:**
  - depth 1.0 with 0.3 bevels;
  - an overhead strip light for one crisp bright top edge;
  - a very slow idle sway (±3.5°) and a gentle pointer parallax (±5°), so its faint side faces show its depth;
  - soft caustic light pooled beneath it (an elliptical glow with a few curved threads, breathing very slightly), and a faint reflection of its lower edge.

  Both of those are drawn only in the final pass, never in the refraction buffers, so the bevel can no longer cut a band.
- **Hover:** over the scene, the resting object lifts and turns a little (and autoplay holds).
- **Headline:** both halves on one band across the top, left then right, so it reads as one sentence.

## 2. The brand film
- **Tool:** Remotion 4.0.536, its own project in `video/` (separate from the Next app; excluded from its `tsc` and `eslint`).
  - **Skills:** installed with `npx remotion skills add` into `video/.agents/skills` (from remotion-dev/skills, listed in `video/skills-lock.json`) and followed: scenes made with `Interactive.create` on a named `Track`, timing from `fps`, motion with `interpolate` and `Easing`.
  - **Fonts:** Archivo (variable, with its width axis) and Geist Mono are loaded locally (OFL licences included).
  - **Rendering:** this Mac could not reach `remotion.media` to download Chrome Headless Shell, so `video/remotion.config.ts` uses a local Chrome when `REMOTION_CHROME` is set.
  - **Commands** (in `video/`): `REMOTION_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render:mp4` (and `render:webm`, `render:poster`); `npm run studio` to preview.
- **The film:** 35.0 s, silent, looping, 1920 × 1200 (16:10), 30 fps. Every change lands on a beat (120 bpm: 15 frames).
  1. **The night (4.5 s):** a clock rolls on to 23:47 while messages arrive one by one, then "Enquiries arrive at any hour."
  2. **Ryvo (4 s):** "Five automations / from the first contact until after the deed.", with the five chrome objects in a row.
  3. **Five moments, 3 s each:** each object with its own motion (01 pops up, 02 turns in, 03 slides on a diagonal, 04 fans open, 05 descends as a line draws), then its number, name and tagline.
  4. **How we work (4 × 2 s):** four statements.
  5. **End card (3.5 s):** the RYVO wordmark in chrome, then black, so the loop is seamless.

  A slow silver glow drifts behind everything, so no scene change is a hard cut.
- **Files** (`public/media/lab/automations/`):

| File | Size |
|---|---|
| `brand-film-v1.mp4` (H.264, CRF 24) | 2.7 MB |
| `brand-film-v1.webm` (VP9, CRF 40) | 2.3 MB |
| `brand-film-poster-v1-{960,1920}.{avif,webp}` | 10–29 KB |
| `macbook-v1-{800,1400,2000}.{avif,webp}` | 3–16 KB |

- **On the page:** the MacBook screen is a transparent hole in the render, so the film plays *behind* it and the notch and bezels sit on top exactly. A soft glass sheen lies over it.
  - **Playback:** muted, playsinline, loop. It plays only while in view and pauses off-screen and in a hidden tab (checked: paused at the hero, playing in view, paused and holding its time off-screen).
  - **Placement:** after the hero and its sub-paragraph, before the index and spreads, with one eyebrow above it.
  - **Reduced motion:** the poster, with a small play button (checked: it plays on tap).
  - **The device is whole:** 93–844 px at 1440×900; 94–664 px at 1280×720; 358 × 241 at 390.
- **The device:** Kie, Nano Banana Pro 4K. Two takes; the second came back on a white background. Take 1: a full laptop, front view, thin even bezels, the notch, a thin slice of the base, no stand, no logo (the bottom bezel was checked at full size). Its screen measured 1.587 : 1, i.e. 16:10 within 1%. See `../KIE-LOG.md`.

## 3. The spreads
- **Points:** each has a short bold title, then its description, smaller and dimmer, under 60 characters a line. They sit on a clean grid with one rhythm and a hairline above each point.
- **Entrances:** each spread has its own, different entrance as it comes into view:
  - 01: the numeral slides in from the edge; the points cascade down.
  - 02: a hairline draws over each point, then its words appear.
  - 03: the numeral rises out of its own mask; the points rise column by column.
  - 04: the points fan in like cards; the object turns into place.
  - 05: the numeral settles from a soft focus; the points unveil left to right.
- **Hover:** the objects lift and turn a little (here and in the hero).

## 4. The weekly report
- **Layout:** desktop is landscape, with the heading beside a wide card in three parts (key figures, the languages the assistant replied in as bars, the three sections of rows). Phone is a column.
- **Motion on entry:** the card rises, the dividers draw, the bars grow and every figure counts up.
- **The one accent, used only here: Champagne `#D9C7A6`**, a warm pale gold that sits with Obsidian & Mercury the way gold leaf sits with steel. It marks the key figures (46, 11, 8 s), fills the bars and divides the parts, at about 11:1 on the card.
- **Kept:** "Illustrative figures, not a real agency. Sent every week."; no weekday anywhere.

## 5. Questions
- **Left:** a sticky column with "09 · QUESTIONS", "Questions", one line ("If it is not the right moment, just say so.", from the closing copy) and Book a call.
- **Right:** numbered questions in larger type. Each answer opens in a soft panel; the rows below glide on transforms (FLIP), never by animating height.
- Nine questions; Q11 stays held.

## 6. A new footer (to compare with the landing page's)
- **The wordmark:** a refined RYVO (48–68 px, chrome) with "Lisbon & Madrid", Book a call and the email.
- **Columns:** Pages / Contact / Language, and a back-to-top button.
- **Legal:** the site's own text and links, unchanged (the same `LEGAL` constants and privacy and terms links as the landing page).
- **Motion moment:** when it enters, a hairline draws out from the centre, the four letters rise one by one, and a single glint of light crosses the wordmark (hovering it replays the glint).

## 7. The dock
- It appears only while you scroll **up**, which is the moment someone wants to navigate. It hides while scrolling down, and 2.2 s after scrolling stops.
- It always steps aside over the film, the closing section and the footer, so it never sits over what someone is reading. It still appears when it has keyboard focus.

## For approval
**Film captions.** All are the site's own copy, except two:

| # | Caption | Source |
|---|---|---|
| 1 | "23:47" (a clock) | homepage ruler |
| 2 | **"Enquiries arrive at any hour."** | **NEW** |
| 3 | "Five automations" / "from the first contact until after the deed." | H1 |
| 4 | "01 / 05" … "05 / 05", the five names and the five taglines | site copy |
| 5 | "HOW WE WORK" | nav |
| 6 | "We adapt each one to how your agency already works." | sub, exact |
| 7 | **"We run it for you on a monthly retainer."** | **shortened** from the sub's "then run it for you on a monthly retainer" |
| 8 | "Price and negotiation always stay with your team." | sub, exact |
| 9 | "It always says it is an AI." | homepage trust rule, exact |
| 10 | "RYVO", "REAL ESTATE AUTOMATIONS" | wordmark, hero eyebrow |

**Point titles (20), each from its own point:**

| Spread | Titles |
|---|---|
| 01 | Seconds, day and night · Always disclosed · The right questions · Books the viewing · Hands over to a person · The right consultant · "Stop" is honoured |
| 02 | Years of contacts · Sorted by origin · Invited back · No cold outreach |
| 03 | Kept close · Which buyers it suits · No CRM needed · Rules set with you |
| 04 | Four languages · Legal lines in place · Approved by your consultant |
| 05 | At the right moment · Everyone is asked |

**Other new labels:**
- "What Ryvo builds" (the film's eyebrow);
- "09 · QUESTIONS";
- the footer column labels Pages / Contact / Language;
- accessible names ("Play the film", "Back to the top", "Footer").

## Remotion licence
From `LICENSE.md` in remotion-dev/remotion:
- **Free** for "an individual", "a for-profit organization with up to 3 employees", non-profits, or while evaluating. Commercial videos are allowed under it.
- **Otherwise**, a **Company License** is required (remotion.pro).

So it comes down to the employee count of PEDRO SEIXAS VALE - CONSULTORIA, LDA, which Manuel should confirm. The FAQ at remotion.pro covers edge cases, such as whether contractors count.

## Checks (Playwright Chromium, dev mode; the page 404s in production)
- `tsc`, `eslint` and `next build` pass. In production `/lab/automations/proof` returns 404; `/en` returns 200.
- No console errors and no sideways scroll at 1440, 1280 and 390. The hero and the device are each whole in one screen at 1440×900, 1280×720 (hero ends 698; device 94–664) and 390.
- **Smoothness:**

| Test | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Hero: autoplay, hover, two clicks mid-glide (1440 × DPR 2) | 16.7 | 17.6 | 17.7 | 0 | 0 |
| The film playing, 10 s | 16.7 | 17.6 | 17.8 | 0 | 0 |
| The whole page, mouse wheel | 16.7 | 17.6 | 17.8 | 0 | 0 |
| Phone 390 × DPR 3: the hero, then the film, then the whole page | 16.7 | 17.6 | 17.8 | 0 | 0 |

  CLS 0.003 (desktop) and 0.002 (phone).
- **Contrast:** 790 text samples (final state at 1440, 1280 and 390): **0 real fails.**
  - Two kinds were set aside as measurement artefacts: the chrome-gradient RYVO in the footer (its CSS colour is transparent; its darkest stop is about 6.5:1, and it is large text), and one Book a call pill measured a few pixels off its box (dark on off-white, about 17:1).
  - The film's own text is video. It uses the same tokens (#F1F2F4 on obsidian; the one grey line is 64 px steel at 5.1:1).
- **Reduced motion:** no hero autoplay; the film shows its poster with a play button; every element is visible; the report shows its final figures; no pins.

## Screens (this folder)
- **Hero:** `desktop-hero-01…05` (all five objects), `desktop-1280-hero`, `phone-hero`.
- **The film on the MacBook at five moments:** `desktop-film-1-any-hour`, `-2-five-automations`, `-3-inbound-concierge`, `-4-your-team`, `-5-ryvo`; `desktop-1280-film-device-in-frame`; `phone-film`.
- **Sections:** `desktop-spread-01…05`, `desktop-report`, `desktop-faq`, `desktop-footer`.
- **Phone:** `phone-spread-01`, `phone-spread-04`, `phone-report`, `phone-faq`, `phone-footer`.

Kie this round: 48 credits (2 takes). Balance 1,633; 288 left in this page's cap.
