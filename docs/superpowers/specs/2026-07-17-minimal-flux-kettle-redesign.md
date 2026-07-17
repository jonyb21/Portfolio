# Minimal Flux Kettle Redesign

## Outcome

Replace the current Flux Kettle gallery with nine consistent 4:3 product images showing one minimal, mechanically believable redesign across studio, crop, open-lid, and in-use views.

## Product design

- Keep the compact upright cylindrical format, short controlled spout, loop handle, detachable base, and circular status light.
- Remove decorative seams and reduce the form to four clear parts: vessel, lid and spout, handle, and base.
- Use a satin warm-ivory enamel body, graphite handle and base, brushed stainless lid, spout, and hinge, plus one small amber status light.
- Use a slim rounded-rectangular graphite handle with a stainless lid-release button under the thumb.
- Use a low graphite base ring with one centered amber indicator and no other visible controls.
- Add no branding, text, markings, extra buttons, or ornamental trim.

## Lid and hinge

- Show one exposed horizontal stainless hinge barrel at the rear, aligned parallel with the top of the handle.
- Build the barrel from two outer body-side knuckles and one central lid knuckle around one visible pivot pin with capped ends.
- Connect the stainless lid directly to the central knuckle with one short compact formed stainless lug; no extended vertical lever.
- Keep the torsion spring inside the barrel and show a plausible handle-mounted release button and lid latch relationship.
- Open the lid between 100 and 110 degrees against a visible mechanical stop.
- In open views, show a continuous stainless inner vessel, rim seal, attached lid, and enough clearance for filling. No detached or floating parts.

## Image set

Keep the existing nine stable asset paths in `public/assets/homewares/`.

1. Lead: full front three-quarter studio view.
2. Front angle: slightly closer opposite three-quarter studio view.
3. Rear angle: full rear three-quarter view clearly showing the closed hinge and handle attachment.
4. Lid detail: tight crop with the lid open, focused on the barrel, pivot, lid arm, latch, rim, and spout.
5. Material detail: tight crop of the ivory body, graphite base seam, and amber indicator.
6. Worktop: upright kettle on a quiet stone worktop beside one plain cup.
7. Overhead: restrained tea-preparation composition with the kettle still dominant.
8. Pouring: one hand holding the kettle while a clear stream enters one cup.
9. Filling: one hand holding the open kettle beneath a faucet, with the hinge and interior visible.

Every asset must finish at 1456 x 1092 WebP. Studio views use a warm neutral backdrop. Context views use restrained warm daylight and only the props required to explain scale or use.

## Consistency rules

- Use the approved lead render as the identity reference for all eight additional views.
- Preserve the same proportions, palette, materials, spout, handle, base, indicator, hinge, lid, and release button throughout.
- Keep actions physically plausible: one kettle, one connected handle, one attached lid, one hand where needed, and water aligned with the spout or faucet.
- Avoid duplicate parts, impossible joins, extra controls, exaggerated steam, clutter, text, logos, and watermarks.

## Site changes

- Replace only the nine existing kettle WebP assets.
- Update the Flux Kettle material description, summary, and notes in `data/site.json`; rename the fourth gallery label to `Open lid and hinge mechanism`.
- Preserve the existing project slug, asset paths, page structure, and gallery order.
- Update deterministic image hashes and palette assertions in the existing gate tests and evals.

## Verification

- Confirm all nine files exist, are WebP, and measure 1456 x 1092.
- Inspect every image for one product identity and believable mechanics.
- Reject any open-lid view where the hinge, pivot, latch, lid arm, or vessel connection is missing or impossible.
- Run `npm.cmd test`, `npm.cmd run eval`, and `npm.cmd run eval:browser`.
- Inspect `/work/axis-kettle` at desktop and 390 x 844 mobile sizes.

## Measurable result

The gallery passes all deterministic gates, all nine images match the approved palette and product geometry, and both open-lid views visibly prove the same connected hinge assembly.
