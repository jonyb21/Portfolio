# Lock Gallery Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Arc hinged-lock gallery with nine consistent WebP photographs of a functional double-deadbolt bicycle U-lock.

**Architecture:** Keep the existing product slug, JSON-backed renderer, gallery component, media normalizer, and versioned-photo convention. Generate one canonical hero, use it as the reference for eight derived views, then update only the product data and its deterministic gates.

**Tech Stack:** Built-in `image_gen`, existing PowerShell/FFmpeg media normalizer, JSON, Node.js assertions, Playwright.

## Global Constraints

- One removable hardened-steel U-shackle with muted navy elastomer, one bead-blasted aluminium crossbar, two recessed receivers, two internal deadbolts, one recessed stainless key barrel in the right end-cap, a thin cool-white LED locating ring, and charcoal rubber protection.
- Product geometry, receiver spacing, end-cap keyway position, LED ring, materials, and colors remain identical in every view.
- Nine unique native 4:3 WebP files: one hero, four crop views, and four human in-situ views.
- In locked views, the shackle encloses the bicycle seat tube and one fixed rail without intersecting either solid tube.
- No hinge, cable, folding links, exposed fasteners, floating parts, extra lights, logos, text, or watermark.
- Preserve slug `link-folding-lock`; use new `arc-u-lock-*-photo-v8.webp` paths without overwriting old assets.

---

### Task 1: Add the failing product contract

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `evals/preflight.mjs`

**Interfaces:**
- Consumes: product with slug `link-folding-lock` from `data/site.json`.
- Produces: deterministic copy, gallery-shape, filename, and uniqueness gates.

- [ ] **Step 1: Replace the old Arc lock assertions in the gate test**

Use these assertions after `const arcLock = ...`:

```js
const arcLockCopy = `${arcLock.type} ${arcLock.summary} ${arcLock.notes.join(" ")} ${arcLock.views.map(view => view.label).join(" ")}`;
const arcLockImages = [arcLock.image, ...arcLock.views.map(view => view.image)];
assert.equal(arcLock.title, "Arc Double-Deadbolt U-Lock");
assert.match(arcLock.type, /double-deadbolt U-lock/i);
assert.match(arcLock.notes.join(" "), /removable.*hardened-steel U-shackle/i);
assert.match(arcLock.notes.join(" "), /two recessed receivers.*two internal deadbolts/i);
assert.match(arcLock.notes.join(" "), /frame mount.*transport/i);
assert.match(arcLock.notes.join(" "), /key barrel.*right end-cap.*LED ring/i);
assert.doesNotMatch(arcLockCopy, /hinge|captive shackle|folding link|steel chain|front-face key/i);
assert.equal(arcLock.views.filter(view => view.type === "crop").length, 4);
assert.equal(arcLock.views.filter(view => view.type === "insitu").length, 4);
assert.equal(new Set(arcLockImages).size, 9);
assert(arcLockImages.every(image => /^\/assets\/mobility\/arc-u-lock-[a-z-]+-photo-v8\.webp$/.test(image)));
```

- [ ] **Step 2: Mirror the same requirements in the eval**

Use `assert(...)` and `assert.deepEqual(...)` with the same title, required and forbidden terminology, 4/4 view counts, nine unique images, and `arc-u-lock-*-photo-v8.webp` regex in `evals/preflight.mjs`.

- [ ] **Step 3: Run both gates and confirm the intentional failure**

```powershell
npm.cmd test
npm.cmd run eval
```

Expected: both fail because `data/site.json` still describes `Arc Hinged D-Lock`.

- [ ] **Step 4: Commit the red gates**

```powershell
git add -- tests/site.test.mjs evals/preflight.mjs
git commit -m "Test functional U-lock gallery contract"
```

### Task 2: Generate the canonical lock and eight matching views

**Files:**
- Create: `public/assets/mobility/arc-u-lock-lead-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-angle-front-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-detail-primary-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-detail-mechanism-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-detail-material-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-context-wide-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-context-active-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-context-alt-photo-v8.webp`
- Create: `public/assets/mobility/arc-u-lock-context-use-photo-v8.webp`

**Interfaces:**
- Consumes: approved product definition in `docs/superpowers/specs/2026-07-22-lock-gallery-redesign.md`.
- Produces: nine distinct product photographs referenced by Task 3.

- [ ] **Step 1: Generate the canonical hero**

Use built-in `image_gen`:

```text
Use case: product-mockup
Asset type: industrial design portfolio hero
Primary request: one premium, manufacturable double-deadbolt bicycle U-lock, closed, photographed front three-quarter
Scene/backdrop: seamless warm-grey studio surface, no props
Subject: removable rounded hardened-steel U-shackle with a smooth muted navy elastomer sleeve; both exposed steel tips are equal, parallel, and fully seated into two matching recessed receivers in one compact bead-blasted warm-silver aluminium crossbar; charcoal rubber receiver collars and lower bumper; one recessed stainless key barrel centered in the right circular end-cap, surrounded by one thin cool-white LED locating ring; the long front face is uninterrupted
Style/medium: photorealistic industrial-design photography, physically correct machining and assembly
Composition/framing: landscape 4:3, full product centered, modest contact shadow, 50mm lens
Lighting/mood: soft neutral studio light
Constraints: canonical reference for every later image; symmetrical receiver geometry; plausible wall thickness and part seams; no text or logo
Avoid: hinge, cable, folding links, front-face keyhole, extra lights, exposed screws, floating parts, extra receivers, asymmetrical shackle legs, merged metal, watermark
```

