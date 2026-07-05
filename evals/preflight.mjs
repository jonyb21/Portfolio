import assert from "node:assert/strict";
import fs from "node:fs";

const index = fs.readFileSync("public/index.html", "utf8");
const css = fs.readFileSync("public/styles.css", "utf8");
const admin = fs.readFileSync("public/admin.html", "utf8");
const site = JSON.parse(fs.readFileSync("data/site.json", "utf8"));

assert(!/[—–]/.test(index + css + admin), "No em dash or en dash in shipped UI");
assert(index.includes("min-h") === false, "Viewport height is owned by CSS");
assert(css.includes("min-height: 100dvh"), "Uses stable dynamic viewport height");
assert(css.includes("--accent: #c6d875"), "Olive accent matches the reference");
assert(css.includes("grid-template-columns: repeat(3"), "Selected work uses a three-card desktop grid");
assert(site.projects.length === 3, "Reference screen has three selected work cards");
assert(site.hero.image.startsWith("https://images.unsplash.com/"), "Hero uses a furniture-like placeholder image URL");
assert(site.projects.every(project => project.image.startsWith("https://images.unsplash.com/")), "Project images use furniture-like placeholder image URLs");
assert(admin.includes("textarea"), "Admin UI exposes editable backend content");
