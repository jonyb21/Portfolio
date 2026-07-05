function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setHref(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.href = value;
}

function render(site) {
  site.contact.emailHref = `mailto:${site.contact.email}`;
  setText('[data-field="brand"]', site.brand);
  setText('[data-field="hero.title"]', site.hero.title);
  setText('[data-field="hero.body"]', site.hero.body);
  setText('[data-field="hero.cta"]', site.hero.cta);
  setText('[data-field="workTitle"]', site.workTitle);
  setText('[data-field="workCta"]', site.workCta);
  setText('[data-field="about.title"]', site.about.title);
  setText('[data-field="about.body"]', site.about.body);
  setText('[data-field="contact.title"]', site.contact.title);
  setText('[data-field="contact.body"]', site.contact.body);
  setText('[data-field="contact.email"]', site.contact.email);
  setHref('[data-field-href="hero.ctaHref"]', site.hero.ctaHref);
  setHref('[data-field-href="contact.emailHref"]', site.contact.emailHref);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  if (heroImage) heroImage.src = site.hero.image;

  const page = document.body.dataset.page;
  document.getElementById("nav").innerHTML = site.nav.map(item => {
    const active = item.href === `/${page}` ? ' class="is-active"' : "";
    return `<a${active} href="${item.href}">${item.label}</a>`;
  }).join("");

  const projects = document.getElementById("projects");
  if (projects) projects.innerHTML = site.projects.map(project => `
    <a class="project-card" href="${project.href || "#"}">
      <img src="${project.image}" alt="${project.title}">
      <span>${project.title}</span>
      <b aria-hidden="true">→</b>
    </a>
  `).join("");
}

fetch("/api/site")
  .then(response => response.json())
  .then(render)
  .catch(() => {
    document.body.classList.add("load-error");
  });
