# Flux Kettle Render Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Flux Kettle gallery with nine consistent native 4:3 WebP renders that preserve one believable product identity across studio and kitchen-use scenes.

**Architecture:** Keep the existing JSON paths and vanilla renderer unchanged. Generate one lead image as the canonical product reference, generate eight additional views against that same reference, replace the current kettle files in place, and update the two deterministic gates that pin approved image hashes.

**Tech Stack:** Built-in `image_gen`, WebP assets, Node.js assert tests/evals, Playwright browser preflight.

## Global Constraints

- Preserve cobalt enamel body, vermilion heat-safe handle and base, brushed stainless lid and short spout, and chartreuse status light.
- Keep every kettle asset native 4:3 WebP.
- Keep the first four views as studio/editorial studies and the final four as believable kitchen actions.
- No text, logos, invented product variants, or unrelated appliances competing with the kettle.
- Do not touch unrelated dirty-worktree files.
- Use the existing JSON paths so no renderer migration is needed.

---

### Task 1: Generate and replace the Flux Kettle image set

**Files:**
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-lead-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-front-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-rear-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-primary-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-material-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-wide-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-alt-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-active-vibrant-v1.webp`
- Replace: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-use-vibrant-v1.webp`

**Inputs:**
- Existing Flux brief in `C:\PORTFOLIO\docs\superpowers\specs\2026-07-11-vibrant-products-design.md`.
- Existing render set inspected before replacement only as a failure reference; do not use the inconsistent card image as a model reference.

- [ ] **Step 1: Generate the canonical lead reference**

Use the built-in image generator with this prompt:

```text
Use case: product-mockup
Asset type: industrial design portfolio hero render
Primary request: a premium studio product photograph of one original electric kettle called Flux, shown front three-quarter with the handle on the right and short spout on the left
Scene/backdrop: seamless warm off-white studio sweep, no props, no kitchen, subtle grounded shadow
Subject: compact cylindrical electric kettle with a straight-sided cobalt-blue mirror-gloss enamel body, a broad vermilion-red rounded rectangular heat-safe loop handle, matching vermilion-red lower base ring, brushed stainless circular lid, short brushed stainless triangular spout with a small perforated filter, and one small chartreuse circular status light centered on the front of the base
Style/medium: high-end industrial design product photography, physically plausible manufactured object, precise proportions, clean edge definition
Composition/framing: native 4:3 landscape, kettle centered with generous breathing room, full object visible, camera at slightly above eye level, 50mm product lens
Lighting/mood: soft large-source studio lighting, controlled vertical reflections on the enamel, neutral white balance, modest contact shadow
Materials/textures: reflective cobalt vitreous enamel, glossy molded heat-safe polymer handle and base, fine radial brushed stainless lid and spout
Text (verbatim): ""
Constraints: this is the canonical product reference for all other views; keep the exact same body, handle, lid, spout, base, indicator, materials, and colors; no visible brand, no text, no watermark
Avoid: alternate handle shapes, glass body, gooseneck spout, cord, temperature display, extra buttons, duplicate objects, deformed geometry, floating product, cropped product, exaggerated reflections
```

Save the selected generated image as `C:\PORTFOLIO\public\assets\homewares\axis-kettle-lead-vibrant-v1.webp`.

- [ ] **Step 2: Generate the four studio views from the lead reference**

For each prompt, use the lead image as the single reference image and preserve the product invariants exactly.

Front three-quarter:

```text
Use case: precise-object-edit
Asset type: product gallery studio view
Primary request: show the exact same Flux kettle from a slightly closer front three-quarter angle, handle still on the right and spout still on the left
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: same warm off-white seamless studio sweep
Composition/framing: native 4:3 landscape, full kettle visible, slightly closer crop than the lead, centered
Lighting/mood: same soft studio lighting and controlled enamel reflections
Constraints: change only the camera angle and crop; keep body proportions, cobalt body, vermilion handle and base, stainless lid and spout, and chartreuse status light identical; no text, logo, watermark, or props
Avoid: redesigning the kettle, new buttons, different handle, different spout, missing base light, extra objects
```

Rear handle profile:

