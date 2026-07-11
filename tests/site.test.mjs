import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { webpDimensions } from "./media-dimensions.mjs";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-test-"));
process.env.PORTFOLIO_DATA_PATH = path.join(tempDir, "site.json");
process.env.ADMIN_PASSWORD = "secret";
fs.copyFileSync(path.resolve("data/site.json"), process.env.PORTFOLIO_DATA_PATH);

const { createServer, validateSite } = await import("../server.js");

const validSite = JSON.parse(fs.readFileSync(process.env.PORTFOLIO_DATA_PATH, "utf8"));
const adminCss = fs.readFileSync("public/admin.css", "utf8");
const adminHtml = fs.readFileSync("public/admin.html", "utf8");
const css = fs.readFileSync("public/styles.css", "utf8");
const index = fs.readFileSync("public/index.html", "utf8");
const app = fs.readFileSync("public/app.js", "utf8");
const admin = fs.readFileSync("public/admin.js", "utf8");
const work = fs.readFileSync("public/work.html", "utf8");
const PROJECT_CATEGORIES = ["furniture", "homewares", "lighting"];
validateSite(validSite);

function withProject(index, changes) {
  return {
    ...validSite,
    projects: validSite.projects.map((project, projectIndex) => projectIndex === index ? { ...project, ...changes } : project)
  };
}
assert(adminCss.includes("--text: #e6e2d8"));
assert(adminCss.includes("--accent: #adbd68"));
assert(adminCss.includes("border-radius: var(--radius)"));
assert(!css.includes("animation-timeline: view(block)"), "Below-fold content remains visible without scroll-timeline support");
assert(!css.includes("13vw"), "Mobile hero typography stays proportionate to the viewport");
assert(css.includes("letter-spacing: 0"), "Display typography does not use compressed negative tracking");
assert(css.includes("--media-ratio: 4 / 3"), "All public image containers share one 4:3 ratio");
assert(css.includes("object-fit: contain"), "Public images remain fully visible without cropping");
assert(css.includes(".gallery-image img {\n  object-fit: cover;"), "Detail-study tiles fill their frames without side bands");
assert(css.includes(".portrait-slot img") && css.includes("object-fit: cover"), "The portrait fills its frame without side bands");
for (const page of ["index", "work", "product", "about", "contact"]) {
  assert(fs.readFileSync(`public/${page}.html`, "utf8").includes("/styles.css?v=20260710-8"), `${page} loads the current full-frame image styles`);
}
for (const image of new Set([validSite.hero.image, validSite.about.portrait, ...validSite.projects.flatMap(project => [project.image, project.cardImage, project.detailImage, ...project.views.map(view => view.image)])])) {
  const { width, height } = webpDimensions(image);
  assert.equal(width * 3, height * 4, `${image} is a native 4:3 asset`);
}
assert(!app.includes('loading="lazy"'), "Public project imagery loads immediately rather than waiting for scroll position");
assert(app.includes("show(-1)") && app.includes("const fadeDuration = 900"), "Hero slideshow removes the current product before revealing the next one");
assert(css.includes(".project-card:nth-child(4)") && css.includes(".project-card:nth-child(5)"), "Every category uses the same balanced five-card layout");
assert(adminHtml.includes('/favicon.svg?v=20260705-4'), "Admin uses the same JB browser icon as the public site");
assert.throws(() => validateSite({ projects: [] }), /Brand/);
assert.throws(() => validateSite({ ...validSite, brand: "   " }), /Brand/);
assert.throws(() => validateSite({ ...validSite, contact: { ...validSite.contact, email: "not-email" } }), /valid email/);
assert.throws(() => validateSite({ ...validSite, contact: { ...validSite.contact, phone: "12" } }), /valid phone/);
assert.throws(() => validateSite(withProject(0, { category: "" })), /category/);
assert.throws(() => validateSite(withProject(0, { category: "appliances" })), /category/);
assert.throws(() => validateSite(withProject(0, { category: "homewares" })), /exactly five/);
assert.throws(() => validateSite(withProject(0, { href: "/work/wrong" })), /links/);
assert.throws(() => validateSite({ ...validSite, projects: validSite.projects.map((project, index) => index === 1 ? { ...validSite.projects[0] } : project) }), /unique/);
assert.throws(() => validateSite(withProject(0, { slug: "Bad Slug", href: "/work/Bad Slug" })), /lowercase/);
assert.throws(() => validateSite(withProject(0, { materials: "" })), /materials/);
assert.throws(() => validateSite(withProject(0, { notes: ["Only one"] })), /detail notes/);
assert.throws(() => validateSite(withProject(0, { notes: ["One", "Two", "   "] })), /detail notes/);
assert.throws(() => validateSite(withProject(0, { views: validSite.projects[0].views.slice(0, 7) })), /one main image, four cropped views, and four in situ views/);
assert.throws(() => validateSite(withProject(0, { views: validSite.projects[0].views.map(view => ({ ...view, type: "crop" })) })), /one main image, four cropped views, and four in situ views/);
assert.throws(() => validateSite({
  ...withProject(0, {}),
  projects: validSite.projects.map((project, index) => index === 0 ? {
    ...project,
    views: [{ ...project.views[0], image: project.image }, ...project.views.slice(1)]
  } : project)
}), /unique/);
assert.throws(() => validateSite(withProject(0, { views: [{ ...validSite.projects[0].views[0], image: "/assets/furniture/missing-view.webp" }, ...validSite.projects[0].views.slice(1)] })), /does not exist/);
assert.throws(() => validateSite(withProject(0, { image: "/assets/furniture/missing.webp" })), /does not exist/);
assert.throws(() => validateSite(withProject(0, { cardImage: "/assets/furniture/missing-card.webp" })), /does not exist/);
assert.throws(() => validateSite({ ...validSite, about: { ...validSite.about, portrait: "/assets/missing-portrait.webp" } }), /does not exist/);
assert.throws(() => validateSite(withProject(0, { image: "https://example.com/chair.png" })), /WebP/);
validateSite(withProject(0, { image: "https://example.com/chair.webp" }));
assert.throws(() => validateSite(withProject(0, { image: "/favicon.svg" })), /WebP/);
assert.throws(() => validateSite(withProject(0, { image: "/assets/furniture/arc-lounge-chair-card-motion.webp" })), /native 4:3/);
assert.throws(() => validateSite({ ...validSite, nav: [{ label: "Work", href: "#work" }] }), /separate page paths/);
assert.throws(() => validateSite({ ...validSite, nav: [{ label: "Missing", href: "/missing" }] }), /missing page/);
assert.throws(() => validateSite({ ...validSite, hero: { ...validSite.hero, ctaHref: "" } }), /Hero CTA is required/);
assert.throws(() => validateSite({ ...validSite, hero: { ...validSite.hero, ctaHref: "/missing" } }), /missing page/);
assert.throws(() => validateSite({ ...validSite, about: { ...validSite.about, experience: [{ ...validSite.about.experience[0], description: "" }] } }), /period, and description/);

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
  assert.equal(site.workCta, "Get in contact");
  assert.equal(site.projects[0].slug, "contour-lounge-chair");
  assert.equal(site.projects.length, 15);
  assert.deepEqual(Object.fromEntries(PROJECT_CATEGORIES.map(category => [category, site.projects.filter(project => project.category === category).length])), {
    furniture: 5,
    homewares: 5,
    lighting: 5
  });
  assert(site.projects.some(project => project.slug === "dining-table" && project.title === "Ridge Dining Table"));
  assert.equal(site.projects[0].cardImage, "/assets/furniture/contour-lounge-chair-card-4x3.webp");
  assert.match(site.projects[0].summary, /continuous timber frame/);
  assert.equal(site.projects[0].views.length, 8);
  assert.equal(site.projects[0].views.filter(view => view.type === "crop").length, 4);
  assert.equal(site.projects[0].views.filter(view => view.type === "insitu").length, 4);
  assert.equal([site.projects[0].cardImage, ...site.projects[0].views.map(view => view.image)].length, 9);
  assert(site.projects.every(project => {
    const images = [project.image, ...project.views.map(view => view.image)].filter(Boolean);
    return new Set(images).size === images.length;
  }));
  assert(site.projects.every(project => project.views.filter(view => view.type === "insitu").every(view => /-insitu-v(?:[1-5]|4-fixed)\.webp$/.test(view.image))));
  assert(site.projects.find(project => project.slug === "arc-lounge-chair").views.some(view => view.image === "/assets/furniture/arc-lounge-chair-insitu-v4-fixed.webp"));
  assert(site.projects.find(project => project.slug === "dining-table").views.filter(view => view.type === "insitu").every(view => view.image.includes("/ridge-four-leg-insitu-")));
  assert.equal(site.about.experienceTitle, "Relevant Experience");
  assert.equal(site.about.portrait, "/assets/portrait-sharp-4x3.webp");
  assert.equal(site.hero.title, "Industrial design with curiosity, range, and purpose.");
  assert(site.hero.body.trim().split(/\s+/).length <= 20, "Hero introduction remains concise");
  assert(index.includes(site.hero.body), "Home fallback copy matches site data");
  assert.match(site.about.body, /industrial designer and design all-rounder/);
  assert.match(site.about.body, /genuine love of design/);
  assert.match(site.about.body, /learns from others/);
  assert.equal(site.about.experience[0].role, "Industrial design and product development");
  assert.equal(site.about.experience[1].role, "AI and image generation");
  assert.match(site.about.experience[1].description, /strong hands-on experience and a genuine passion for AI and image generation/i);
  assert(site.about.experience.some(item => item.role === "Graphic design and catalogues"));
  assert.match(site.about.body, /Self-taught in graphic design/);
  assert.match(site.about.body, /catalogue design and supporting marketing work/);
  assert.match(site.about.experience.at(-1).description, /looking beyond obvious answers/);
  assert.equal(site.contact.email, "jonbrooks35@gmail.com");
  assert.equal(site.contact.phone, "0412 218 673");
  assert(app.includes('"mailto:", "tel:"'), "Public links safely retain phone links");
  assert(work.includes('role="tablist"') && PROJECT_CATEGORIES.every(category => work.includes(`data-work-category="${category}"`)), "Work page exposes three accessible category tabs");
  assert(app.includes("new URLSearchParams(location.search)") && app.includes('addEventListener("popstate"'), "Work category persists in browser history");
  assert(["ArrowRight", "ArrowLeft", "Home", "End"].every(key => app.includes(`event.key === "${key}"`)), "Work tabs support standard keyboard navigation");
  assert(app.includes("categoryProjects") && app.includes("item.category === project.category"), "Project navigation stays within the current category");
  assert(app.includes("previousProject") && app.includes("Previous project"), "Product pages expose previous and next navigation within each category");
  assert(app.includes("lightbox.showModal()") && app.includes("previewTrigger?.focus()"), "Image preview uses the native dialog with focus restoration");
  assert(admin.includes('data-view-key="image"') && admin.includes("function renderExperience") && admin.includes('data-key="category"'), "Admin edits category, image studies, and experience as structured fields");
  assert(!adminHtml.includes("Add project") && !admin.includes("Remove project"), "Admin preserves the fixed five-project category contract");

  const workPage = await fetch(`${base}/work`);
  assert.equal(workPage.status, 200);
  const furnitureWork = await workPage.text();
  assert.match(furnitureWork, /Contour Lounge Chair/);
  assert.doesNotMatch(furnitureWork, /Axis Kettle/);

  const homewaresWork = await fetch(`${base}/work?category=homewares`);
  assert.equal(homewaresWork.status, 200);
  const homewaresHtml = await homewaresWork.text();
  assert.match(homewaresHtml, /Axis Kettle/);
  assert.doesNotMatch(homewaresHtml, /Contour Lounge Chair/);
  assert.match(homewaresHtml, /data-work-category="homewares"[^>]+aria-selected="true"/);

  const productPage = await fetch(`${base}/work/silhouette-sofa`);
  assert.equal(productPage.status, 200);
  assert.match(await productPage.text(), /product-page/);

  const heroChairPage = await fetch(`${base}/work/contour-lounge-chair`);
  assert.equal(heroChairPage.status, 200);

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

  const invalidSite = { ...site, projects: site.projects.map((project, index) => index === 0 ? { ...project, href: "/work/wrong" } : project) };
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
