# Realistic Rill and Trace Render Refresh

## Outcome

Replace the complete Rill Wall Light and Trace Floor Lamp image sets with photorealistic 4:3 product images whose scale, structure, joints, mounting, cable paths, materials, and light output look manufacturable and believable.

## Rill Wall Light

- Use the approved 280 mm warm-grey powder-coated aluminium cylinder and shallow rounded rectangular wall plate.
- Support the rotating body with two symmetric compact brushed-aluminium pivots recessed into the plate.
- Recess a long opal linear diffuser into the cylinder so rotating the body redirects the beam up or down.
- Place one small flush graphite dimmer below the cylinder and conceal hardwiring and fixings within the backplate.
- Keep the geometry compact, symmetric, and manufacturable. No exposed brackets, oversized controls, decorative hardware, or unsupported parts.

## Trace Floor Lamp

- Use the approved 1250 mm warm-grey rectangular aluminium upright, short horizontal light head, and compact weighted rounded rectangular base.
- Connect the head to the upright with one compact brushed-aluminium cylindrical friction pivot.
- Recess a linear opal diffuser into the underside of the head and route wiring internally through the upright.
- Use a graphite lower base inset, one small flush black rotary dimmer on the base, and a black cable exiting neatly at the rear.
- Keep the centre of mass over the base and show stable floor contact, restrained light output, and realistic manufactured tolerances.

## Asset contract

Keep the existing ten stable `-vibrant-v1.webp` paths for each product: illuminated lead, matching switched-off card, four studio/detail studies, and four context views.

- On/off pairs use the same camera, product pose, framing, and room geometry; only illumination changes.
- Every final file is a 1456 x 1092 WebP.
- Use each approved lead as the sole identity reference for its remaining views.
- Preserve exact product proportions, materials, joints, fasteners, colours, cable path, and control placement across the set.
- No logos, text, watermarks, duplicate products, impossible light sources, extra controls, unrelated appliances, or exaggerated bloom.

## Image stories

### Rill

1. Illuminated lead on a neutral plaster wall.
2. Matching switched-off card.
3. Front three-quarter studio view showing the rotating cylinder.
4. Side/rear view proving the shallow backplate, pivots, and clearance.
5. Tight machined pivot and backplate detail.
6. Tight recessed diffuser and dimmer detail.
7. Hallway installation.
8. Bedroom or reading-nook installation.
9. Matched pair installation.
10. One hand rotating the cylinder to redirect the beam.

### Trace

1. Illuminated full front three-quarter studio lead.
2. Matching switched-off card.
3. Full front profile.
4. Full rear profile proving the cable exit and base stability.
5. Tight head, diffuser, and brushed-aluminium pivot detail.
6. Tight weighted base, graphite inset, dimmer, and cable-exit detail.
7. Reading-corner installation.
8. Sofa-side installation.
9. Overhead pool-of-light scene.
10. Person reading beneath the lamp.

## Verification

- Inspect all 20 assets individually at original resolution.
- Reject any view with inconsistent geometry, unsupported weight, disconnected joints, missing cable path, distorted walls or furniture, or implausible illumination.
- Pin the approved lead, mounting/base proof, and in-use images in deterministic tests and evals.
- Run `npm.cmd test`, `npm.cmd run eval`, and `npm.cmd run eval:browser`.
- Inspect the lighting category and both project pages at desktop and 390 x 844 mobile sizes.
- Rebuild the existing Docker service and verify `https://portfolio.jonllm.xyz` serves the new image hashes.
