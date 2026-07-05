const payload = document.getElementById("payload");
const password = document.getElementById("password");
const status = document.getElementById("status");

async function load() {
  const response = await fetch("/api/site");
  payload.value = JSON.stringify(await response.json(), null, 2);
  status.value = "Loaded";
}

document.getElementById("reload").addEventListener("click", load);

document.getElementById("admin-form").addEventListener("submit", async event => {
  event.preventDefault();
  status.value = "Saving…";
  let body;
  try {
    body = JSON.parse(payload.value);
  } catch {
    status.value = "Invalid JSON";
    return;
  }

  const response = await fetch("/api/site", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-admin-password": password.value
    },
    body: JSON.stringify(body)
  });

  status.value = response.ok ? "Saved" : `Save failed: ${response.status}`;
});

load().catch(() => {
  status.value = "Could not load content";
});
