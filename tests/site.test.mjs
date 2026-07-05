import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-test-"));
process.env.PORTFOLIO_DATA_PATH = path.join(tempDir, "site.json");
process.env.ADMIN_PASSWORD = "secret";
fs.copyFileSync(path.resolve("data/site.json"), process.env.PORTFOLIO_DATA_PATH);

const { createServer, validateSite } = await import("../server.js");

const validSite = JSON.parse(fs.readFileSync(process.env.PORTFOLIO_DATA_PATH, "utf8"));
validateSite(validSite);
assert.throws(() => validateSite({ projects: [] }), /Brand/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0], href: "/work/wrong" }] }), /links/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0] }, { ...validSite.projects[0] }] }), /unique/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0], slug: "Bad Slug", href: "/work/Bad Slug" }] }), /lowercase/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0], materials: "" }] }), /materials/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0], notes: ["Only one"] }] }), /detail notes/);
assert.throws(() => validateSite({ ...validSite, projects: [{ ...validSite.projects[0], image: "/assets/furniture/missing.png" }] }), /does not exist/);
validateSite({ ...validSite, projects: [{ ...validSite.projects[0], image: "https://example.com/chair.png" }] });
assert.throws(() => validateSite({ ...validSite, nav: [{ label: "Work", href: "#work" }] }), /separate page paths/);

const server = createServer();
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

try {
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).ok, true);

  const site = await fetch(`${base}/api/site`).then(response => response.json());
  assert.equal(site.brand, "Jon Brooks");
  assert.equal(site.nav[0].href, "/work");
  assert.equal(site.projects[0].slug, "silhouette-sofa");
  assert.match(site.projects[0].summary, /single continuous gesture/);
  assert.equal(site.about.experienceTitle, "Relevant Experience");
  assert.equal(site.about.experience[0].role, "Furniture and object design");
  assert.match(site.about.experience.at(-1).description, /bespoke and small-batch pieces/);

  const workPage = await fetch(`${base}/work`);
  assert.equal(workPage.status, 200);
  assert.match(await workPage.text(), /Selected Work/);

  const productPage = await fetch(`${base}/work/silhouette-sofa`);
  assert.equal(productPage.status, 200);
  assert.match(await productPage.text(), /product-page/);

  const missingProduct = await fetch(`${base}/work/not-a-project`);
  assert.equal(missingProduct.status, 404);

  const aboutPage = await fetch(`${base}/about`);
  assert.equal(aboutPage.status, 200);
  assert.match(await aboutPage.text(), /experience-list/);

  const denied = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(site)
  });
  assert.equal(denied.status, 401);

  const authDenied = await fetch(`${base}/api/auth/check`, { method: "POST" });
  assert.equal(authDenied.status, 401);

  const authOk = await fetch(`${base}/api/auth/check`, {
    method: "POST",
    headers: { "x-admin-password": "secret" }
  });
  assert.equal(authOk.status, 200);

  const invalidSite = { ...site, projects: [{ ...site.projects[0], href: "/work/wrong" }] };
  const invalidSave = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-admin-password": "secret"
    },
    body: JSON.stringify(invalidSite)
  });
  assert.equal(invalidSave.status, 400);
  assert.match((await invalidSave.json()).error, /links/);

  site.brand = "Updated Brand";
  const saved = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-admin-password": "secret"
    },
    body: JSON.stringify(site)
  });
  assert.equal(saved.status, 200);
  assert.equal(JSON.parse(fs.readFileSync(process.env.PORTFOLIO_DATA_PATH, "utf8")).brand, "Updated Brand");
} finally {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(tempDir, { recursive: true, force: true });
}
