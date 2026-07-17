# Mobility Category Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth Mobility portfolio category with four realistic products, complete nine-image galleries, a green “Brooks” wordmark, responsive integration, tests, deployment, and public verification.

**Architecture:** Reuse the existing JSON project schema, Work tabs, product renderer, static server, and Playwright preflight. Add only one category-specific asset directory and the minimum category/count/wordmark changes. Each product gets one lead render plus two reference-guided 2×2 sheets cropped into four detail and four in-situ WebPs.

**Tech Stack:** Node.js, vanilla HTML/CSS/JavaScript, JSON, Playwright, ImageGen, ImageMagick, Docker Compose.

## Global Constraints

- Category slug is `mobility`; existing category counts stay 5/5/5 and Mobility contains exactly 4 projects.
- Products are Stride Fold E-bike, Aero Commuter Helmet, Latch Convertible Pannier, and Gauge Electric Inflator.
- Every project has one lead, four detail, and four realistic in-situ 4:3 WebP images.
- Keep the stored and accessible brand name `Jon Brooks`; colour only the visible word “Brooks” with `var(--accent)`.
- Preserve unrelated working-tree changes and add no dependencies.

---

### Task 1: Lock the category and asset contract with failing checks

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `evals/preflight.mjs`

**Interfaces:**
- Consumes: `data/site.json`, `server.js`, `public/app.js`, `public/work.html`.
- Produces: assertions for `PROJECT_CATEGORY_COUNTS = { furniture: 5, homewares: 5, lighting: 5, mobility: 4 }`, four Mobility slugs, 36 valid assets, and `.brand-family`.

- [ ] **Step 1: Add the failing gate assertions**

```js
const PROJECT_CATEGORY_COUNTS = { furniture: 5, homewares: 5, lighting: 5, mobility: 4 };
assert.deepEqual(
  Object.fromEntries(Object.keys(PROJECT_CATEGORY_COUNTS).map(category => [category, site.projects.filter(project => project.category === category).length])),
  PROJECT_CATEGORY_COUNTS
);
assert.deepEqual(site.projects.filter(project => project.category === "mobility").map(project => project.slug), [
  "stride-fold-ebike", "aero-commuter-helmet", "latch-convertible-pannier", "gauge-electric-inflator"
]);
assert(css.includes(".brand-family") && app.includes("renderBrand"));
```

- [ ] **Step 2: Run the gate to prove it fails**

Run: `npm.cmd test`

Expected: FAIL because Mobility and the green surname renderer do not exist.

### Task 2: Produce and verify the four image galleries

**Files:**
- Create: `public/assets/mobility/stride-fold-ebike-*.webp`
- Create: `public/assets/mobility/aero-commuter-helmet-*.webp`
- Create: `public/assets/mobility/latch-convertible-pannier-*.webp`
- Create: `public/assets/mobility/gauge-electric-inflator-*.webp`

**Interfaces:**
- Consumes: product definitions in `docs/superpowers/specs/2026-07-18-mobility-category-design.md`.
- Produces: nine stable paths per product: `lead`, `angle-front`, `angle-rear`, `detail-primary`, `detail-material`, `context-wide`, `context-alt`, `context-active`, `context-use`.

- [ ] **Step 1: Generate each lead identity**

Use ImageGen once per product for a 4:3 photorealistic lead render. Inspect the complete object, proportions, manufacturing logic, and absence of text artefacts.

- [ ] **Step 2: Generate each detail sheet from its lead**

Use the lead as the reference image and request one borderless 2×2 sheet containing front profile, rear/folded profile, primary mechanism, and material/control close-up. Crop the four equal quadrants.

- [ ] **Step 3: Generate each context sheet from its lead**

Use the lead as the reference image and request one borderless 2×2 sheet containing four distinct realistic environments, with one human interaction only where operation or scale benefits from it. Crop the four equal quadrants.

- [ ] **Step 4: Normalize and verify**

Run ImageMagick to encode every crop as 1456×1092 WebP quality 92, then run:

```powershell
$files = Get-ChildItem public/assets/mobility/*.webp
if ($files.Count -ne 36) { throw "Expected 36 Mobility assets" }
$files | ForEach-Object {
  $dimensions = ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $_.FullName
  if ($dimensions -ne "1456x1092") { throw "$($_.Name) is $dimensions" }
}
```

