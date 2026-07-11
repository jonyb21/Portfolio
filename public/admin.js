const loginPanel = document.getElementById("login-panel");
const editorPanel = document.getElementById("editor-panel");
const password = document.getElementById("password");
const loginStatus = document.getElementById("login-status");
const status = document.getElementById("status");
const form = document.getElementById("admin-form");
const projectsEditor = document.getElementById("projects-editor");
const experienceEditor = document.getElementById("experience-editor");
const navEditor = document.getElementById("nav-editor");
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const PROJECT_CATEGORIES = ["furniture", "homewares", "lighting"];

let site;

function field(name) {
  return form.elements[name];
}

function get(path) {
  return path.split(".").reduce((value, key) => value?.[key], site) || "";
}

function set(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((value, key) => value[key], site);
  target[last] = value;
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-project";
}

function toast(message, type = "success") {
  status.value = message;
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.setAttribute("role", type === "error" ? "alert" : "status");
  node.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  node.setAttribute("aria-atomic", "true");
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

async function load() {
  const response = await fetch("/api/site");
  site = await response.json();
  fillForm();
  status.value = "Loaded";
}

function fillForm() {
  [
    "brand",
    "hero.title",
    "hero.body",
    "hero.cta",
    "hero.ctaHref",
    "hero.image",
    "hero.detailImage",
    "workTitle",
    "workIntro",
    "workCta",
    "about.title",
    "about.body",
    "about.portrait",
    "about.experienceTitle",
    "about.experienceIntro",
    "contact.title",
    "contact.body",
    "contact.email",
    "contact.phone"
  ].forEach(name => {
    if (field(name)) field(name).value = get(name);
  });

  renderProjects();
  renderExperience();
  renderNav();
}

function viewRow(view, projectIndex, viewIndex) {
  const row = document.createElement("div");
  row.className = "view-row";
  row.dataset.view = viewIndex;
  row.innerHTML = `
    <img class="view-thumbnail" alt="" loading="lazy">
    <div class="view-fields">
      <label>Label <input data-project="${projectIndex}" data-view-key="label" required></label>
      <label>Image URL <input data-project="${projectIndex}" data-view-key="image" required></label>
      <label>Type
        <select data-project="${projectIndex}" data-view-key="type">
          <option value="crop">Crop</option>
          <option value="insitu">In situ</option>
        </select>
      </label>
    </div>
  `;
  row.querySelector('[data-view-key="label"]').value = view.label || "";
  row.querySelector('[data-view-key="image"]').value = view.image || "";
  row.querySelector('[data-view-key="type"]').value = view.type === "insitu" ? "insitu" : "crop";
  row.querySelector(".view-thumbnail").src = view.image || "";
  row.querySelector(".view-thumbnail").alt = view.label ? `${view.label} preview` : "Image study preview";
  return row;
}

function projectRow(project, index) {
  const row = document.createElement("details");
  row.className = "editor-card project-editor";
  row.dataset.projectEditor = index;
  row.open = index === 0;
  row.innerHTML = `
    <summary class="project-summary">
      <span class="disclosure" aria-hidden="true"></span>
      <span class="project-heading"><strong>Project ${index + 1}</strong><span data-project-summary-title></span></span>
    </summary>
    <div class="editor-card-body">
      <div class="card-title">
        <span>Project details</span>
      </div>
      <label>Title <input data-project="${index}" data-key="title" required></label>
      <label>Category
        <select data-project="${index}" data-key="category" required>
          ${PROJECT_CATEGORIES.map(category => `<option value="${category}">${category[0].toUpperCase()}${category.slice(1)}</option>`).join("")}
        </select>
      </label>
      <label>Slug <input data-project="${index}" data-key="slug" required></label>
      <label>Year <input data-project="${index}" data-key="year"></label>
      <label>Type <input data-project="${index}" data-key="type"></label>
      <label>Materials <input data-project="${index}" data-key="materials"></label>
      <label>Main WebP path <input data-project="${index}" data-key="image" placeholder="/assets/furniture/project-lead-4x3.webp" required></label>
      <label>Card WebP path <input data-project="${index}" data-key="cardImage" placeholder="/assets/furniture/project-card-4x3.webp"></label>
      <label>Detail WebP path <input data-project="${index}" data-key="detailImage" placeholder="/assets/furniture/project-detail.webp"></label>
      <label>Summary <textarea data-project="${index}" data-key="summary" rows="4"></textarea></label>
      <label>Notes <textarea data-project="${index}" data-key="notesText" rows="4" placeholder="One note per line"></textarea></label>
      <fieldset class="views-editor">
        <legend>Image studies</legend>
        <div data-views></div>
      </fieldset>
    </div>
  `;
  row.querySelector("[data-project-summary-title]").textContent = project.title || "Untitled project";
  row.querySelector('[data-key="title"]').value = project.title || "";
  row.querySelector('[data-key="category"]').value = PROJECT_CATEGORIES.includes(project.category) ? project.category : "furniture";
  row.querySelector('[data-key="slug"]').value = project.slug || "";
  row.querySelector('[data-key="year"]').value = project.year || "";
  row.querySelector('[data-key="type"]').value = project.type || "";
  row.querySelector('[data-key="materials"]').value = project.materials || "";
  row.querySelector('[data-key="image"]').value = project.image || "";
  row.querySelector('[data-key="cardImage"]').value = project.cardImage || "";
  row.querySelector('[data-key="detailImage"]').value = project.detailImage || "";
  row.querySelector('[data-key="summary"]').value = project.summary || "";
  row.querySelector('[data-key="notesText"]').value = (project.notes || []).join("\n");
  const views = Array.from({ length: 8 }, (_, viewIndex) => project.views?.[viewIndex] || {
    label: "",
    image: "",
    type: viewIndex < 4 ? "crop" : "insitu"
  });
  row.querySelector("[data-views]").replaceChildren(...views.map((view, viewIndex) => viewRow(view, index, viewIndex)));
  return row;
}

function renderProjects() {
  projectsEditor.replaceChildren(...site.projects.map(projectRow));
}

function experienceRow(item, index, count) {
  const row = document.createElement("article");
  row.className = "editor-card experience-row";
  row.dataset.experienceRow = index;
  row.innerHTML = `
    <div class="card-title">
      <strong>Experience ${index + 1}</strong>
      <button type="button" data-remove-experience="${index}" ${count === 1 ? "disabled" : ""}>Remove</button>
    </div>
    <div class="experience-fields">
      <label>Role <input data-experience-key="role" required></label>
      <label>Company <input data-experience-key="company" required></label>
      <label>Period/category <input data-experience-key="period" required></label>
      <label class="experience-description">Description <textarea data-experience-key="description" rows="4" required></textarea></label>
    </div>
  `;
  ["role", "company", "period", "description"].forEach(key => {
    row.querySelector(`[data-experience-key="${key}"]`).value = item[key] || "";
  });
  return row;
}

function renderExperience() {
  experienceEditor.replaceChildren(...site.about.experience.map((item, index, items) => experienceRow(item, index, items.length)));
}

function navRow(item, index) {
  const row = document.createElement("article");
  row.className = "editor-card";
  row.innerHTML = `
    <div class="card-title">
      <strong>Link ${index + 1}</strong>
      <button type="button" data-remove-nav="${index}">Remove</button>
    </div>
    <label>Label <input data-nav="${index}" data-key="label" required></label>
    <label>URL <input data-nav="${index}" data-key="href" required></label>
  `;
  row.querySelector('[data-key="label"]').value = item.label || "";
  row.querySelector('[data-key="href"]').value = item.href || "";
  return row;
}

function renderNav() {
  navEditor.replaceChildren(...site.nav.map(navRow));
}

function collect() {
  [
    "brand",
    "hero.title",
    "hero.body",
    "hero.cta",
    "hero.ctaHref",
    "hero.image",
    "hero.detailImage",
    "workTitle",
    "workIntro",
    "workCta",
    "about.title",
    "about.body",
    "about.portrait",
    "about.experienceTitle",
    "about.experienceIntro",
    "contact.title",
    "contact.body",
    "contact.email",
    "contact.phone"
  ].forEach(name => set(name, field(name).value.trim()));

  site.projects = Array.from(projectsEditor.querySelectorAll("[data-project-editor]")).map(row => {
    const title = row.querySelector('[data-key="title"]').value.trim();
    const slug = slugify(row.querySelector('[data-key="slug"]').value || title);
    return {
      title,
      slug,
      category: row.querySelector('[data-key="category"]').value,
      year: row.querySelector('[data-key="year"]').value.trim(),
      type: row.querySelector('[data-key="type"]').value.trim(),
      materials: row.querySelector('[data-key="materials"]').value.trim(),
      image: row.querySelector('[data-key="image"]').value.trim(),
      cardImage: row.querySelector('[data-key="cardImage"]').value.trim(),
      detailImage: row.querySelector('[data-key="detailImage"]').value.trim(),
      href: `/work/${slug}`,
      summary: row.querySelector('[data-key="summary"]').value.trim(),
      notes: row.querySelector('[data-key="notesText"]').value.split("\n").map(note => note.trim()).filter(Boolean),
      views: Array.from(row.querySelectorAll("[data-view]")).map(view => ({
        label: view.querySelector('[data-view-key="label"]').value.trim(),
        image: view.querySelector('[data-view-key="image"]').value.trim(),
        type: view.querySelector('[data-view-key="type"]').value
      }))
    };
  });

  site.nav = Array.from(navEditor.querySelectorAll(".editor-card")).map(row => ({
    label: row.querySelector('[data-key="label"]').value.trim(),
    href: row.querySelector('[data-key="href"]').value.trim()
  }));

  site.about.experience = Array.from(experienceEditor.querySelectorAll("[data-experience-row]")).map(row => ({
    role: row.querySelector('[data-experience-key="role"]').value.trim(),
    company: row.querySelector('[data-experience-key="company"]').value.trim(),
    period: row.querySelector('[data-experience-key="period"]').value.trim(),
    description: row.querySelector('[data-experience-key="description"]').value.trim()
  }));

  return site;
}

document.getElementById("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const response = await fetch("/api/auth/check", {
    method: "POST",
    headers: {
      "x-admin-password": password.value
    }
  });

  if (!response.ok) {
    loginStatus.value = "Wrong password";
    return;
  }

  loginPanel.hidden = true;
  editorPanel.hidden = false;
  toast("Editor unlocked");
});

