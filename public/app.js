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

function imageUrl(value, fallback = "/assets/furniture/hero-lounge-chair.webp") {
  const url = safeUrl(value, fallback);
  if (!url.startsWith("/assets/") || url.includes("?")) return url;
  return `${url}?v=20260705-4`;
}

function shuffled(values) {
  const items = [...values];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

function startHeroSlideshow(images) {
  const slides = [...document.querySelectorAll(".hero-image img")];
  if (slides.length < 2) return;
  const indexes = images.map((_, index) => index);
  let recent = [];
  let active = shuffled(indexes)[0];
  slides[active].classList.add("is-active");
  setInterval(() => {
    const choices = indexes.filter(index => !recent.includes(index) && index !== active);
    const next = shuffled(choices.length ? choices : indexes.filter(index => index !== active))[0];
    slides[active].classList.remove("is-active");
    recent = [active, ...recent].slice(0, 2);
    active = next;
    slides[active].classList.add("is-active");
  }, 5000);
}

function projectUrl(project) {
  return safeUrl(project.href || `/work/${project.slug}`);
}

function phoneUrl(value) {
  const phone = String(value || "").replace(/\D/g, "");
  return phone ? `tel:${phone}` : "#";
}

function renderProjectViews(project) {
  const views = Array.isArray(project.views) ? project.views : [];
  if (!views.length) return "";
  return `
      <div class="project-gallery" aria-label="${escapeHtml(project.title)} image studies">
        ${views.map(view => {
          const type = view.type === "insitu" ? "insitu" : "crop";
          const fallback = type === "insitu" ? project.image : project.detailImage || project.image;
          const image = safeUrl(view.image, fallback);
          const alt = view.alt || `${project.title} ${view.label || "view"}`;
          return `
        <figure class="detail-image gallery-image ${type}">
          <button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(imageUrl(image))}" data-preview-alt="${escapeHtml(alt)}">
            <img src="${escapeHtml(imageUrl(image))}" alt="${escapeHtml(alt)}">
          </button>
        </figure>`;
        }).join("")}
      </div>`;
}

function openImagePreview(src, alt) {
  const lightbox = document.getElementById("image-preview");
  if (!lightbox) return;
  const image = lightbox.querySelector("img");
  image.src = src;
  image.alt = alt || "Project image preview";
  lightbox.hidden = false;
  document.body.classList.add("preview-open");
  lightbox.querySelector(".preview-close").focus();
}

function closeImagePreview() {
  const lightbox = document.getElementById("image-preview");
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lightbox.querySelector("img").removeAttribute("src");
  document.body.classList.remove("preview-open");
}

function ensureImagePreview() {
  if (document.getElementById("image-preview")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="image-preview" id="image-preview" hidden>
      <button class="preview-backdrop" type="button" aria-label="Close image preview"></button>
      <figure class="preview-frame">
        <button class="preview-close" type="button" aria-label="Close image preview">×</button>
        <img alt="">
      </figure>
    </div>
  `);
}

function render(site) {
  ensureImagePreview();
  site.contact.emailHref = `mailto:${site.contact.email}`;
  site.contact.phoneHref = phoneUrl(site.contact.phone);
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
  setHref('[data-field-href="contact.emailHref"]', site.contact.emailHref);
  setHref('[data-field-href="contact.phoneHref"]', site.contact.phoneHref);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  if (heroImage) {
    const images = Array.isArray(site.projects) ? site.projects.map(project => project.cardImage || project.image).filter(Boolean) : [site.hero.image];
    const uniqueImages = [...new Set(images)];
    heroImage.closest(".hero-image").innerHTML = uniqueImages.map((image, index) => `
      <img data-field="${index === 0 ? "hero.image" : ""}" src="${escapeHtml(imageUrl(image))}" alt="${index === 0 ? "Featured furniture piece" : ""}">
    `).join("");
    startHeroSlideshow(uniqueImages);
  }

  const portrait = document.querySelector('[data-field="about.portrait"]');
  if (portrait) {
    portrait.src = imageUrl(site.about.portrait, "/assets/portrait.webp");
    portrait.parentElement.classList.toggle("has-portrait", Boolean(site.about.portrait));
  }

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
      <span class="project-card-images" aria-hidden="true">
        <img src="${escapeHtml(imageUrl(project.cardImage || project.image))}" alt="">
      </span>
      <span class="sr-only">${escapeHtml(project.title)}</span>
      <span class="project-title">${escapeHtml(project.title)}</span>
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
      <a class="text-link back-link" href="/work"><span class="arrow-mark arrow-left" aria-hidden="true"></span><span>Back to work</span></a>
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
      <figure class="detail-image wide">
        <button class="image-preview-trigger" type="button" data-preview-src="${escapeHtml(imageUrl(project.cardImage || project.image))}" data-preview-alt="${escapeHtml(`${project.title} full view`)}">
          <img src="${escapeHtml(imageUrl(project.cardImage || project.image))}" alt="${escapeHtml(project.title)} full view">
        </button>
      </figure>
      ${renderProjectViews(project)}
    </article>`;
  }
}

document.addEventListener("click", event => {
  const trigger = event.target.closest(".image-preview-trigger");
  if (trigger) {
    openImagePreview(trigger.dataset.previewSrc, trigger.dataset.previewAlt);
    return;
  }
  if (event.target.closest(".preview-close") || event.target.closest(".preview-backdrop")) {
    closeImagePreview();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeImagePreview();
});

fetch("/api/site")
  .then(response => response.json())
  .then(render)
  .catch(() => {
    document.body.classList.add("load-error");
  });
