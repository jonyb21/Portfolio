const loginPanel = document.getElementById("login-panel");
const editorPanel = document.getElementById("editor-panel");
const password = document.getElementById("password");
const loginStatus = document.getElementById("login-status");
const status = document.getElementById("status");
const form = document.getElementById("admin-form");
const projectsEditor = document.getElementById("projects-editor");
const navEditor = document.getElementById("nav-editor");

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

function toast(message, type = "success") {
  status.value = message;
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = `toast ${type}`;
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
    "workTitle",
    "workCta",
    "about.title",
    "about.body",
    "contact.title",
    "contact.body",
    "contact.email"
  ].forEach(name => {
    if (field(name)) field(name).value = get(name);
  });

  renderProjects();
  renderNav();
}

function projectRow(project, index) {
  const row = document.createElement("article");
  row.className = "editor-card";
  row.innerHTML = `
    <div class="card-title">
      <strong>Project ${index + 1}</strong>
      <button type="button" data-remove-project="${index}">Remove</button>
    </div>
    <label>Title <input data-project="${index}" data-key="title" required></label>
    <label>Image URL <input data-project="${index}" data-key="image" required></label>
    <label>Link <input data-project="${index}" data-key="href"></label>
  `;
  row.querySelector('[data-key="title"]').value = project.title || "";
  row.querySelector('[data-key="image"]').value = project.image || "";
  row.querySelector('[data-key="href"]').value = project.href || "#";
  return row;
}

function renderProjects() {
  projectsEditor.replaceChildren(...site.projects.map(projectRow));
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
    "workTitle",
    "workCta",
    "about.title",
    "about.body",
    "contact.title",
    "contact.body",
    "contact.email"
  ].forEach(name => set(name, field(name).value.trim()));

  site.projects = Array.from(projectsEditor.querySelectorAll(".editor-card")).map(row => ({
    title: row.querySelector('[data-key="title"]').value.trim(),
    image: row.querySelector('[data-key="image"]').value.trim(),
    href: row.querySelector('[data-key="href"]').value.trim() || "#"
  }));

  site.nav = Array.from(navEditor.querySelectorAll(".editor-card")).map(row => ({
    label: row.querySelector('[data-key="label"]').value.trim(),
    href: row.querySelector('[data-key="href"]').value.trim()
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

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(node => node.classList.toggle("active", node === tab));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab.dataset.tab));
  });
});

document.getElementById("add-project").addEventListener("click", () => {
  collect();
  site.projects.push({ title: "New Project", image: "/assets/sofa.svg", href: "#" });
  renderProjects();
});

projectsEditor.addEventListener("click", event => {
  const index = event.target.dataset.removeProject;
  if (index === undefined) return;
  collect();
  site.projects.splice(Number(index), 1);
  renderProjects();
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
    toast(`Save failed: ${response.status}`, "error");
    return;
  }

  toast("Saved");
});

load().catch(() => {
  loginStatus.value = "Could not load content";
});
