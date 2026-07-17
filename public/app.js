const MEDIA_REVISION = "20260718-1";

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
    if (["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol)) return url;
  } catch {
    return fallback;
  }
  return fallback;
}

function imageUrl(value, fallback = "/assets/furniture/contour-lounge-chair-lead-4x3.webp") {
  const url = safeUrl(value, fallback);
  if (!url.startsWith("/assets/") || url.includes("?")) return url;
  return `${url}?v=${MEDIA_REVISION}`;
}

function shuffled(values) {
  const items = [...values];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function startHeroSlideshow(projects) {
  const frame = document.querySelector(".hero-image");
  const slides = [...document.querySelectorAll(".hero-slide")];
  if (!frame || !slides.length) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const indexes = projects.map((_, index) => index);
  let recent = [];
  let active = 0;
  let timer;
  let transitionTimer;
  const fadeDuration = 900;

  function show(index) {
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });
  }

  function pause() {
    clearTimeout(timer);
  }

  function schedule() {
    pause();
    if (document.hidden || reducedMotion.matches || slides.length < 2 || frame.matches(":hover") || frame.contains(document.activeElement)) return;
    timer = setTimeout(advance, 5000);
  }

  function advance() {
    if (transitionTimer) return;
    const choices = indexes.filter(index => !recent.includes(index) && index !== active);
    const next = shuffled(choices.length ? choices : indexes.filter(index => index !== active))[0];
    recent = [active, ...recent].slice(0, 2);
    show(-1);
    transitionTimer = setTimeout(() => {
      active = next;
      show(active);
      transitionTimer = undefined;
      schedule();
    }, fadeDuration);
  }

  show(active);
  frame.addEventListener("mouseenter", pause);
  frame.addEventListener("mouseleave", schedule);
  frame.addEventListener("focusin", pause);
  frame.addEventListener("focusout", schedule);
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", schedule);
  schedule();
}

function projectUrl(project) {
  return safeUrl(project.href || `/work/${project.slug}`);
}

const WORK_CATEGORIES = ["furniture", "homewares", "lighting"];

function workCategory() {
  const category = new URLSearchParams(location.search).get("category");
  return WORK_CATEGORIES.includes(category) ? category : WORK_CATEGORIES[0];
}

function projectCard(project) {
  const switchesOn = project.category === "lighting" && project.cardImage && project.cardImage !== project.image;
  return `
    <a class="project-card${switchesOn ? " light-switch-card" : ""}" href="${escapeHtml(projectUrl(project))}">
      <span class="project-card-images" aria-hidden="true">
        <img${switchesOn ? ' class="light-state-off"' : ""} src="${escapeHtml(imageUrl(project.cardImage || project.image))}" alt="" loading="eager" decoding="async">
        ${switchesOn ? `<img class="light-state-on" src="${escapeHtml(imageUrl(project.image))}" alt="" loading="eager" decoding="async">` : ""}
      </span>
      <span class="sr-only">${escapeHtml(project.title)}</span>
      <span class="project-title">${escapeHtml(project.title)}</span>
    </a>`;
}

function renderWorkProjects(projects, category) {
  const grid = document.getElementById("projects");
  if (!grid) return;
  grid.setAttribute("aria-busy", "true");
  grid.innerHTML = projects.filter(project => project.category === category).map(projectCard).join("");
  setText("#work-category-heading", `${category[0].toUpperCase()}${category.slice(1)}`);
  grid.setAttribute("aria-busy", "false");
}

function selectWorkCategory(category, projects, { focus = false, historyMode = "push" } = {}) {
  const selected = WORK_CATEGORIES.includes(category) ? category : WORK_CATEGORIES[0];
  const tabs = [...document.querySelectorAll("[data-work-category]")];
  const activeTab = tabs.find(tab => tab.dataset.workCategory === selected);
  tabs.forEach(tab => {
    const active = tab === activeTab;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.getElementById("projects")?.setAttribute("aria-labelledby", activeTab?.id || "work-tab-furniture");
  renderWorkProjects(projects, selected);
  const url = new URL(location.href);
  url.searchParams.set("category", selected);
  history[`${historyMode}State`](null, "", url);
  if (focus) activeTab?.focus();
}

function bindWorkCategories(projects) {
  const tabs = [...document.querySelectorAll("[data-work-category]")];
  if (!tabs.length) return;
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", event => {
      event.preventDefault();
      selectWorkCategory(tab.dataset.workCategory, projects);
    });
    tab.addEventListener("keydown", event => {
      let targetIndex;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = tabs.length - 1;
      if (targetIndex === undefined) return;
      event.preventDefault();
      selectWorkCategory(tabs[targetIndex].dataset.workCategory, projects, { focus: true });
    });
  });
  addEventListener("popstate", () => selectWorkCategory(workCategory(), projects, { historyMode: "replace" }));
  selectWorkCategory(workCategory(), projects, { historyMode: "replace" });
}

