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

function projectUrl(project) {
  return safeUrl(project.href || `/work/${project.slug}`);
}

function renderProjectViews(project) {
  const views = Array.isArray(project.views) ? project.views : [];
  if (!views.length) return "";
  return `
      <div class="project-gallery" aria-label="${escapeHtml(project.title)} image studies">
        ${views.map(view => {
          const type = view.type === "insitu" ? "insitu" : "crop";
          const fallback = type === "insitu" ? project.image : project.detailImage || project.image;
          return `
        <figure class="detail-image gallery-image ${type}">
          <img src="${escapeHtml(safeUrl(view.image, fallback))}" alt="${escapeHtml(view.alt || `${project.title} ${view.label || "view"}`)}">
          <figcaption>${escapeHtml(view.label || "Detail view")}</figcaption>
        </figure>`;
        }).join("")}
      </div>`;
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
  setText('[data-field="about.experienceTitle"]', site.about.experienceTitle);
  setText('[data-field="about.experienceIntro"]', site.about.experienceIntro);
  setText('[data-field="contact.title"]', site.contact.title);
  setText('[data-field="contact.body"]', site.contact.body);
  setText('[data-field="contact.email"]', site.contact.email);
  setHref('[data-field-href="hero.ctaHref"]', site.hero.ctaHref);
  setHref('[data-field-href="contact.emailHref"]', site.contact.emailHref);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  if (heroImage) heroImage.src = safeUrl(site.hero.image, "/assets/furniture/hero-lounge-chair.png");

  const page = document.body.dataset.page;
  const activePage = page === "product" ? "work" : page;
  document.getElementById("nav").innerHTML = site.nav.map(item => {
    const href = safeUrl(item.href, "/");
    const active = href === `/${activePage}` ? ' class="is-active"' : "";
    return `<a${active} href="${escapeHtml(href)}">${escapeHtml(item.label)}</a>`;
  }).join("");

  const projects = document.getElementById("projects");
  if (projects) projects.innerHTML = site.projects.map(project => `
    <a class="project-card" href="${escapeHtml(projectUrl(project))}">
      <img src="${escapeHtml(safeUrl(project.image, "/assets/furniture/hero-lounge-chair.png"))}" alt="${escapeHtml(project.title)}">
      <span>${escapeHtml(project.title)}</span>
      <b aria-hidden="true">&rarr;</b>
    </a>
  `).join("");

  const experience = document.getElementById("experience-list");
  if (experience) experience.innerHTML = (site.about.experience || []).map(item => `
    <article class="experience-item">
      <p>${escapeHtml(item.period)}</p>
      <h3>${escapeHtml(item.role)}</h3>
      <strong>${escapeHtml(item.company)}</strong>
      <span>${escapeHtml(item.description)}</span>
    </article>
  `).join("");

  const productPage = document.getElementById("product-page");
  if (productPage) {
    const slug = location.pathname.split("/").filter(Boolean).at(-1);
    const project = site.projects.find(item => item.slug === slug);
    if (!project) {
      productPage.innerHTML = '<p class="page-intro">Project not found.</p>';
      return;
    }
    document.title = `${project.title} | ${site.brand}`;
    productPage.innerHTML = `
      <a class="text-link back-link" href="/work"><span aria-hidden="true">&larr;</span><span>Back to work</span></a>
      <article class="project-detail single" id="${escapeHtml(project.slug)}">
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
      <figure class="detail-image wide">
        <img src="${escapeHtml(safeUrl(project.image, "/assets/furniture/hero-lounge-chair.png"))}" alt="${escapeHtml(project.title)} full view">
      </figure>
      ${renderProjectViews(project)}
    </article>`;
  }
}

fetch("/api/site")
  .then(response => response.json())
  .then(render)
  .catch(() => {
    document.body.classList.add("load-error");
  });
