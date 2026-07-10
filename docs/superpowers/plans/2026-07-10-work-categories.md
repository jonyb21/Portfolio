# Work Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task.

**Goal:** Add Furniture, Homewares, and Lighting tabs to the portfolio, with exactly five complete projects per category and reliable 4:3 imagery on desktop and mobile.

**Architecture:** Keep the existing server-rendered file structure and client-side data renderer. Add a required category field at the data boundary, filter the existing project-card renderer by a query-backed tab state, and scope product navigation to the active project's category. Preserve the existing editorial layout and project-detail schema rather than introducing a framework or a second page type.

**Tech Stack:** Node.js, vanilla JavaScript, HTML, CSS, JSON, WebP, Node assert tests, Playwright/browser QA.

## Global Constraints

- Work in the current `C:\PORTFOLIO` working tree because the staged 4:3 furniture assets and related image fixes are part of the release.
- Do not revert or overwrite unrelated staged or untracked work.
- Keep the existing dark editorial design language with restrained olive active states and typography-led hierarchy.
- Use original product concepts informed by Dieter Rams principles, without copying named products, logos, or identifying details.
- Every project must have one lead image, one card image, four unique crop views, and four unique in-situ views.
- Every public project image container remains 4:3 and uses non-cropping presentation for lead and card assets.
- `/work` must remain usable without a framework and must default to Furniture for missing or invalid category query values.
- Category tabs must be accessible by pointer, Tab, Left Arrow, Right Arrow, Home, and End.
- Mobile must display one unclipped tab row and one-column project cards without horizontal page overflow.
- Tests and evals must cover the new contract, browser behavior, asset existence, and category counts.

---

## Task 1: Enforce the project category contract

**Files:**
- Modify: `server.js`
- Modify: `data/site.json`
- Modify: `tests/site.test.mjs`
- Modify: `evals/preflight.mjs`

**Steps:**

1. Add failing assertions that every project has a category in `furniture`, `homewares`, or `lighting`, that each category appears exactly five times, and that invalid categories fail validation.
2. Run `npm.cmd test` and confirm the new assertions fail for the missing contract.
3. Add `PROJECT_CATEGORIES = ["furniture", "homewares", "lighting"]` in `server.js` and reject missing or invalid `project.category` values inside `validateSite`.
4. Add `category: "furniture"` to the five existing projects in `data/site.json`.
5. Extend `evals/preflight.mjs` so the content-quality gate checks the allowed categories and exact five-per-category count.
6. Run `npm.cmd test` and `npm.cmd run eval`; the category checks should still fail only because the ten new projects are not present yet.

## Task 2: Add the accessible category tabs and filtered work grid

**Files:**
- Modify: `public/work.html`
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `tests/site.test.mjs`
- Modify: `evals/preflight.mjs`

**Steps:**

1. Add failing source assertions for an accessible `role="tablist"`, three category tabs, query-string state, keyboard navigation, and a mobile overflow rule.
2. Run `npm.cmd test` and confirm the new assertions fail.
3. Add the Furniture, Homewares, and Lighting tablist above `#projects` in `public/work.html` with stable tab and panel ids.
4. Add small `workCategory`, `renderWorkProjects`, `selectWorkCategory`, and `bindWorkCategories` helpers in `public/app.js`.
5. Read `?category=` with `URLSearchParams`, default invalid values to `furniture`, update `aria-selected` and `tabindex`, replace the grid with only the five matching projects, preserve browser history, and respond to `popstate`.
6. Support Left Arrow, Right Arrow, Home, and End while keeping focus on the selected tab.
7. Style the tabs as a compact editorial segmented row with equal-width labels, a restrained olive active state, and a mobile horizontal fit without clipping or page overflow.
8. Run `npm.cmd test` and confirm the tab assertions pass.

## Task 3: Keep project navigation inside its category

