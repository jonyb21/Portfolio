const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { webpDimensions } = require("./media-dimensions");

const root = __dirname;
const publicDir = path.join(root, "public");
const dataPath = process.env.PORTFOLIO_DATA_PATH || path.join(root, "data", "site.json");
const port = Number(process.env.PORT || 8788);
const adminPassword = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "admin");
const PROJECT_CATEGORIES = ["furniture", "homewares", "lighting"];
const MEDIA_REVISION = "20260718-1";

if (process.env.NODE_ENV === "production" && !adminPassword) {
  throw new Error("ADMIN_PASSWORD is required in production");
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "x-content-type-options": "nosniff",
    "cache-control": type.startsWith("text/html") || type.startsWith("application/json") ? "no-store" : "public, max-age=300"
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 250_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function loadSite() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveSite(site) {
  validateSite(site);
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, `${JSON.stringify(site, null, 2)}\n`);
}

function validateImage(value) {
  if (/^https?:\/\//.test(value)) {
    throw new Error("Remote images are not supported; use a local public WebP path");
  }
  if (!value.startsWith("/") || value.includes("..")) throw new Error("Image URLs must be public paths or http URLs");
  const filePath = path.join(publicDir, value);
  if (!fs.existsSync(filePath)) throw new Error(`Image path does not exist: ${value}`);
  if (path.extname(filePath).toLowerCase() !== ".webp") throw new Error("Local project images must be WebP files");
  const { width, height } = webpDimensions(filePath);
  if (width * 3 !== height * 4) throw new Error("Project images must use a native 4:3 ratio");
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function renderWorkFallback(html, site, requestedCategory) {
  const category = PROJECT_CATEGORIES.includes(requestedCategory) ? requestedCategory : PROJECT_CATEGORIES[0];
  const cards = site.projects.filter(project => project.category === category).map(project => {
    const switchesOn = project.category === "lighting" && project.cardImage && project.cardImage !== project.image;
    return `
          <a class="project-card${switchesOn ? " light-switch-card" : ""}" href="${escapeHtml(project.href)}">
            <span class="project-card-images" aria-hidden="true"><img${switchesOn ? ' class="light-state-off"' : ""} src="${escapeHtml(project.cardImage || project.image)}?v=${MEDIA_REVISION}" alt="" loading="eager" decoding="async">${switchesOn ? `<img class="light-state-on" src="${escapeHtml(project.image)}?v=${MEDIA_REVISION}" alt="" loading="eager" decoding="async">` : ""}</span>
            <span class="sr-only">${escapeHtml(project.title)}</span>
            <span class="project-title">${escapeHtml(project.title)}</span>
          </a>`;
  }).join("");
  let output = html.replace('<h2 class="sr-only" id="work-category-heading">Furniture</h2>', `<h2 class="sr-only" id="work-category-heading">${category[0].toUpperCase()}${category.slice(1)}</h2>`);
  output = output.replace('<div class="project-grid" id="projects" role="tabpanel" aria-labelledby="work-tab-furniture" aria-busy="true"></div>', `<div class="project-grid" id="projects" role="tabpanel" aria-labelledby="work-tab-${category}" aria-busy="false">${cards}\n        </div>`);
  for (const item of PROJECT_CATEGORIES) {
    const active = item === category;
    const tab = new RegExp(`(<a[^>]+data-work-category="${item}"[^>]*)(>)`);
    output = output.replace(tab, (_, attributes, end) => `${attributes.replace(/ aria-selected="[^"]*"/g, "").replace(/ tabindex="-1"/g, "")} aria-selected="${active}"${active ? "" : ' tabindex="-1"'}${end}`);
  }
  return output;
}

function renderProductMetadata(html, project) {
  return html
    .replace('content="Industrial design project by Jon Brooks."', `content="${escapeHtml(project.summary)}"`)
    .replace("<title>Project | Jon Brooks</title>", `<title>${escapeHtml(project.title)} | Jon Brooks</title>`);
}

function validatePagePath(value, slugs, label) {
  if (typeof value !== "string" || !value) throw new Error(`${label} is required`);
  if (!value.startsWith("/") || value.includes("#") || value.includes("..")) throw new Error(`${label} must use separate page paths`);
  if (value === "/" || fs.existsSync(path.join(publicDir, `${value.slice(1)}.html`))) return;
  const productMatch = value.match(/^\/work\/([^/]+)$/);
  if (productMatch && slugs.has(productMatch[1])) return;
  throw new Error(`${label} points to a missing page`);
}

function present(value) {
  return typeof value === "string" && value.trim();
}

function validateSite(site) {
  if (!site || typeof site !== "object") throw new Error("Site payload must be an object");
  if (!present(site.brand) || !present(site.hero?.title) || !present(site.hero?.image)) throw new Error("Brand, hero title, and hero image are required");
  if (!present(site.workTitle) || !present(site.workIntro)) throw new Error("Work title and intro are required");
  if (!present(site.about?.title) || !present(site.about?.experienceTitle) || !present(site.contact?.email) || !present(site.contact?.phone)) throw new Error("About title, experience title, contact email, and contact phone are required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contact.email)) throw new Error("Contact email must be a valid email address");
  if (site.contact.phone.replace(/\D/g, "").length < 8) throw new Error("Contact phone must be a valid phone number");
  if (!Array.isArray(site.about.experience) || site.about.experience.length < 1) throw new Error("At least one experience item is required");
  if (!Array.isArray(site.projects) || site.projects.length < 1) throw new Error("At least one project is required");
  if (!Array.isArray(site.nav) || site.nav.length < 1) throw new Error("At least one nav item is required");
  const slugs = new Set();
  const categoryCounts = Object.fromEntries(PROJECT_CATEGORIES.map(category => [category, 0]));
  validateImage(site.hero.image);
  if (site.hero.detailImage) validateImage(site.hero.detailImage);
  if (site.about.portrait) validateImage(site.about.portrait);
  for (const project of site.projects) {
    if (!present(project.category) || !PROJECT_CATEGORIES.includes(project.category)) {
      throw new Error(`Every project category must be one of: ${PROJECT_CATEGORIES.join(", ")}`);
    }
    categoryCounts[project.category] += 1;
    if (!present(project.title) || !present(project.image)) throw new Error("Every project needs a title and image");
    if (!present(project.slug) || !present(project.summary) || !present(project.detailImage)) throw new Error("Every project needs a slug, summary, and detail image");
    if (!present(project.materials) || !Array.isArray(project.notes) || project.notes.length < 3 || project.notes.some(note => !present(note))) throw new Error("Every project needs materials and at least three detail notes");
    if (!Array.isArray(project.views) || project.views.length !== 8) throw new Error("Every project page needs one main image, four cropped views, and four in situ views");
    validateImage(project.image);
    if (project.cardImage) validateImage(project.cardImage);
    validateImage(project.detailImage);
    for (const view of project.views) {
      if (!present(view.label) || !present(view.image)) throw new Error("Every project image study needs a label and image");
      if (!["crop", "insitu"].includes(view.type)) throw new Error("Project image studies must be crop or insitu");
      validateImage(view.image);
    }
    // The product page renders `image` as its lead view; cardImage only appears on Work.
    const renderedImages = [project.image, ...project.views.map(view => view.image)].filter(Boolean);
    if (new Set(renderedImages).size !== renderedImages.length) throw new Error("Project page image paths must be unique");
    if (project.views.filter(view => view.type === "crop").length !== 4 || project.views.filter(view => view.type === "insitu").length !== 4) {
      throw new Error("Every project page needs one main image, four cropped views, and four in situ views");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error("Project slugs must be lowercase words separated by hyphens");
    if (slugs.has(project.slug)) throw new Error("Project slugs must be unique");
    slugs.add(project.slug);
    if (project.href !== `/work/${project.slug}`) throw new Error("Project links must match their product page slug");
  }
  for (const category of PROJECT_CATEGORIES) {
    if (categoryCounts[category] !== 5) throw new Error(`Category ${category} must contain exactly five projects`);
  }
  validatePagePath(site.hero.ctaHref, slugs, "Hero CTA");
  for (const item of site.nav) {
    if (!present(item.label) || !present(item.href)) throw new Error("Every nav item needs a label and URL");
    validatePagePath(item.href, slugs, "Nav links");
  }
  for (const item of site.about.experience) {
    if (!present(item.role) || !present(item.company) || !present(item.period) || !present(item.description)) throw new Error("Every experience item needs role, company, period, and description");
  }
}

function authed(req) {
  const supplied = req.headers["x-admin-password"] || "";
  const a = Buffer.from(String(supplied));
  const b = Buffer.from(String(adminPassword));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function staticFile(urlPath, res, category) {
  let clean = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const productMatch = clean.match(/^\/work\/([^/]+)$/);
  let product;
  if (productMatch) {
    const site = loadSite();
    product = site.projects.find(project => project.slug === productMatch[1]);
    if (!product) {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
    clean = "/product.html";
  }
  if (!path.extname(clean)) clean += ".html";
  const filePath = path.normalize(path.join(publicDir, clean));
  if (!filePath.startsWith(publicDir)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(res, 404, "Not found", "text/plain; charset=utf-8");
  const isHtml = path.extname(filePath) === ".html";
  const template = fs.readFileSync(filePath, isHtml ? "utf8" : undefined);
  const body = clean === "/work.html"
    ? renderWorkFallback(template, loadSite(), category)
    : product ? renderProductMetadata(template, product) : template;
  send(res, 200, body, types[path.extname(filePath)] || "application/octet-stream");
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");

      if (req.method === "GET" && url.pathname === "/api/health") {
        return send(res, 200, JSON.stringify({ ok: true }));
      }

      if (req.method === "GET" && url.pathname === "/api/site") {
        return send(res, 200, JSON.stringify(loadSite()));
      }

      if (req.method === "POST" && url.pathname === "/api/auth/check") {
        return send(res, authed(req) ? 200 : 401, JSON.stringify({ ok: authed(req) }));
      }

      if (req.method === "PUT" && url.pathname === "/api/site") {
        if (!authed(req)) return send(res, 401, JSON.stringify({ error: "Unauthorized" }));
        const site = await readJson(req);
        saveSite(site);
        return send(res, 200, JSON.stringify({ ok: true }));
      }

      if (req.method === "GET" || req.method === "HEAD") return staticFile(url.pathname, res, url.searchParams.get("category"));
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
    } catch (error) {
      send(res, 400, JSON.stringify({ error: error.message }));
    }
  });
}

if (require.main === module) {
  createServer().listen(port, () => {
    console.log(`portfolio listening on http://127.0.0.1:${port}`);
  });
}

module.exports = { createServer, loadSite, saveSite, validateSite };
