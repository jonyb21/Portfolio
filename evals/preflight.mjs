import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync("public/index.html", "utf8");
const work = fs.readFileSync("public/work.html", "utf8");
const about = fs.readFileSync("public/about.html", "utf8");
const contact = fs.readFileSync("public/contact.html", "utf8");
const css = fs.readFileSync("public/styles.css", "utf8");
const admin = fs.readFileSync("public/admin.html", "utf8");
const site = JSON.parse(fs.readFileSync("data/site.json", "utf8"));

assert(!/[—–]/.test(index + work + about + contact + css + admin), "No em dash or en dash in shipped UI");
assert(!index.includes('id="work"'), "Home page is landing hero only");
assert(work.includes('body data-page="work"'), "Work tab is a separate page");
assert(about.includes('body data-page="about"'), "About tab is a separate page");
assert(contact.includes('body data-page="contact"'), "Contact tab is a separate page");
assert(index.includes("min-h") === false, "Viewport height is owned by CSS");
assert(css.includes("min-height: 100dvh"), "Uses stable dynamic viewport height");
assert(css.includes("--accent: #c6d875"), "Olive accent matches the reference");
assert(css.includes("grid-template-columns: repeat(3"), "Selected work uses a three-card desktop grid");
assert(site.projects.length === 3, "Reference screen has three selected work cards");
assert(site.nav.every(item => item.href.startsWith("/")), "Top nav uses page URLs, not anchors");
assert(site.hero.image === "/assets/furniture/hero-lounge-chair.png", "Hero uses generated furniture image");
assert(site.projects.every(project => project.image.startsWith("/assets/furniture/")), "Project images use generated furniture assets");
assert(!admin.includes("Site JSON"), "Admin UI does not expose raw JSON editing");
assert(admin.includes('data-tab="home"'), "Admin UI has interactive section tabs");
assert(admin.includes('id="projects-editor"'), "Admin UI has project form editing");