Expected: 36 files, all `1456x1092`.

### Task 3: Integrate Mobility and the green surname

**Files:**
- Modify: `data/site.json`
- Modify: `server.js`
- Modify: `public/app.js`
- Modify: `public/work.html`
- Modify: `public/index.html`
- Modify: `public/about.html`
- Modify: `public/contact.html`
- Modify: `public/product.html`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: the 36 verified paths from Task 2.
- Produces: four project records, `mobility` category navigation, exact count validation, and `renderBrand(name)`.

- [ ] **Step 1: Add four complete project records**

Each record uses the existing schema, exactly eight unique `views`, four `crop`, four `insitu`, and the approved product materials, summary, and three manufacturing notes.

- [ ] **Step 2: Replace uniform category validation with exact counts**

```js
const PROJECT_CATEGORY_COUNTS = { furniture: 5, homewares: 5, lighting: 5, mobility: 4 };
const PROJECT_CATEGORIES = Object.keys(PROJECT_CATEGORY_COUNTS);
// validateSite:
if (categoryCounts[category] !== PROJECT_CATEGORY_COUNTS[category]) {
  throw new Error(`Category ${category} must contain exactly ${PROJECT_CATEGORY_COUNTS[category]} projects`);
}
```

- [ ] **Step 3: Add the accessible Work tab**

```html
<a role="tab" id="work-tab-mobility" href="/work?category=mobility" aria-controls="projects" aria-selected="false" tabindex="-1" data-work-category="mobility">Mobility</a>
```

- [ ] **Step 4: Render the surname safely**

```js
function renderBrand(name) {
  const brand = document.querySelector('[data-field="brand"]');
  if (!brand) return;
  const split = name.lastIndexOf(" ");
  if (split < 0) return setText('[data-field="brand"]', name);
  const family = document.createElement("span");
  family.className = "brand-family";
  family.textContent = name.slice(split + 1);
  brand.replaceChildren(`${name.slice(0, split)} `, family);
}
```

```css
.brand-family { color: var(--accent); }
```

- [ ] **Step 5: Update Work copy, metadata, and cache revisions**

Name Mobility in `workIntro` and `public/work.html` metadata. Bump the media revision and recalculate content hashes already used by every HTML page.

- [ ] **Step 6: Run the gates**

Run: `npm.cmd test && npm.cmd run eval`

Expected: PASS.

### Task 4: Extend responsive browser coverage

**Files:**
- Modify: `evals/browser-preflight.mjs`

**Interfaces:**
- Consumes: Mobility Work tab and product pages from Task 3.
- Produces: mobile/desktop evidence for four cards, four complete galleries, navigation, bounds, assets, and clean console output.

- [ ] **Step 1: Add Mobility to category coverage**

```js
const categories = ["furniture", "homewares", "lighting", "mobility"];
const expectedCards = { furniture: 5, homewares: 5, lighting: 5, mobility: 4 };
assert.equal(await page.locator(".project-card").count(), expectedCards[category]);
```

- [ ] **Step 2: Run browser verification**

Run: `npm.cmd run eval:browser`

Expected: `browser preflight passed` with no console errors, broken images, or overflow.

### Task 5: Commit, deploy, and verify production

**Files:**
- Commit only the Mobility, wordmark, test, eval, plan, and cache-revision changes.

**Interfaces:**
- Consumes: green local gates and visually approved galleries.
- Produces: pushed commit and healthy public site.

- [ ] **Step 1: Review the relevant diff**

Run: `git diff --check` and inspect staged paths so unrelated user files remain unstaged.

- [ ] **Step 2: Run fresh verification**

Run: `npm.cmd test`, `npm.cmd run eval`, and `npm.cmd run eval:browser`.

Expected: all pass.

- [ ] **Step 3: Commit and push**

```powershell
git commit -m "Add Mobility design category"
git push origin master
```

- [ ] **Step 4: Deploy**

Run: `docker compose up -d --build`

Expected: `portfolio` becomes healthy on port 8788.

- [ ] **Step 5: Verify public evidence**

Check `https://portfolio.jonllm.xyz/api/health`, `/work?category=mobility`, all four product URLs, the green `.brand-family`, and representative public asset SHA-256 hashes.
