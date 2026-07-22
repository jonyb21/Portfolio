# Pivot Writing Desk Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a nine-image Pivot Writing Desk gallery with one unchanged product identity.

**Architecture:** Reuse the existing lead as the canonical reference, generate eight derived views against it, write new versioned WebPs, and update only the desk record and its existing deterministic gates.

**Tech Stack:** Built-in `image_gen`, FFmpeg/WebP, JSON, Node assertions, Playwright.

## Global Constraints

- Preserve exact dark-walnut top, two graphite sled frames, continuous charcoal service spine, olive felt tray left, central walnut panel on two pivots, paired cable sockets right, and stainless joint fasteners.
- Nine unique 4:3 WebPs using `pivot-writing-desk-*-photo-v4.webp`.
- No renderer, layout, dependency, or schema changes.

### Task 1: Add the failing desk contract

**Files:** `tests/site.test.mjs`, `evals/preflight.mjs`

- [ ] Replace the current `photo-v3` desk assertion with `photo-v4`, and assert the copy contains `two graphite sled frames`, `continuous charcoal service spine`, `olive felt`, `two cable sockets`, and `pivot panel`.
- [ ] Run `npm.cmd test` and `npm.cmd run eval`; expect both to fail on the current v3 record.
- [ ] Commit with `git commit -m "Test Pivot desk identity contract"`.

### Task 2: Build the versioned WebP gallery

**Files:** create nine `public/assets/furniture/pivot-writing-desk-*-photo-v4.webp` assets matching the existing lead/front/rear/detail/context filename roles.

- [ ] Copy the existing v3 lead to the new v4 lead path as the canonical product reference.
- [ ] Generate four crops from that single reference: front, rear, tray/socket detail, and bolted leg-joint detail.
- [ ] Generate four contexts from that single reference: shared studio work, bedroom with panel stowed, human sketching with panel upright, and unoccupied console mode with panel stowed.
- [ ] Convert every selected output to 1200x900 WebP and inspect a 3x3 contact sheet. Regenerate any component drift or impossible joint.

### Task 3: Wire and verify

**Files:** `data/site.json`, `tests/site.test.mjs`, `evals/preflight.mjs`

- [ ] Update only the Pivot desk paths, labels, summary, and notes to match the canonical construction and legitimate panel states.
- [ ] Run `powershell -ExecutionPolicy Bypass -File scripts/normalize-media.ps1`.
- [ ] Run `npm.cmd test`, `npm.cmd run eval`, `npm.cmd run eval:browser`, and `git diff --check`; all must pass.
- [ ] Commit assets and integration, then push the existing branch.

### Task 4: Production handoff

- [ ] State the exact production change and request confirmation.
- [ ] After confirmation, deploy assets first, verify every new public WebP, then switch live data and verify desktop/mobile rendering.
