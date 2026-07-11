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
  assert.equal(await page.locator("img[src]").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true, "All sourced Work images load");

  await page.locator('[data-work-category="lighting"]').click();
  await page.waitForURL(/category=lighting/);
  assert.equal(await page.locator(".project-card").count(), 5, "Lighting renders five cards");
  await page.goBack();
  assert.equal(await page.locator('[data-work-category="homewares"]').getAttribute("aria-selected"), "true", "Browser history restores the selected category");

  await page.locator('.project-card[href="/work/axis-kettle"]').click();
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(".project-gallery img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true, "Every product image loads");
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
