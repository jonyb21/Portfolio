# Mobility Category Design

## Outcome

Add a fourth portfolio category, Mobility, with four original products that broaden the work beyond furniture, homewares, and lighting. Each project must look physically credible, maintain one consistent product identity across its gallery, and demonstrate a different industrial-design capability.

Colour the word “Brooks” in the site wordmark with the existing green accent while keeping “Jon” in the normal text colour.

## Category and products

### Stride Fold E-bike

A compact 20-inch urban e-bike with a low-step hydroformed aluminium frame, concealed central folding hinge, removable downtube battery, belt drive, integrated lights, and a restrained warm-grey and graphite finish. It demonstrates vehicle-scale form development, packaging, structural detailing, and a believable folding mechanism.

### Aero Commuter Helmet

A low-profile commuter helmet with an in-mould shell, visible recycled-EPS liner, deep front-to-rear ventilation channels, adjustable occipital cradle, magnetic buckle, and a narrow integrated rear light. It demonstrates wearability, ergonomics, safety detailing, and soft-touch interfaces without looking like a racing helmet.

### Latch Convertible Pannier

A weather-resistant bicycle pannier with a thermoformed recycled-polymer back panel, concealed quick-release rack hooks, welded textile body, roll-top closure, and a stowable shoulder strap. It converts cleanly from bike luggage to a shoulder bag and demonstrates soft goods, attachment mechanisms, and mixed-material construction.

### Gauge Electric Inflator

A compact rechargeable tyre inflator with a die-cast aluminium body, replaceable battery cartridge, short braided hose, clear pressure display, one rotary control, and a ventilated graphite end cap. It demonstrates handheld electronics, thermal detailing, tactile controls, and serviceability.

## Visual direction

The products share a quiet, functional design language rather than identical shapes: warm grey, graphite, dark green accents, honest part lines, restrained branding, and plausible manufacturing details. Forms stay minimal and purposeful, with no decorative sci-fi geometry.

Every project uses the existing 4:3 WebP gallery contract:

1. One lead product render.
2. Four design-detail views: front or three-quarter profile, rear or folded state, primary mechanism, and material/control detail.
3. Four realistic in-situ views with distinct environments, including one credible human interaction where scale or operation benefits from it.

The 36 final images must be visually inspected, unique, free of text artefacts, and consistent with their product definition. Scene lighting, camera height, props, and background materials should vary between in-situ views rather than repeating one studio setup.

## Site integration

- Add `mobility` to the shared category lists in the browser and server.
- Add a fourth accessible Work tab and preserve keyboard, history, and no-JavaScript behavior.
- Keep five projects in each existing category and validate exactly four Mobility projects.
- Update the Work introduction and metadata to name Mobility.
- Add all four projects to `data/site.json` using the existing project schema and navigation behavior.
- Render “Brooks” in `var(--accent)` without changing the accessible brand name or the stored `site.brand` value.
- Bump media and content cache revisions after assets and code are final.

## Verification

Gate tests must prove the 5/5/5/4 category counts, valid Mobility schemas, unique and existing 4:3 WebP assets, the fourth accessible tab, product-specific metadata, and the green surname markup.

Browser evals must cover the Mobility tab on mobile and desktop, four cards, keyboard/history behavior, all four project pages, nine visible images per project, responsive bounds, working end navigation, clean console output, and no broken images.

Completion requires a clean relevant diff, passing tests and evals, a pushed commit, a healthy production deployment, and public verification of the category, product metadata, and representative asset hashes.
