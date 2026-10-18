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