Copy the selected output into the workspace as `arc-u-lock-lead-photo-v8.webp` without overwriting another file.

- [ ] **Step 2: Generate four crops from the hero reference**

Pass the hero as the single reference and repeat the shared constraint: change only camera/framing or the requested cutaway; preserve exact product identity.

```text
angle-front: closed lock, tighter front view showing both equal shackle legs seated in both recessed receivers; warm-grey studio; no hands or props.
detail-primary: macro crop of the recessed stainless key barrel in the right circular end-cap, its thin cool-white LED locating ring, aluminium crossbar seam, and charcoal bumper; no extra controls or front-face keyhole.
detail-mechanism: physically accurate sectional product photograph through the crossbar showing two separate internal steel deadbolts engaging matching notches in both shackle tips; housing remains one coherent object; no labels or exploded parts.
detail-material: macro crop of one exposed hardened-steel shackle notch transitioning cleanly into the muted navy elastomer sleeve; realistic molded edge and steel finish.
```

Save to the four `angle-front` / `detail-*` WebP paths above.

- [ ] **Step 3: Generate four human in-situ views from the hero reference**

Pass the hero as the single reference and preserve the exact lock in every scene.

```text
context-wide: an adult cyclist places the separate U-shackle around the bicycle seat tube and one fixed street rail before fitting the crossbar; both hands anatomically correct; natural urban daylight.
context-active: after both shackle legs are fully seated, one hand steadies the crossbar and the other turns a physical key in the recessed right-end key barrel; its thin cool-white LED ring is visible; frame, rear wheel, and fixed rail all enclosed by the shackle.
context-alt: completed locked state with the same lock securing the bicycle frame to the fixed rail; no hands obscure the mechanism; clear contact and plausible clearances.
context-use: adult cyclist removes the same closed lock from a separate low-profile rubber-lined frame mount; mount supports transport only and is not part of the locking mechanism.
```

Avoid extra lock parts, impossible hand placement, a shackle passing through solid tubes, missing crossbar, unsecured bicycle, duplicate limbs, text, logos, and watermark. Save to the four `context-*` WebP paths above.

- [ ] **Step 4: Visually inspect the generated set**

Inspect all nine with a contact sheet. Reject any geometry or action that contradicts the canonical hero or real locking physics. Final native 4:3 normalization happens after the paths are added to `data/site.json`, using the existing referenced-media normalizer.

- [ ] **Step 5: Commit the approved assets**

```powershell
git add -- public/assets/mobility/arc-u-lock-*-photo-v8.webp
git commit -m "Add consistent Arc U-lock render set"
```

### Task 3: Wire the gallery and make the gates green

**Files:**
- Modify: `data/site.json`
- Verify: `scripts/normalize-media.ps1`

**Interfaces:**
- Consumes: nine `arc-u-lock-*-photo-v8.webp` assets.
- Produces: the final product record rendered by the existing site.

- [ ] **Step 1: Replace only the `link-folding-lock` product record**

Set title to `Arc Double-Deadbolt U-Lock`, type to `Double-deadbolt U-lock for bicycles`, and use:

```json
"materials": "Hardened steel, bead-blasted aluminium, moulded elastomer, stainless steel",
"image": "/assets/mobility/arc-u-lock-lead-photo-v8.webp",
"cardImage": "/assets/mobility/arc-u-lock-lead-photo-v8.webp",
"detailImage": "/assets/mobility/arc-u-lock-detail-primary-photo-v8.webp"
```

Describe the removable shackle, two receivers/two deadbolts, recessed right-end key barrel with LED locating ring, rubber protection, and transport-only frame mount. Add the four crop paths first, then the four in-situ paths, using labels matching the spec.

- [ ] **Step 2: Normalize the referenced images**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/normalize-media.ps1
node media-dimensions.js public/assets/mobility/arc-u-lock-*-photo-v8.webp
```

Expected: all nine lock images are native 4:3 WebP.

- [ ] **Step 3: Run all deterministic and browser checks**

```powershell
npm.cmd test
npm.cmd run eval
npm.cmd run eval:browser
git diff --check
```

Expected: all commands exit 0; the product page has nine distinct images, four crops, four in-situ views, and no failed asset requests at desktop or mobile sizes.

- [ ] **Step 4: Commit and push**

```powershell
git add -- data/site.json public/assets/mobility/arc-u-lock-*-photo-v8.webp
git commit -m "Replace Arc lock with functional U-lock"
git push
```

### Task 4: Production handoff

**Files:**
- Verify: `data/site.json`
- Verify: `public/assets/mobility/arc-u-lock-*-photo-v8.webp`

- [ ] **Step 1: State the exact production change and request confirmation**

The deployment will rebuild the `portfolio` container and switch the live bind-mounted `data/site.json` lock record only after all nine new public WebP URLs return HTTP 200 with `Content-Type: image/webp`.

- [ ] **Step 2: After confirmation, deploy assets before data**

Use the existing two-phase deployment sequence: rebuild/recreate the container with the new assets while live data still points to the old gallery, verify every new public asset, then patch the live product record.

- [ ] **Step 3: Verify production**

Confirm container health, public `/api/site` lock paths, HTTP 200 WebP responses for all nine files, and desktop/mobile gallery rendering. No manual restart remains after container recreation.
