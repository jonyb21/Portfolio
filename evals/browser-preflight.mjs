import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = 18999;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Portfolio test server did not start");
}

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

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(`${origin}/work?category=homewares`, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".project-card").count(), 5, "Homewares renders five cards");
  assert.equal(await page.locator('[data-work-category="homewares"]').getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("#work-category-heading").textContent(), "Homewares");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "Mobile Work does not overflow horizontally");
  await assertImagesRender(page, ".project-card img", "Work card");

  await page.locator('[data-work-category="lighting"]').click();
  await page.waitForURL(/category=lighting/);
  assert.equal(await page.locator(".project-card").count(), 5, "Lighting renders five cards");
  await page.goBack();
  assert.equal(await page.locator('[data-work-category="homewares"]').getAttribute("aria-selected"), "true", "Browser history restores the selected category");

  await page.locator('.project-card[href="/work/axis-kettle"]').click();
  await page.waitForLoadState("networkidle");
  await assertImagesRender(page, ".project-gallery img", "Product gallery");
  assert.equal(await page.locator('.back-link').getAttribute("href"), "/work?category=homewares");
  assert.equal(await page.locator('.project-end-nav a').count(), 3, "Product navigation includes previous, next, and contact links");
  assert.match(await page.locator('.project-end-nav a').nth(0).getAttribute("href"), /^\/work\//);
  assert.match(await page.locator('.project-end-nav a').nth(1).getAttribute("href"), /^\/work\//);
  assert.deepEqual(consoleErrors, [], "Browser console remains clean");
  console.log("browser preflight passed");
} finally {
  await browser?.close();
  server.kill();
}
