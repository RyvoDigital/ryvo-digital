# /lab/automations/proof, round 3 (18 Oct 2026)

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

Approved and unchanged: the crystal hero loop, the five spreads, the homepage pricing with +€ amounts, the mercury close, the smoothness.

## The 01 film
- **The device:** a new Kie render (1 take, 24 credits). The whole display is in frame at true proportions: thin, even bezels on all four sides, a fine silver edge lit all the way round, and a slim stand that curves softly to a small foot. No logo or marks.
  - It is shot front-on, so the screen is an exact rectangle (3,350 × 1,890 px) and the film covers it exactly.
  - It is not cut out: BiRefNet drops a black bezel on black. Instead every pixel darker than the page was lifted to the page colour, so the image needs no alpha and has no edge.
  - A soft diagonal glass sheen lies over the screen.
- **The film:** a motion-graphics sequence, about 24 s and looping, labelled Simulated, built in GSAP on live DOM in container units, so the type stays sharp.
  - **The screen:** an obsidian gradient, a slow mercury glow that drifts the whole time, and a light sweep at the change to the calendar.
  - **The captions:** kinetic captions in the brand type rise out of their own masks. The words are 01's own tagline cut in three ("Every enquiry answered" / "in a few seconds, in the buyer's language," / "and the viewing booked."), then 01's own "The card goes to the right consultant." Each sits under its beat ("01 · Enquiry"…).
  - **The camera:** slow pushes and pans; what is out of focus blurs (depth blur, at most 10 px, on cards only).
  - **The scenes:**
    1. The enquiry slides in after a typing indicator.
    2. "Language detected · English" grows (a clip that starts as the chip) into the reply, which types itself.
    3. The calendar's free times arrive as the chat drifts out of focus; "11:00 please"; 11:00 is picked with a ring.
    4. The big moment: "Viewing booked · Thu 22 Oct · 11:00", the check draws itself, then the card shrinks and settles into its 11:00 slot.
    5. The handover card flies over to Ana (Cascais, Estoril) and lands; "Sent to your consultant".
  - **Content:** all of it is the homepage's simulated conversation and example consultants.
- **Layout:** the device is the hero of the section and is whole within one screen. It sits at 80–820 px at 1440×900 and 65–655 px at 1280×720 (its width is the viewport height minus padding, × 1.3). The three beats sit in a column on its left, aligned to it, light in sync, and jump the film on click.
  - **The dock** steps aside while the film is on screen, so it never covers the beats.
  - **Phone:** the device is whole at the top (56–331 px of 844), with the beats under it. The film has its own phone staging: larger type, the caption on top, one card in focus at a time, the consultants as a row.
- **Reduced motion:** the film rests on the booked frame with every beat lit.

## Hero polish
- **Crisp at rest:** a direct copy of each object is drawn over the crystal and fades in only as the object settles (fully within 0.04 of rest), while its refracted image fades out of the crystal's buffer, so there's never a double image. The refraction keeps the edges and the glide in and out.
- **Floor glow:** narrower than the crystal's flat face, raised, and with a long soft falloff, so the lower bevel no longer cuts it into a band.
- **Headline:** both halves now sit on one band across the top (left, then right-aligned), so it reads left to right as one sentence. Each half is narrow enough to stay clear of the crystal.

## Checks (Playwright Chromium, dev mode; the page 404s in production)
- `tsc`, `eslint` and `next build` pass. In production `/lab/automations/proof` returns 404; `/en` returns 200.
- No console errors and no sideways scroll at 1440, 1280 and 390.
- **Smoothness** (1440 × DPR 2 unless noted):

| | p50 | p95 | worst | > 25 ms | long tasks |
|---|---|---|---|---|---|
| Hero: autoplay and two clicks mid-glide | 16.7 | 17.6 | 17.7 | 0 | 0 |
| Film: two full loops (51 s) | – | – | ≤ 25 | 0 | 0 |
| Film: five beat jumps | – | – | ≤ 25 | 0 | 0 |
| Hero, film and jumps in one run (rerun) | – | – | ≤ 25 | 0 | 0 |
| Whole page, mouse wheel | 16.7 | 17.6 | 17.8 | 0 | 0 |
| Phone 390 × DPR 3: hero, scroll to the film, 12 s of film, the whole page | 16.7 | 17.7 | 17.8 | 0 | 0 |

  CLS 0.002 (desktop) and 0.005 (phone). The first combined run had one 117 ms frame and three over 25 ms during the film, with no long task. It came straight after an edit, which the dev server hot-reloads, and four reruns, including the same sequence, showed none. Not measured here: 120 Hz, a real trackpad, Safari, a real phone.
- **Contrast:** 654 samples (1440, 1280, 390; final state, with the film on its booked frame) plus the in-focus text of the other four scenes. **0 fails** (lowest 4.75).
  - Excluded on purpose: text that is out of focus at that moment (depth blur, e.g. the calendar behind the booked card; the same text is measured in its own scene), captions parked outside their mask (not visible), and the slot label hidden under its "picked" layer.
  - One real fix: the dimmed consultant's monogram (4.15 → raised to 0.85 opacity).
- **Reduced motion:** no hero autoplay; the film is paused on the booked frame (16.7 s) with all beats lit; 0 hidden elements; 0 pins.

## Screens (this folder)
- `desktop-film-1-enquiry` … `desktop-film-5-handover`, plus `desktop-film-4b-settling-into-calendar` and `desktop-film-5b-card-in-flight`.
- `phone-film-1…5-*`.
- **The whole device in frame:** every desktop film shot (1440×900), plus `desktop-1280-device-in-frame` (1280×720).
- `desktop-1440-hero`, `desktop-1280-hero`, `phone-hero`.

Kie: 24 credits this round (1 of the 2 allowed takes). See `../KIE-LOG.md`.
