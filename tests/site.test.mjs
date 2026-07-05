import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-test-"));
process.env.PORTFOLIO_DATA_PATH = path.join(tempDir, "site.json");
process.env.ADMIN_PASSWORD = "secret";
fs.copyFileSync(path.resolve("data/site.json"), process.env.PORTFOLIO_DATA_PATH);

const { createServer, validateSite } = await import("../server.js");

validateSite(JSON.parse(fs.readFileSync(process.env.PORTFOLIO_DATA_PATH, "utf8")));
assert.throws(() => validateSite({ projects: [] }), /Brand/);

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

  const workPage = await fetch(`${base}/work`);
  assert.equal(workPage.status, 200);
  assert.match(await workPage.text(), /Selected Work/);

  const denied = await fetch(`${base}/api/site`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(site)
  });
  assert.equal(denied.status, 401);

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