```text
Use case: precise-object-edit
Asset type: product gallery studio view
Primary request: show the exact same Flux kettle from the rear three-quarter angle to reveal the handle attachment and rear body profile
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: same warm off-white seamless studio sweep
Composition/framing: native 4:3 landscape, full kettle visible, centered with generous padding
Lighting/mood: same soft studio lighting, subtle contact shadow
Constraints: change only the camera angle; keep the same cylindrical body, vermilion loop handle, red base ring, lid, spout, chartreuse indicator, colors, scale, and materials; no text, logo, watermark, or props
Avoid: moving the handle to another position, inventing a rear control panel, changing proportions, extra objects
```

Lid and spout detail:

```text
Use case: precise-object-edit
Asset type: industrial design detail study
Primary request: a close detail crop of the exact same Flux kettle focused on the brushed stainless lid, lid seam, short triangular spout, filter perforations, and handle release button
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: same warm off-white studio sweep
Composition/framing: native 4:3 landscape, close crop but keep the lid, spout, upper body, and handle button legible
Lighting/mood: same soft product lighting, crisp but natural material reflections
Constraints: change only framing; keep every visible component and color exactly as the reference; no hands, text, logo, watermark, or extra controls
Avoid: long spout, gooseneck spout, open lid, distorted perforations, different handle, floating parts
```

Enamel and base detail:

```text
Use case: precise-object-edit
Asset type: industrial design material study
Primary request: a close detail crop of the exact same Flux kettle focused on the cobalt mirror-gloss enamel, vermilion base seam, and centered chartreuse status light
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: same warm off-white studio sweep
Composition/framing: native 4:3 landscape, low close crop, base seam and status light prominent
Lighting/mood: same soft studio lighting with controlled reflections that show the enamel curvature
Constraints: change only framing; keep the base geometry, indicator location, cobalt and vermilion colors, and materials identical; no text, logo, watermark, or extra parts
Avoid: different indicator shape, black base, matte finish, scratches, labels, warped seam
```

Save them as:

- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-front-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-rear-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-primary-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-material-vibrant-v1.webp`

- [ ] **Step 3: Generate the four context views from the same lead reference**

Use the lead image as the single reference image for each scene. Keep the kettle as the visual anchor and make the action physically plausible.

Worktop rest:

```text
Use case: compositing
Asset type: kitchen context product photograph
Primary request: place the exact same Flux kettle upright and switched off on a quiet stone kitchen worktop beside one ceramic cup and a folded linen, showing believable domestic scale
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: restrained contemporary kitchen with warm grey stone worktop, soft daylight, background cabinets gently out of focus
Composition/framing: native 4:3 landscape, kettle dominant and fully visible, no clutter
Lighting/mood: soft natural window light matched to the product reflections
Constraints: keep the exact kettle body, handle, lid, spout, base, indicator, colors, and proportions; no people, no logos, no text, no extra kettle, no dramatic color cast
Avoid: redesigning the kettle, different materials, nonsensical placement, clutter, floating object
```

Tea-prep overhead:

```text
Use case: compositing
Asset type: kitchen context product photograph
Primary request: overhead still life of the exact same Flux kettle resting on a pale stone counter with two plain cups, a small tea bowl, and one folded cloth; kettle remains clearly identifiable
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: quiet domestic tea-preparation surface, neutral warm daylight, restrained props only
Composition/framing: native 4:3 landscape, top-down camera, kettle in the upper-right third with negative space around it
Lighting/mood: soft diffuse daylight, consistent with the lead product material reflections
Constraints: keep the exact kettle geometry and colors; no people, text, logos, packaging, or extra appliances; props must remain secondary
Avoid: changing the lid, handle, spout, or base, excessive styling, duplicate kettle
```

Pouring:

```text
Use case: compositing
Asset type: kitchen context product photograph
Primary request: show the exact same Flux kettle held by one adult hand pouring a clear stream of hot water into a plain ceramic cup; the short spout, handle, and body must remain physically connected and recognizable
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: quiet contemporary kitchen worktop with soft daylight and minimal background
Composition/framing: native 4:3 landscape, three-quarter side view, kettle and cup fully visible, stream aligned with the spout
Lighting/mood: warm but controlled natural light, realistic steam kept subtle
Constraints: preserve the exact kettle geometry, colors, lid, handle, spout, base, indicator, and materials; one hand only; no text, logos, watermark, or extra appliances
Avoid: impossible water path, detached handle, changed product colors, duplicated hands, exaggerated steam, floating kettle
```

Filling:

```text
Use case: compositing
Asset type: kitchen context product photograph
Primary request: show the exact same Flux kettle at a stainless kitchen sink while one adult hand lifts the hinged lid and fills the open vessel from a simple faucet; the lid hinge, inner stainless vessel, handle, spout, base, and indicator must make physical sense
Input images: Image 1 is the canonical Flux kettle reference; preserve its product identity
Scene/backdrop: restrained contemporary kitchen sink with stone counter and soft window light
Composition/framing: native 4:3 landscape, three-quarter view, kettle dominant and fully visible, faucet and hand secondary
Lighting/mood: soft natural daylight, realistic stainless reflections, no dramatic color cast
Constraints: preserve the exact kettle geometry and color blocking; show the lid open only for this action; one hand only; no text, logos, watermark, or unrelated appliances
Avoid: changed handle, different spout, detached lid, impossible hinge, extra controls, duplicate kettle, excessive clutter
```

Save them as:

- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-wide-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-alt-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-active-vibrant-v1.webp`
- `C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-use-vibrant-v1.webp`

