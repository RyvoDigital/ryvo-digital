# /lab/automations/proof (18 Oct 2026)

One page, built to decide the signature. Dev only: 404 in production, noindex, linked from nowhere. The real `/automations` is untouched.

> **Round 3 (18 Oct):** the 01 film rebuilt (whole device, motion graphics, beats beside it) and hero polish; see `round3/README.md`.
>
> **Round 2 (18 Oct):** one version now (crystal hero, mercury close, no `?sig` switch); see `round2/README.md`. Round 1's notes below are kept as the record.

```
cd ~/ryvo-website-automations && npx next dev -p 3001
localhost:3001/lab/automations/proof
```

Code: `src/app/lab/automations/proof/page.tsx`, `src/components/lab/proof/`. Objects: `public/media/proof/objects/` (see `KIE-LOG.md`). What I took from the study: `NOTES.md`.

## The page, top to bottom
1. **Hero:** the H1 rises line by line out of its own mask (SplitText). The signature stage: the five chrome objects glide in from the right, and one moves on as the hero scrolls away.
2. **Index:** 01–05 with taglines, linking to the stages.
3. **Five stages:** one full-height stage per automation, alternating sides. Each object enters on a scrub, drifts in parallax, floats only while on screen and tilts toward the pointer (quickTo). The text settles once.
4. **01 story, pinned, labelled Simulated:** Enquiry → Booked → Handover, on the homepage's own simulated conversation. The newest message stays on the chat's bottom edge, as on a phone.
5. **Checks line:** the words light up as you read (scrubbed opacity).
6. **Weekly report:** "A report, every week." beside the homepage's example report sheet ("Illustrative figures, not a real agency").
7. **Pricing:** soft filled switches. On the receipt an off row dims, its price strikes through and the total rolls (lib/pricing.ts: 01+02 = €650/month, €1,500 setup).
8. **Questions:** 9 rows (Q11 held). Opening one never animates height: the rows below FLIP into place on a transform.
9. **Close:** the second signature moment, then "See it working, then decide." The dock steps aside here.
10. **Dock:** a solid pill with 01–05, a progress hairline and Book a call; shown after the hero.

## The two signatures (everything else identical)
- **crystal:** a port of drei's MeshTransmissionMaterial to plain three.js (`transmission-material.ts`): 12 samples, per-channel ior for chromatic aberration, a thickness smear for anisotropic blur, and drei's back-face pass then front-face pass. The light is a black studio of thin strip lights, for crisp streaks and no glare. Hero: a thick crystal slab that the objects pass behind. Close: a domed crystal lens drifting over the bubble.
- **chrome:** our own liquid-mercury shader (zero dependencies): a slow, heavy, domain-warped surface that reflects the objects above it along the true reflected ray, plus a ring sent out when the object above changes and a faint pointer disturbance. Hero: the pool under the row. Close: the bubble over a pool.
- **Both:** lazy-loaded 800 px before view, rendered from `gsap.ticker` only while on screen and in a visible tab, DPR capped at 2, every shader variant compiled and every texture uploaded before the first frame. A still poster without WebGL, one still frame under reduced motion.

## Checks (18 Oct, Playwright Chromium)
- `npx tsc --noEmit`, `eslint` on the new files, and `next build` pass. In production `/lab/automations/proof` (both `?sig`) and `/lab/palette` return 404; `/en` and `/en/automations` return 200.
- No console errors and no sideways scroll at 1440 or 390, for both signatures.
- **Contrast:** 864 text samples (both signatures at 1440 and 390) measured against the real pixels behind them with the text hidden. **0 fails; lowest 4.75.** The dim states are set to stay AA: inactive beats 0.62, off switch labels 0.58, off receipt rows 0.74, and lifted steel on the raised cards.
- **Scrolling the whole page** (1440 × DPR 2, mouse wheel through Lenis; and 390 × DPR 3 with touch, native scroll):

| | frames | p50 | p95 | worst | > 25 ms | long tasks > 50 ms | CLS |
|---|---|---|---|---|---|---|---|
| crystal 1440 | 713–738 | 16.7 | 18.6 | 18.7 | 0 | 0 | 0 |
| chrome 1440 | 699–751 | 16.7 | 18.6 | 18.7 | 0 | 0 | 0 |
| crystal 390 | 1,028 | 16.7 | 18.7 | 18.8 | 0 | 0 | – |
| chrome 390 | 1,028 | 16.7 | 18.7 | 18.8 | 0 | 0 | – |

  Two findings from the trace, both fixed: a 150 ms frame (crystal) from the transmission shader linking mid-scroll, so every variant is now pre-compiled with `compileAsync`; and an 81 ms frame (chrome) from the first texture upload, so textures are now uploaded at boot.
  Limits: measured in dev mode (the page 404s in production), in headless Chromium at 60 Hz. 120 Hz, a real trackpad, Safari and a real phone still need a look by hand.
- **Reduced motion:** no Lenis, 0 pins, 0 hidden elements, still frames. **WebGL off:** the poster shows.

## Screens
`desktop-` and `phone-` × `crystal-` and `chrome-`: `00-fullpage` (final state), `01-hero`, `02-story-booked`, `03-story-handover`, `04-stage-02`, `05-report`, `06-pricing`, `07-cta`.

## New short labels (to approve)
- The story beats **"Enquiry"**, **"Booked"** and **"Handover"**, and the **"Simulated"** tag on the story and its chat. Beat 2's text is the first sentence of 01's fourth point.
- The FAQ heading **"Questions"** (the existing "QUESTIONS" label, set as a heading).
- Accessibility names only: "The five automations", "Sections", "Simulated conversation", "Before anything is switched on", and two image descriptions.