**Files:**
- Modify: `public/app.js`
- Modify: `tests/site.test.mjs`
- Modify: `evals/preflight.mjs`

**Steps:**

1. Add a failing assertion that product navigation filters `site.projects` by `project.category` before choosing the next project.
2. Run `npm.cmd test` and confirm the assertion fails.
3. In the product renderer, derive `categoryProjects`, find the current project inside that list, and calculate the wrapped next project from the same category.
4. Make the Back to work link include `?category=${project.category}` so the selected tab is restored.
5. Run `npm.cmd test` and `npm.cmd run eval`.

## Task 4: Add category editing to the admin

**Files:**
- Modify: `public/admin.js`
- Modify: `tests/site.test.mjs`

**Steps:**

1. Add failing assertions for a category select with the three allowed values and category collection during save.
2. Run `npm.cmd test` and confirm the assertions fail.
3. Add a Category select to `projectRow` immediately after Title and populate its current value.
4. Add `category` to the project object returned by `collect()`.
5. Default newly added projects to `furniture`.
6. Run `npm.cmd test`.

## Task 5: Add five Homewares projects and complete image sets

**Files:**
- Modify: `data/site.json`
- Add: `public/assets/homewares/*.webp`

**Projects:**
- Axis Kettle
- Tempo Clock
- Grid Tray System
- Signal Radio
- Ratio Coffee Mill

**Steps:**

1. Create an original 4:3 lead and card image for each product, using cool neutral studio backgrounds, disciplined geometry, quiet controls, aluminium, off-white polymer, and charcoal details.
2. Create four unique 4:3 detail crops and four unique 4:3 in-situ images per product, with no text, logos, people, or identifying copied product details.
3. Add five complete `category: "homewares"` project records using the existing schema: title, slug, href, year, type, materials, summary, notes, lead, card, detail, and eight typed views.
4. Use concise editorial copy that explains function, material economy, maintenance, and longevity.
5. Run `npm.cmd test` and confirm every referenced file exists, each required lead/card asset is native 4:3, and every project path is unique.

## Task 6: Add five Lighting projects and complete image sets

**Files:**
- Modify: `data/site.json`
- Add: `public/assets/lighting/*.webp`

**Projects:**
- Column Table Lamp
- Rail Task Light
- Halo Pendant
- Plane Wall Light
- Line Floor Lamp

**Steps:**

1. Create an original 4:3 lead and card image for each product in the same visual system as Homewares.
2. Create four unique 4:3 detail crops and four unique 4:3 in-situ images per product, showing credible illumination, controls, construction, and domestic scale.
3. Add five complete `category: "lighting"` project records using the existing project schema.
4. Keep copy and materials distinct per product while preserving the same editorial tone and information density as Furniture.
5. Run `npm.cmd test` and confirm the complete site reaches exactly fifteen projects, five in each category.

## Task 7: Verify content, responsive layout, and live image delivery

**Files:**
- Modify if required: `public/styles.css`
- Modify if required: `tests/site.test.mjs`
- Modify if required: `evals/preflight.mjs`
- Verify: all changed files and assets

**Steps:**

1. Run `npm.cmd test`.
2. Run `npm.cmd run eval`.
3. Run `git diff --check`.
4. Start the local server and verify `/work?category=furniture`, `/work?category=homewares`, and `/work?category=lighting` in a desktop viewport.
5. Verify tab pointer interaction, keyboard interaction, URL updates, Back behavior, and category-scoped Next project behavior.
6. Verify the same three categories at 390 by 844 pixels with no horizontal page overflow, no clipped tab text, and fully visible 4:3 project cards.
7. Check the browser console for errors and confirm every displayed image request returns HTTP 200.
8. Include the already staged furniture 4:3 assets in the release so the current production 404s are removed.
9. Commit the complete tested change, push the current branch, then verify all three categories and representative furniture, homewares, and lighting image URLs on `https://portfolio.jonllm.xyz`.
