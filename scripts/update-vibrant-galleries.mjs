import fs from "node:fs";

const sitePath = new URL("../data/site.json", import.meta.url);
const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));

const labelsBySlug = {
  "axis-kettle": [
    "Front three-quarter", "Rear handle profile", "Lid and pour control", "Enamel and base seam",
    "Kitchen worktop", "Tea preparation overhead", "Pouring profile", "Filling in use",
  ],
  "tempo-clock": [
    "Front three-quarter", "Rear control profile", "Dial and hand stack", "Translucent shell edge",
    "Bedside setting", "Desk placement", "Morning light", "Setting the alarm",
  ],
  "grid-tray-system": [
    "Stacked front view", "Exploded rear profile", "Rail and tray junction", "Removable insert detail",
    "Home office desk", "Entry console", "Creative workspace", "Sorting documents",
  ],
  "signal-radio": [
    "Front three-quarter", "Rear antenna profile", "Tuning controls", "Perforated grille detail",
    "Living room shelf", "Kitchen listening", "Bedside radio", "Tuning in use",
  ],
  "ratio-coffee-mill": [
    "Front three-quarter", "Rear crank profile", "Crank pivot", "Adjustment collar",
    "Kitchen counter", "Brewing overhead", "Fresh grounds", "Grinding in use",
  ],
  "column-table-lamp": [
    "Front three-quarter", "Rear glass profile", "Light source and dimmer", "Stacked glass junction",
    "Living room side table", "Bedside overhead", "Dusk shelf", "Dimming in use",
  ],
  "rail-task-light": [
    "Extended profile", "Folded working position", "Laminated pivot", "Head and base controls",
    "Design studio desk", "Drawing overhead", "Model-making task", "Adjusting in use",
  ],
  "halo-pendant": [
    "Front suspension view", "Underside profile", "Acrylic and diffuser", "Cord and canopy junction",
    "Dining room", "Upward suspension view", "Kitchen island", "Dinner in use",
  ],
  "plane-wall-light": [
    "Front three-quarter", "Opposite side profile", "Ceramic light channel", "Glaze and wall spacing",
    "Hallway wall", "Tiled entry", "Paired installation", "Corridor in use",
  ],
  "line-floor-lamp": [
    "Front arc profile", "Rear arc profile", "Perforated hood", "Terrazzo base control",
    "Reading corner", "Sofa side profile", "Light pool overhead", "Reading in use",
  ],
};

for (const project of site.projects) {
  const labels = labelsBySlug[project.slug];
  if (!labels) continue;

  const prefix = `/assets/${project.category}/${project.slug}`;
  const names = [
    "angle-front", "angle-rear", "detail-primary", "detail-material",
    "context-wide", "context-alt", "context-active", "context-use",
  ];

  project.detailImage = `${prefix}-detail-primary-vibrant-v1.webp`;
  project.views = names.map((name, index) => ({
    label: labels[index],
    image: `${prefix}-${name}-vibrant-v1.webp`,
    type: index < 4 ? "crop" : "insitu",
  }));
}

fs.writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
