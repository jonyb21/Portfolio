function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setHref(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.href = safeUrl(value, "#");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value, fallback = "#") {
  const url = String(value || "").trim();
  if (!url) return fallback;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  try {
    const parsed = new URL(url);
    if (["https:", "http:", "mailto:"].includes(parsed.protocol)) return url;
  } catch {
    return fallback;
  }
  return fallback;
}

function render(site) {
  site.contact.emailHref = `mailto:${site.contact.email}`;
  setText('[data-field="brand"]', site.brand);
  setText('[data-field="hero.title"]', site.hero.title);
  setText('[data-field="hero.body"]', site.hero.body);
  setText('[data-field="hero.cta"]', site.hero.cta);
  setText('[data-field="workTitle"]', site.workTitle);
  setText('[data-field="workIntro"]', site.workIntro);
  setText('[data-field="workCta"]', site.workCta);
  setText('[data-field="about.title"]', site.about.title);
  setText('[data-field="about.body"]', site.about.body);
  setText('[data-field="contact.title"]', site.contact.title);
  setText('[data-field="contact.body"]', site.contact.body);
  setText('[data-field="contact.email"]', site.contact.email);
  setHref('[data-field-href="hero.ctaHref"]', site.hero.ctaHref);
  setHref('[data-field-href="contact.emailHref"]', site.contact.emailHref);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  if (heroImage) heroImage.src = safeUrl(site.hero.image, "/assets/furniture/hero-lounge-chair.png");

  const page = document.body.dataset.page;
  document.getElementById("nav").innerHTML = site.nav.map(item => {
    const active = item.href === `/${page}` ? ' class="is-active"' : "";
    return `<a${active} href="${item.href}">${item.label}</a>`;
  }).join("");

  const projects = document.getElementById("projects");
  if (projects) projects.innerHTML = site.projects.map(project => `
    <a class="project-card" href="${escapeHtml(safeUrl(project.href || `#${project.slug}`))}">
      <img src="${escapeHtml(safeUrl(project.image, "/assets/furniture/hero-lounge-chair.png"))}" alt="${escapeHtml(project.title)}">
      <span>${escapeHtml(project.title)}</span>
      <b aria-hidden="true">→</b>
    </a>
  `).join("");

  const details = document.getElementById("project-details");
  if (details) details.innerHTML = site.projects.map(project => `
    <article class="project-detail" id="${escapeHtml(project.slug)}">
      <div class="detail-copy">
        <p class="project-meta">${escapeHtml(project.type || "Furniture")} / ${escapeHtml(project.year || "")}</p>
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.summary || "")}</p>
        <dl>
          <div>
            <dt>Materials</dt>
            <dd>${escapeHtml(project.materials || "")}</dd>
          </div>
        </dl>
        <ul>
          ${(project.notes || []).map(note => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
      <figure class="detail-image">
        <img src="${escapeHtml(safeUrl(project.detailImage || project.image, "/assets/furniture/hero-lounge-chair-detail.png"))}" alt="${escapeHtml(project.title)} detail view">
      </figure>
    </article>
  `).join("");
}

fetch("/api/site")
  .then(response => response.json())
  .then(render)
  .catch(() => {
    document.body.classList.add("load-error");
  });
