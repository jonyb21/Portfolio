function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function render(site) {
  setText('[data-field="brand"]', site.brand);
  setText('[data-field="hero.title"]', site.hero.title);
  setText('[data-field="hero.body"]', site.hero.body);
  setText('[data-field="hero.cta"]', site.hero.cta);
  setText('[data-field="workTitle"]', site.workTitle);
  setText('[data-field="workCta"]', site.workCta);
  setText('[data-field="about.title"]', site.about.title);
  setText('[data-field="about.body"]', site.about.body);

  const heroImage = document.querySelector('[data-field="hero.image"]');
  heroImage.src = site.hero.image;

  document.getElementById("nav").innerHTML = site.nav.map(item =>
    `<a href="${item.href}">${item.label}</a>`
  ).join("");

  document.getElementById("projects").innerHTML = site.projects.map(project => `
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