function phoneUrl(value) {
  const phone = String(value || "").replace(/\D/g, "");
  return phone ? `tel:${phone}` : "#";
}

function renderProjectViews(project) {
  const views = Array.isArray(project.views) ? project.views : [];
  if (!views.length) return "";

  return [
    { type: "crop", title: "Design details" },
    { type: "insitu", title: "In context" }
  ].map(group => {
    const groupViews = views.filter(view => view.type === group.type);
    if (!groupViews.length) return "";
    const headingId = `${project.slug}-${group.type}`;
    return `
      <section class="project-media-group ${group.type}" aria-labelledby="${escapeHtml(headingId)}">
        <h2 id="${escapeHtml(headingId)}">${group.title}</h2>
        <div class="project-gallery">
          ${groupViews.map(view => {
            const type = view.type === "insitu" ? "insitu" : "crop";
            const fallback = type === "insitu" ? project.image : project.detailImage || project.image;
            const image = safeUrl(view.image, fallback);
            const alt = view.alt || `${project.title} ${view.label || "view"}`;
            return `
            <figure class="detail-image gallery-image ${type}">
              <button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(imageUrl(image))}" data-preview-alt="${escapeHtml(alt)}">
                <img src="${escapeHtml(imageUrl(image))}" alt="${escapeHtml(alt)}" loading="eager" decoding="async">
              </button>
            </figure>`;
          }).join("")}
        </div>
      </section>`;
  }).join("");
}

let previewTrigger;

function openImagePreview(src, alt) {
  const lightbox = document.getElementById("image-preview");
  if (!lightbox) return;
  const image = lightbox.querySelector("img");
  image.src = src;
  image.alt = alt || "Project image preview";
  document.body.classList.add("preview-open");
  lightbox.showModal();
  lightbox.querySelector(".preview-close").focus();
}

function closeImagePreview() {
  const lightbox = document.getElementById("image-preview");
  if (lightbox?.open) lightbox.close();
}

