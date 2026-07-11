import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { chromium } from "playwright";
import serverModule from "../server.js";

const { createServer } = serverModule;
const server = createServer();
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;
const appRevision = crypto.createHash("sha256").update(fs.readFileSync("public/app.js")).digest("hex").slice(0, 12);
const styleRevision = crypto.createHash("sha256").update(fs.readFileSync("public/styles.css")).digest("hex").slice(0, 12);
const MEDIA_REVISION = "20260711-1";

async function assertImagesRender(page, selector, label) {
  const images = page.locator(selector);
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    const state = await image.evaluate(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return { complete: element.complete, width: element.naturalWidth, opacity: Number(style.opacity), renderedWidth: rect.width, renderedHeight: rect.height };
    });
    assert(state.complete && state.width > 0 && state.opacity > 0 && state.renderedWidth > 0 && state.renderedHeight > 0, `${label} image ${index + 1} is visibly rendered`);
  }
}

async function assertMobileBounds(page, selector, label) {
  const outside = await page.locator(selector).evaluateAll(elements => elements.map((element, index) => {
    const rect = element.getBoundingClientRect();
    return { index, left: rect.left, right: rect.right };
  }).filter(rect => rect.left < -1 || rect.right > innerWidth + 1));
  assert.deepEqual(outside, [], `${label} stays inside the mobile viewport`);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const site = await fetch(`${origin}/api/site`).then(response => response.json());
  const categories = ["furniture", "homewares", "lighting"];
  for (const category of categories) {
    await page.goto(`${origin}/work?category=${category}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator('script[src^="/app.js"]').getAttribute("src"), `/app.js?v=${appRevision}`, `${category} loads the current app.js revision`);
    assert.equal(await page.locator('link[href^="/styles.css"]').getAttribute("href"), `/styles.css?v=${styleRevision}`, `${category} loads the current styles.css revision`);
    assert.equal(await page.locator(".project-card").count(), 5, `${category} renders five cards`);
    assert.equal(await page.locator(`[data-work-category="${category}"]`).getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("#work-category-heading").textContent(), `${category[0].toUpperCase()}${category.slice(1)}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${category} does not overflow horizontally`);
    assert.equal(await page.locator(".project-card img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true, `${category} card images finish loading before scroll`);
    await assertMobileBounds(page, ".project-card", `${category} cards`);
    await assertImagesRender(page, ".project-card img", `${category} card`);
    assert.equal(await page.locator(".project-card img").evaluateAll(images => images.every(image => image.currentSrc.includes("v=20260711-1"))), true, `${category} cards load media revision ${MEDIA_REVISION}`);
  }

  await page.goto(`${origin}/work?category=homewares`, { waitUntil: "networkidle" });
  await page.locator('[data-work-category="lighting"]').click();
  await page.waitForURL(/category=lighting/);
  assert.equal(await page.locator(".project-card").count(), 5, "Lighting renders five cards");
  await page.goBack();
  assert.equal(await page.locator('[data-work-category="homewares"]').getAttribute("aria-selected"), "true", "Browser history restores the selected category");

  for (const project of site.projects) {
    await page.goto(`${origin}${project.href}`, { waitUntil: "networkidle" });
    assert.equal(await page.locator(".lead-image img, .project-gallery img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true, `${project.title} loads all project images before scroll`);
    await assertImagesRender(page, ".lead-image img, .project-gallery img", project.title);
    assert.equal(await page.locator(".lead-image img, .project-gallery img").count(), 9, `${project.title} renders its lead and eight study images`);
    assert.equal(await page.locator('.back-link').getAttribute("href"), `/work?category=${project.category}`);
    assert.equal(await page.locator('.project-end-nav a').count(), 3, `${project.title} includes previous, next, and contact links`);
    await assertMobileBounds(page, ".project-detail.single, .lead-image, .gallery-image, .project-end-nav", project.title);
  }
  assert.deepEqual(consoleErrors, [], "Browser console remains clean");
  console.log("browser preflight passed");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