function activateTab(tab, focus = false) {
  tabs.forEach(node => {
    const active = node === tab;
    node.classList.toggle("active", active);
    node.ariaSelected = String(active);
    node.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    const active = panel.id === tab.getAttribute("aria-controls");
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
  if (focus) tab.focus();
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", event => {
    const index = tabs.indexOf(tab);
    let next;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs.at(-1);
    if (!next) return;
    event.preventDefault();
    activateTab(next, true);
  });
});

projectsEditor.addEventListener("input", event => {
  const project = event.target.closest("[data-project-editor]");
  if (!project) return;
  if (event.target.matches('[data-key="title"]')) {
    project.querySelector("[data-project-summary-title]").textContent = event.target.value.trim() || "Untitled project";
  }
  if (event.target.matches('[data-view-key="label"]')) {
    const preview = event.target.closest("[data-view]").querySelector(".view-thumbnail");
    preview.alt = event.target.value.trim() ? `${event.target.value.trim()} preview` : "Image study preview";
  }
  if (event.target.matches('[data-view-key="image"]')) {
    event.target.closest("[data-view]").querySelector(".view-thumbnail").src = event.target.value.trim();
  }
});

document.getElementById("add-experience").addEventListener("click", () => {
  collect();
  site.about.experience.push({ role: "New role", company: "", period: "", description: "" });
  renderExperience();
});

experienceEditor.addEventListener("click", event => {
  const index = event.target.dataset.removeExperience;
  if (index === undefined || site.about.experience.length === 1) return;
  collect();
  site.about.experience.splice(Number(index), 1);
  renderExperience();
});

document.getElementById("add-nav").addEventListener("click", () => {
  collect();
  site.nav.push({ label: "New link", href: "/" });
  renderNav();
});

navEditor.addEventListener("click", event => {
  const index = event.target.dataset.removeNav;
  if (index === undefined) return;
  collect();
  site.nav.splice(Number(index), 1);
  renderNav();
});

document.getElementById("reload").addEventListener("click", () => {
  load().then(() => toast("Reloaded"));
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  status.value = "Saving...";
  const response = await fetch("/api/site", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-admin-password": password.value
    },
    body: JSON.stringify(collect())
  });

  if (!response.ok) {
    let message = `Save failed: ${response.status}`;
    try {
      message = (await response.json()).error || message;
    } catch {}
    toast(message, "error");
    return;
  }

  toast("Saved");
});

load().catch(() => {
  loginStatus.value = "Could not load content";
});