- [ ] **Step 4: Validate the generated files before wiring them into gates**

Run:

```powershell
node C:\PORTFOLIO\media-dimensions.js C:\PORTFOLIO\public\assets\homewares\axis-kettle-lead-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-front-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-angle-rear-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-primary-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-detail-material-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-wide-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-alt-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-active-vibrant-v1.webp C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-use-vibrant-v1.webp
```

Expected: every file reports `1440x1080` or another exact 4:3 dimension.

Use `view_image` on all nine files. Reject and regenerate any view where the kettle’s handle, lid, spout, base, status light, or color blocking contradicts the lead reference, or where the action is physically impossible.

- [ ] **Step 5: Commit only the replacement kettle assets**

```powershell
git add -- public/assets/homewares/axis-kettle-*-vibrant-v1.webp
git commit -m "Replace Flux Kettle render set"
```

### Task 2: Update deterministic approval gates

**Files:**
- Modify: `C:\PORTFOLIO\tests\site.test.mjs`
- Modify: `C:\PORTFOLIO\evals\preflight.mjs`

- [ ] **Step 1: Replace the two old kettle hashes with the new approved hashes**

Compute each new SHA-256 with:

```powershell
Get-FileHash C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-active-vibrant-v1.webp -Algorithm SHA256
Get-FileHash C:\PORTFOLIO\public\assets\homewares\axis-kettle-context-use-vibrant-v1.webp -Algorithm SHA256
```

Replace only the old hash literals for these same paths in `tests\site.test.mjs` and `evals\preflight.mjs`. Do not weaken the assertions or remove the product identity checks.

- [ ] **Step 2: Run the local gate tests**

```powershell
npm.cmd test
npm.cmd run eval
git diff --check
```

Expected: all commands exit 0; the existing site contract and the new kettle hashes pass.

- [ ] **Step 3: Commit the gate updates**

```powershell
git add -- tests/site.test.mjs evals/preflight.mjs
git commit -m "Update Flux Kettle render gates"
```

### Task 3: Verify the rendered product page

**Files:**
- Verify: `C:\PORTFOLIO\public\product.html`
- Verify: `C:\PORTFOLIO\public\app.js`
- Verify: `C:\PORTFOLIO\public\styles.css`
- Verify: `C:\PORTFOLIO\public\assets\homewares\axis-kettle-*.webp`

- [ ] **Step 1: Start the local server**

Run `npm.cmd start` from `C:\PORTFOLIO` in a background terminal and use the existing browser preflight against `http://127.0.0.1:8788`.

- [ ] **Step 2: Run browser verification**

```powershell
npm.cmd run eval:browser
```

Expected: the product page loads, all image requests return 200, the browser console stays clean, and no horizontal overflow is reported.

- [ ] **Step 3: Capture and inspect desktop and mobile renders**

Inspect `/work/axis-kettle` at desktop and a 390x844 viewport. Check the hero image, all eight gallery views, page crop behavior, title/copy legibility, and that the kettle remains consistent from studio to context.

- [ ] **Step 4: Commit the verified final state**

```powershell
git status --short
git log -3 --oneline
```

Leave unrelated pre-existing modifications unstaged. Push only the commits created for this render refresh after all checks pass.
