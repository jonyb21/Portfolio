# Flux Kettle Render Refresh

## Goal

Replace the inconsistent Flux Kettle render set with nine native 4:3 WebP assets that show one believable product across its studio and use views.

## Direction

- Preserve the approved Flux identity: cobalt enamel body, vermilion heat-safe handle and base, brushed stainless lid and short spout, chartreuse status light.
- Use one generated lead render as the visual reference for every other image so the body proportions, handle, lid, spout, base, finish, and indicator stay fixed.
- Keep the first four gallery views as neutral studio/editorial studies: front three-quarter, rear handle profile, lid/spout interaction detail, and base/enamel material detail.
- Use the last four views as believable kitchen context: worktop rest, overhead tea-prep composition, pouring into a cup, and filling at a sink with the lid open.
- Keep all assets native 4:3, with no text, logos, invented product variants, or unrelated appliances competing with the kettle.

## File and data changes

Overwrite the existing Flux Kettle `-vibrant-v1.webp` gallery files in `public/assets/homewares/` and keep the existing JSON paths stable. Update the deterministic asset assertions only where the approved replacement files change their hashes.

## Verification

- Confirm every referenced kettle asset exists and remains 4:3.
- Run `npm.cmd test`, `npm.cmd run eval`, and `npm.cmd run eval:browser`.
- Inspect the generated assets individually and inspect the rendered product page at desktop and mobile sizes.
- Check that the gallery keeps one kettle identity and that context scenes show plausible kettle actions.
