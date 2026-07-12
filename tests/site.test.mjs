import assert from "node:assert/strict";
import crypto from "node:crypto";
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
const appRevision = crypto.createHash("sha256").update(app).digest("hex").slice(0, 12);
const styleRevision = crypto.createHash("sha256").update(css).digest("hex").slice(0, 12);
const MEDIA_REVISION = "20260712-1";
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
  const html = fs.readFileSync(`public/${page}.html`, "utf8");
  assert(html.includes(`/styles.css?v=${styleRevision}`), `${page} loads styles.css through its current content revision`);
  assert(html.includes(`/app.js?v=${appRevision}`), `${page} loads app.js through its current content revision`);
}
assert(app.includes(`const MEDIA_REVISION = "${MEDIA_REVISION}"`), "Browser-rendered images use the current media revision");
assert(fs.readFileSync("server.js", "utf8").includes(`const MEDIA_REVISION = "${MEDIA_REVISION}"`), "Server-rendered cards use the same media revision");
assert(css.includes("bottom: 16px") && css.includes("font-size: clamp(1rem, 1.15vw, 1.15rem)"), "Work card titles sit low at a compact scale");
assert(css.includes("rgb(0 0 0 / 0.68)") && css.includes("text-shadow: 0 1px 8px"), "Work card labels remain readable without covering the product");
assert(app.includes("light-switch-card") && app.includes("light-state-off") && app.includes("light-state-on"), "Lighting cards render distinct switched-off and illuminated states");
assert(css.includes("transition: opacity 650ms ease-in-out") && css.includes(".light-switch-card:hover .light-state-on"), "Lighting cards crossfade on hover without changing product layout");
assert(css.includes("grid-template-columns: repeat(2, minmax(0, 1fr))") && css.includes(".project-end-nav .project-contact"), "Project navigation uses a balanced two-column editorial layout");
assert(fs.readFileSync("public/product.html", "utf8").includes('content="Industrial design project by Jon Brooks."'), "Project metadata covers the complete industrial-design portfolio");
for (const image of new Set([validSite.hero.image, validSite.about.portrait, ...validSite.projects.flatMap(project => [project.image, project.cardImage, project.detailImage, ...project.views.map(view => view.image)])])) {
  const { width, height } = webpDimensions(image);
  assert.equal(width * 3, height * 4, `${image} is a native 4:3 asset`);
  assert(width >= 1200 && height >= 900, `${image} is large enough to render crisply`);
}
assert(!app.includes('loading="lazy"'), "Public project imagery loads immediately rather than waiting for scroll position");
assert(app.includes("show(-1)") && app.includes("const fadeDuration = 900"), "Hero slideshow removes the current product before revealing the next one");
assert(app.includes("const heroProjects = shuffled(") && !app.includes("featuredIndex"), "Homepage starts with a random designed piece on every visit");
assert(!/\.project-card:nth-child\(|a\.project-card\[href="\/work\/dining-table"\]\s*\{\s*grid-column:/.test(css), "All product cards use the shared default tile size");
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
assert.throws(() => validateSite(withProject(0, { image: "https://example.com/chair.png" })), /Remote images are not supported/);
assert.throws(() => validateSite(withProject(0, { image: "https://example.com/chair.webp" })), /Remote images are not supported/);
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
  assert.match(site.workIntro, /furniture, homewares, and lighting/);
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
  assert(site.projects.every(project => project.views.filter(view => view.type === "insitu").every(view => /-(?:insitu-v(?:[1-5]|4-fixed)|in-use-v1|context-(?:wide|alt|active|use)-vibrant-v1)\.webp$/.test(view.image))));
  assert(site.projects.filter(project => project.category !== "furniture").every(project => project.views.some(view => view.type === "insitu" && view.image.endsWith("-context-use-vibrant-v1.webp"))), "Every Homewares and Lighting project includes a use scene");
  assert(site.projects.filter(project => project.category !== "furniture").every(project => [project.image, project.cardImage, project.detailImage, ...project.views.map(view => view.image)].every(image => image.includes("-vibrant-v1.webp"))), "Homewares and Lighting use the final vibrant image system");
  assert(site.projects.filter(project => project.category === "lighting").every(project => project.cardImage.endsWith("-card-off-vibrant-v1.webp") && project.cardImage !== project.image), "Every lighting card has a separate switched-off render");
  assert(site.projects.filter(project => project.category !== "furniture").every(project => project.views.slice(0, 4).every(view => view.type === "crop") && project.views.slice(4).every(view => view.type === "insitu")), "Vibrant galleries keep four studio studies followed by four context views");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/rail-task-light-angle-rear-vibrant-v1.webp")).digest("hex"), "d8d0a1cc9b40ff4b105567d5c8ad0ece8835ec7618dd0ea3cbb7f568f19d968c", "Vector folded view uses the approved fully connected render");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/halo-pendant-card-off-vibrant-v1.webp")).digest("hex"), "93659eb2b16d4e0d9aae054473cd9eec574c2c990625aa56afe59abc98cc9a52", "Aperture card uses the approved symmetric switched-off render");
  assert.equal(site.projects.find(project => project.slug === "plane-wall-light").title, "Rill Wall Light");
  assert.match(site.projects.find(project => project.slug === "plane-wall-light").summary, /pivot.*tilt/i);
  assert.match(site.projects.find(project => project.slug === "ratio-coffee-mill").materials, /stainless steel/i);
  assert.match(site.projects.find(project => project.slug === "axis-kettle").materials, /mirror-gloss/i);
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/homewares/axis-kettle-context-active-vibrant-v1.webp")).digest("hex"), "03c6aea96e2fd6004d675b76511c1218b4ca00dca56c18694e2766e518948fa7", "Flux pouring render uses the approved glossy-body and closed-lid image");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/homewares/axis-kettle-context-use-vibrant-v1.webp")).digest("hex"), "7dfffd8da802eb16bf1b4b39a4e102f8a75ec4e59232ea3d87383a45623f6b61", "Flux filling render uses the approved hinged-lid image");
  assert(site.projects.find(project => project.slug === "grid-tray-system").views.some(view => view.label === "Separated desk modules"));
  assert(site.projects.find(project => project.slug === "arc-lounge-chair").views.some(view => view.image === "/assets/furniture/arc-lounge-chair-insitu-v4-fixed.webp"));
  assert(site.projects.find(project => project.slug === "dining-table").views.filter(view => view.type === "insitu").every(view => view.image.includes("/ridge-four-leg-insitu-")));
  assert.equal(site.about.experienceTitle, "Relevant Experience");
  assert.equal(site.about.portrait, "/assets/portrait-sharp-4x3.webp");
  assert.equal(site.hero.title, "Industrial design with curiosity, range, and purpose.");
  assert(site.hero.body.trim().split(/\s+/).length <= 20, "Hero introduction remains concise");
  assert(index.includes(site.hero.body), "Home fallback copy matches site data");
  assert.match(site.about.body, /industrial designer and design all-rounder/);
  assert.match(site.about.body, /genuinely enjoys shaping/);
  assert.match(site.about.body, /value other people's experience/);
  assert.equal(site.about.experience[0].role, "Industrial design and product development");
  assert.equal(site.about.experience[1].role, "Graphic design and catalogues");
  assert.equal(site.about.experience[2].role, "AI and image generation");
  assert.match(site.about.body, /strong hands-on experience with AI and image generation/i);
  assert.match(site.about.body, /self-taught in graphic design/i);
  assert.match(site.about.body, /catalogues, production artwork, and supporting marketing material/);
  assert(site.about.experience.some(item => item.period === "Personality" && item.role === "Curious and always learning"));
  assert.match(site.about.experience.find(item => item.period === "Personality").description, /learn, upskill, and improve/);
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
  assert.doesNotMatch(furnitureWork, /Flux Kettle/);

  const homewaresWork = await fetch(`${base}/work?category=homewares`);
  assert.equal(homewaresWork.status, 200);
  const homewaresHtml = await homewaresWork.text();
  assert.match(homewaresHtml, /Flux Kettle/);
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