function ensureImagePreview() {
  if (document.getElementById("image-preview")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="image-preview" id="image-preview" aria-label="Project image preview">
      <figure class="preview-frame">
        <button class="preview-close" type="button" aria-label="Close image preview">&#215;</button>
        <img alt="">
      </figure>
    </dialog>
  `);
  document.getElementById("image-preview").addEventListener("close", event => {
    event.currentTarget.querySelector("img").removeAttribute("src");
    document.body.classList.remove("preview-open");
    previewTrigger?.focus();
    previewTrigger = null;
  });
}

function render(site) {
  ensureImagePreview();
  const emailHref = `mailto:${site.contact.email}`;
  const contactPhoneHref = phoneUrl(site.contact.phone);

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
  setText('[data-field="contact.phone"]', site.contact.phone);
  setHref('[data-field-href="hero.ctaHref"]', site.hero.ctaHref);
  setHref('[data-field-href="contact.emailHref"]', emailHref);
  setHref('[data-field-href="contact.phoneHref"]', contactPhoneHref);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  if (heroImage) {
    const seenImages = new Set();
    const heroProjects = shuffled((Array.isArray(site.projects) ? site.projects : []).filter(project => {
      const image = project.image || project.cardImage;
      if (!image || seenImages.has(image)) return false;
      seenImages.add(image);
      return true;
    }));
    heroImage.closest(".hero-image").innerHTML = heroProjects.map((project, index) => `
      <a class="hero-slide${index === 0 ? " is-active" : ""}" href="${escapeHtml(projectUrl(project))}" aria-label="View ${escapeHtml(project.title)}" aria-hidden="${index !== 0}" tabindex="${index === 0 ? "0" : "-1"}">
        <img data-field="${index === 0 ? "hero.image" : ""}" src="${escapeHtml(imageUrl(project.image || project.cardImage))}" alt="" ${index === 0 ? 'fetchpriority="high"' : 'fetchpriority="low"'} decoding="async">
      </a>
    `).join("");
    startHeroSlideshow(heroProjects);
  }

  const portrait = document.querySelector('[data-field="about.portrait"]');
  if (portrait) {
    portrait.src = imageUrl(site.about.portrait, "/assets/portrait-sharp-4x3.webp");
    portrait.parentElement.classList.toggle("has-portrait", Boolean(site.about.portrait));
  }

  const page = document.body.dataset.page;
  const activePage = page === "product" ? "work" : page;
  document.getElementById("nav").innerHTML = site.nav.map(item => {
    const href = safeUrl(item.href, "/");
    const isActive = href === `/${activePage}`;
    return `<a${isActive ? ' class="is-active" aria-current="page"' : ""} href="${escapeHtml(href)}">${escapeHtml(item.label)}</a>`;
  }).join("");

  const projects = document.getElementById("projects");
  if (projects) {
    bindWorkCategories(site.projects);
  }

  const experience = document.getElementById("experience-list");
  if (experience) {
    experience.innerHTML = (site.about.experience || []).map(item => `
      <article class="experience-item">
        <p>${escapeHtml(item.period)}</p>
        <h3>${escapeHtml(item.role)}</h3>
        <strong>${escapeHtml(item.company)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </article>
    `).join("");
    experience.setAttribute("aria-busy", "false");
  }

  const productPage = document.getElementById("product-page");
  if (productPage) {
    const slug = location.pathname.split("/").filter(Boolean).at(-1);
    const project = site.projects.find(item => item.slug === slug);
    if (!project) {
      productPage.innerHTML = '<p class="page-intro">Project not found.</p>';
      return;
    }
    const categoryProjects = site.projects.filter(item => item.category === project.category);
    const projectIndex = categoryProjects.indexOf(project);
    const previousProject = categoryProjects[(projectIndex - 1 + categoryProjects.length) % categoryProjects.length];
    const nextProject = categoryProjects[(projectIndex + 1) % categoryProjects.length];
    document.title = `${project.title} | ${site.brand}`;
    productPage.innerHTML = `
      <a class="text-link back-link" href="/work?category=${escapeHtml(project.category)}"><span>Back to work</span></a>
      <article class="project-detail single" id="${escapeHtml(project.slug)}">
        <header class="detail-copy">
          <p class="project-meta">${escapeHtml(project.type || "Furniture")} / ${escapeHtml(project.year || "")}</p>
          <h1>${escapeHtml(project.title)}</h1>
          <p>${escapeHtml(project.summary || "")}</p>
        </header>
        <figure class="detail-image wide lead-image">
          <button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(imageUrl(project.image || project.cardImage))}" data-preview-alt="${escapeHtml(`${project.title} full view`)}">
            <img src="${escapeHtml(imageUrl(project.image || project.cardImage))}" alt="${escapeHtml(project.title)} full view" fetchpriority="high" decoding="async">
          </button>
        </figure>
        <div class="detail-facts">
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
        ${renderProjectViews(project)}
        <nav class="project-end-nav" aria-label="Project navigation">
          <a class="project-nav-link previous" href="${escapeHtml(projectUrl(previousProject))}">
            <span>Previous project</span>
            <strong>${escapeHtml(previousProject.title)}</strong>
          </a>
          <a class="project-nav-link next" href="${escapeHtml(projectUrl(nextProject))}">
            <span>Next project</span>
            <strong>${escapeHtml(nextProject.title)}</strong>
          </a>
          <a class="text-link project-contact" href="/contact"><span>Get in contact</span></a>
        </nav>
      </article>`;
    productPage.setAttribute("aria-busy", "false");
  }
}

document.addEventListener("click", event => {
  const trigger = event.target.closest(".image-preview-trigger");
  if (trigger) {
    previewTrigger = trigger;
    openImagePreview(trigger.dataset.previewSrc, trigger.dataset.previewAlt);
    return;
  }
  const lightbox = document.getElementById("image-preview");
  if (event.target.closest(".preview-close") || event.target === lightbox) closeImagePreview();
});

fetch("/api/site")
  .then(response => {
    if (!response.ok) throw new Error(`Site content failed: ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch(() => {
    document.body.classList.add("load-error");
    const projects = document.getElementById("projects");
    const product = document.getElementById("product-page");
    if (projects) projects.innerHTML = '<p class="inline-error">Projects could not load. Please refresh the page.</p>';
    if (product) product.innerHTML = '<p class="inline-error">This project could not load. Please return to Work and try again.</p>';
  });
