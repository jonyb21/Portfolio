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
const PROJECT_CATEGORY_COUNTS = { furniture: 6, homewares: 6, lighting: 6, mobility: 6 };
const PROJECT_CATEGORIES = Object.keys(PROJECT_CATEGORY_COUNTS);
const revision = content => crypto.createHash("sha256").update(content.replaceAll("\r\n", "\n")).digest("hex").slice(0, 12);
const appRevision = revision(app);
const styleRevision = revision(css);
const MEDIA_REVISION = "20260719-1";
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
assert(css.includes(".brand-family") && app.includes("function renderBrand"), "Only the Brooks surname uses the green accent");
assert(css.includes("--media-ratio: 4 / 3"), "All public image containers share one 4:3 ratio");
assert(css.includes("object-fit: contain"), "Public images remain fully visible without cropping");
assert(/\.gallery-image img\s*\{\s*object-fit:\s*cover;/.test(css), "Detail-study tiles fill their frames without side bands");
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
assert.throws(() => validateSite(withProject(0, { category: "homewares" })), /exactly 6/);
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

  const oldPumpRoute = await fetch(`${base}/work/gauge-electric-inflator`, { redirect: "manual" });
  assert.equal(oldPumpRoute.status, 301);
  assert.equal(oldPumpRoute.headers.get("location"), "/work/gauge-electric-pump");

  const site = await fetch(`${base}/api/site`).then(response => response.json());
  assert.equal(site.brand, "Jon Brooks");
  assert.equal(site.nav[0].href, "/work");
  assert.equal(site.workCta, "Get in contact");
  assert.match(site.workIntro, /furniture, homewares, lighting, and mobility/);
  assert.equal(site.projects[0].slug, "contour-lounge-chair");
  assert.equal(site.projects.length, 24);
  assert.deepEqual(Object.fromEntries(PROJECT_CATEGORIES.map(category => [category, site.projects.filter(project => project.category === category).length])), PROJECT_CATEGORY_COUNTS);
  assert.deepEqual(site.projects.filter(project => project.category === "mobility").map(project => project.slug), ["stride-fold-ebike", "aero-commuter-helmet", "latch-convertible-pannier", "gauge-electric-pump", "rove-carry-on", "link-folding-lock"]);
  for (const project of site.projects) {
    const hashes = [project.image, ...project.views.map(view => view.image)].map(image => crypto.createHash("sha256").update(fs.readFileSync(`public${image}`)).digest("hex"));
    assert.equal(new Set(hashes).size, 9, `${project.title} uses nine genuinely different images`);
  }
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
  assert(site.projects.every(project => project.views.filter(view => view.type === "insitu").every(view => /-(?:insitu-v(?:[1-5]|4-fixed)|in-use-v1|context-(?:wide|alt|active|use)-(?:vibrant-v1|photo-v[23456789]))\.webp$/.test(view.image))));
  assert(site.projects.filter(project => project.category !== "furniture").every(project => project.views.some(view => view.type === "insitu" && /-context-use-(?:vibrant-v1|photo-v[234567])\.webp$/.test(view.image))), "Every Homewares, Lighting, and Mobility project includes a use scene");
  assert(site.projects.filter(project => project.category === "lighting").every(project => project.cardImage.includes("-card-off-") && project.cardImage !== project.image), "Every lighting card has a separate switched-off render");
  assert(site.projects.every(project => project.views.slice(0, 4).every(view => view.type === "crop") && project.views.slice(4).every(view => view.type === "insitu")), "Every gallery keeps four studio studies followed by four context views");
  const photoProjects = site.projects.filter(project => ["pivot-writing-desk", "silo-food-waste-caddy", "beacon-portable-lantern", "stride-fold-ebike", "aero-commuter-helmet", "latch-convertible-pannier", "gauge-electric-pump", "rove-carry-on", "link-folding-lock"].includes(project.slug));
  assert(photoProjects.every(project => [project.image, project.cardImage, project.detailImage, ...project.views.map(view => view.image)].every(image => /-photo-v[23456789]\.webp$/.test(image))), "New and corrected projects use the realistic versioned photo media system");
  const aeroHelmet = site.projects.find(project => project.slug === "aero-commuter-helmet");
  assert([aeroHelmet.image, aeroHelmet.cardImage, aeroHelmet.detailImage, ...aeroHelmet.views.filter((_, index) => index !== 3).map(view => view.image)].every(image => image.endsWith("-photo-v6.webp")), "Aero helmet uses the varied wearable-indicator photo-v6 gallery");
  assert.match(aeroHelmet.notes.join(" "), /three-prong side-release buckle/i, "Aero helmet documents its matching chin clasp");
  assert.match(aeroHelmet.notes.join(" "), /paired amber turn indicators/i, "Aero helmet documents its rear indicators");
  assert.match(aeroHelmet.notes.join(" "), /synced wearable wrist indicators/i, "Aero helmet documents its wearable indicators");
  const pannier = site.projects.find(project => project.slug === "latch-convertible-pannier");
  assert.match(pannier.notes.join(" "), /weather flap.*two low-profile compression clasps/i, "Pannier documents its outward weather flap and paired clasps");
  assert.match(pannier.notes.join(" "), /two compact spring-loaded upper hooks/i, "Pannier documents two rack-rail hooks");
  assert.match(pannier.notes.join(" "), /lower anti-sway catch/i, "Pannier documents its lower rack-stay catch");
  assert([pannier.image, pannier.cardImage, pannier.detailImage, ...pannier.views.filter(view => !view.image.includes("detail-material")).map(view => view.image)].every(image => image.endsWith("-photo-v3.webp")), "Pannier uses the corrected flap-front and wheel-side mounting assets");
  const arcLock = site.projects.find(project => project.slug === "link-folding-lock");
  const arcLockCopy = `${arcLock.type} ${arcLock.summary} ${arcLock.notes.join(" ")} ${arcLock.views.map(view => view.label).join(" ")}`;
  const arcLockImages = [arcLock.image, ...arcLock.views.map(view => view.image)];
  assert.equal(arcLock.title, "Arc Double-Deadbolt U-Lock");
  assert.match(arcLock.type, /double-deadbolt U-lock/i, "Arc lock names its actual product architecture");
  assert.match(arcLock.notes.join(" "), /removable.*hardened-steel U-shackle/i, "Arc lock documents its removable shackle");
  assert.match(arcLock.notes.join(" "), /two recessed receivers.*two internal deadbolts/i, "Arc lock documents its two-sided locking mechanism");
  assert.match(arcLock.notes.join(" "), /key barrel.*right end-cap.*LED ring/i, "Arc lock places its illuminated key barrel in the end-cap");
  assert.match(arcLock.notes.join(" "), /frame mount.*transport/i, "Arc lock separates transport from security");
  assert.doesNotMatch(arcLockCopy, /hinge|captive shackle|folding link|steel chain|front-face key/i, "Arc lock rejects non-U-lock mechanisms and the wrong keyway position");
  assert.equal(arcLock.views.filter(view => view.type === "crop").length, 4);
  assert.equal(arcLock.views.filter(view => view.type === "insitu").length, 4);
  assert.equal(new Set(arcLockImages).size, 9, "Arc lock uses nine distinct portfolio images");
  assert(arcLockImages.every(image => /^\/assets\/mobility\/arc-u-lock-[a-z-]+-photo-v8\.webp$/.test(image)), "Arc lock uses the coherent photo-v8 media set");
  const pivotDesk = site.projects.find(project => project.slug === "pivot-writing-desk");
  const pivotDeskImages = [pivotDesk.image, ...pivotDesk.views.map(view => view.image)];
  assert.match(pivotDesk.materials, /dark walnut.*powder-coated aluminium.*wool felt.*stainless steel/i, "Pivot desk uses the approved material family");
  assert.match(pivotDesk.notes.join(" "), /charcoal.*service spine.*pivoting walnut privacy panel/i, "Pivot desk copy matches its visible construction");
  assert.equal(new Set(pivotDeskImages).size, 9, "Pivot desk uses nine distinct portfolio images");
  assert(pivotDeskImages.every(image => /^\/assets\/furniture\/pivot-writing-desk-[a-z-]+-photo-v3\.webp$/.test(image)), "Pivot desk uses the coherent photo-v3 media set");
  assert.equal(site.projects.find(project => project.slug === "gauge-electric-pump").title, "Gauge Electric Pump");
  assert.match(site.projects.find(project => project.slug === "gauge-electric-pump").summary, /LED built into the end of the nozzle/i);
  const electricPumpKerbsideView = site.projects.find(project => project.slug === "gauge-electric-pump").views.find(view => view.image.includes("context-alt"));
  assert.equal(electricPumpKerbsideView.label, "Human-operated kerbside inflation");
  assert(electricPumpKerbsideView.image.endsWith("context-alt-photo-v9.webp"), "Pump kerbside card uses a fresh URL after the mobile negative-cache race");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/mobility/gauge-electric-pump-context-alt-photo-v9.webp")).digest("hex"), "770674ee60f298a6b7ca7bdaf38de58af2ea495c572f2961e4307bcb6871ce8c", "Pump kerbside card preserves the approved human-operated nozzle light");
  assert.match(site.projects.find(project => project.slug === "latch-convertible-pannier").notes.join(" "), /two compact.*upper hooks.*lower anti-sway catch/i);
  assert.match(css, /\.work-category-tabs\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);[^}]*width:\s*100%;/s, "Four work categories span the full width equally");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/rail-task-light-angle-rear-vibrant-v1.webp")).digest("hex"), "d8d0a1cc9b40ff4b105567d5c8ad0ece8835ec7618dd0ea3cbb7f568f19d968c", "Vector folded view uses the approved fully connected render");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/halo-pendant-card-off-vibrant-v1.webp")).digest("hex"), "93659eb2b16d4e0d9aae054473cd9eec574c2c990625aa56afe59abc98cc9a52", "Aperture card uses the approved symmetric switched-off render");
  assert.equal(site.projects.find(project => project.slug === "plane-wall-light").title, "Rill Wall Light");
  assert.match(site.projects.find(project => project.slug === "plane-wall-light").summary, /rotating cylindrical.*redirects/i);
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/plane-wall-light-lead-vibrant-v1.webp")).digest("hex"), "6345f5b25de9d0d8855195d8fffa9070b9857c323e99fb9b6f343219829cb9a4", "Rill lead uses the approved rotating-cylinder assembly");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/plane-wall-light-angle-rear-vibrant-v1.webp")).digest("hex"), "66d3f6828ceb07f4ce67075dc31a06f1d710779d847ac4df60ea4b2df63ec245", "Rill rear view proves the shallow plate and compact pivots");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/plane-wall-light-card-off-vibrant-v1.webp")).digest("hex"), "bc3f0ea52e162b3358417fdb88d61bbed961de437adfbbabf71dad99b842db1a", "Rill card uses the matching switched-off assembly");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/plane-wall-light-context-use-vibrant-v1.webp")).digest("hex"), "856a1cb2a9539a5d9f9a2a4f92d464ed28f966292fe8194be5e6ae88d5cb0850", "Rill in-use view proves the cylinder adjustment");
  assert.match(site.projects.find(project => project.slug === "line-floor-lamp").summary, /weighted racetrack base.*tapered light blade/i);
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/line-floor-lamp-lead-vibrant-v1.webp")).digest("hex"), "9668d690be1c36c6668914992c9f2d425ac99a2f392ea7bad6c4d6f07fe21352", "Trace lead uses the approved full-scale floor-lamp assembly");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/line-floor-lamp-detail-material-vibrant-v1.webp")).digest("hex"), "c7e42d13dbb61927a0ac860ca3769a7984b73ff592d97d9718134aa5edeee394", "Trace detail proves the weighted base, dimmer, and cable exit");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/lighting/line-floor-lamp-card-off-vibrant-v1.webp")).digest("hex"), "1942cdad7440054202328acb12511835612a0e26bd6a4cbae2c65b64cdf8e8be", "Trace card uses the matching switched-off assembly");
  assert.deepEqual(
    ["wide", "alt", "active"].map(name => crypto.createHash("sha256").update(fs.readFileSync(`public/assets/lighting/line-floor-lamp-context-${name}-vibrant-v1.webp`)).digest("hex")),
    ["78507d6f638c67fc3ae8bfebffb019d292427b1318ed7e901e61302d0b0563b3", "43455f90018f8ec5898ff1d6ca44b04e92a90aabd02c09e97efb66835241ad29", "78f8f0f9abb104fff1471af171c323d32a73cd716d081d4cce8ef345e94a6a66"],
    "Trace uses three distinct, approved person-free interior scenes"
  );
  assert.match(site.projects.find(project => project.slug === "ratio-coffee-mill").materials, /stainless steel/i);
  assert.match(site.projects.find(project => project.slug === "axis-kettle").materials, /satin warm-ivory/i);
  assert(site.projects.find(project => project.slug === "axis-kettle").views.some(view => view.label === "Open lid and hinge mechanism"));
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/homewares/axis-kettle-detail-primary-vibrant-v1.webp")).digest("hex"), "712b65e4eb056882dd777534e0c0b82b790aa45a66c82b9ed6a579ac8a1b26b7", "Flux detail render proves the compact connected hinge, pivot, lid arm, and release");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/homewares/axis-kettle-context-active-vibrant-v1.webp")).digest("hex"), "b4a9a7157871838bb9180370da6af320c05bd505c7511a2a433d1546e88fba58", "Flux pouring render uses the approved connected kettle assembly");
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync("public/assets/homewares/axis-kettle-context-use-vibrant-v1.webp")).digest("hex"), "1aca9fa3eb447c1dfabaa93f89dc3e0deb9abb5092dc4badd20b5b76e1079587", "Flux filling render proves the lid hinge and release action");
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
  assert.equal(site.about.experience[1].role, "Graphic design");
  assert.match(site.about.experience[1].description, /catalogues/i);
  assert.equal(site.about.experience[2].role, "AI and image generation");
  assert.match(site.about.body, /strong hands-on experience with AI and image generation/i);
  assert.match(site.about.body, /self-taught in graphic design/i);
  assert.match(site.about.body, /catalogues, production artwork, and supporting marketing material/);
  assert(site.about.experience.some(item => item.period === "Personality" && item.role === "Curious and always learning"));
  assert.match(site.about.experience.find(item => item.period === "Personality").description, /learn, upskill, and improve/);
  assert.equal(site.contact.email, "jonbrooks35@gmail.com");
  assert.equal(site.contact.phone, "0412 218 673");
  assert(app.includes('"mailto:", "tel:"'), "Public links safely retain phone links");
  assert(work.includes('role="tablist"') && PROJECT_CATEGORIES.every(category => work.includes(`data-work-category="${category}"`)), "Work page exposes four accessible category tabs");
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
  const productHtml = await productPage.text();
  const silhouette = site.projects.find(project => project.slug === "silhouette-sofa");
  assert.match(productHtml, /product-page/);
  assert.match(productHtml, /<title>Silhouette Sofa \| Jon Brooks<\/title>/);
  assert(productHtml.includes(`content="${silhouette.summary}"`), "Product URL includes its project-specific description");

  const heroChairPage = await fetch(`${base}/work/contour-lounge-chair`);
  assert.equal(heroChairPage.status, 200);

  const cardPath = "public/assets/furniture/contour-lounge-chair-card-4x3.webp";
  const cardResponse = await fetch(`${base}/assets/furniture/contour-lounge-chair-card-4x3.webp?v=${MEDIA_REVISION}`);
  assert.equal(cardResponse.status, 200);
  assert.equal(
    crypto.createHash("sha256").update(Buffer.from(await cardResponse.arrayBuffer())).digest("hex"),
    crypto.createHash("sha256").update(fs.readFileSync(cardPath)).digest("hex"),
    "Static binary assets are served byte-for-byte without text decoding"
  );

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
