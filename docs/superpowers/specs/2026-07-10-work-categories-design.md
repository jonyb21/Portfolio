# Work Categories Design

## Outcome

Expand the portfolio from five Furniture projects to fifteen projects across three equal categories: Furniture, Homewares, and Lighting. Each category contains five projects and uses the existing project-card grid, product-detail page, image study, admin editor, and validation rules.

## Design Direction

Reading this as a product designer portfolio for hiring managers, collaborators, and clients, with a restrained Dieter Rams-inspired industrial design language. The implementation remains original and borrows principles rather than copying named products.

- Design variance: 4. Rational alignment and repeated product geometry.
- Motion intensity: 3. Short state transitions only.
- Visual density: 4. Five scannable projects per category.
- Foundation: existing vanilla HTML, CSS, JavaScript, and JSON data model.
- Theme: existing dark editorial theme with olive reserved for active and focus states.

## Information Architecture

The existing `/work` route remains the single work index. A text-only tab row appears between the introduction and project grid:

1. Furniture
2. Homewares
3. Lighting

The active category is represented by `?category=furniture`, `?category=homewares`, or `?category=lighting`. Missing or invalid values fall back to Furniture. Selecting a tab updates the query string without a full reload, filters the existing project grid, preserves browser history, and moves keyboard focus predictably.

Each project keeps its existing `/work/<slug>` detail route. Project-page previous and next navigation stays within the selected project's category.

## Visual Treatment

Tabs are plain text controls on one line at desktop and horizontally scrollable on narrow screens. They use the existing type family, square-ended underline, natural letter spacing, and olive active state. No pills, icons, decorative counters, or large category banners.

All cards and project media retain the shared 4:3 framing, border system, restrained hover lift, and full-image presentation. Product imagery uses neutral backgrounds, soft directional light, honest material rendering, minimal props, and functional forms.

## Project Catalogue

### Furniture

Keep the existing five projects and tag each with `category: "furniture"`.

### Homewares

1. **Axis Kettle**: brushed aluminium electric kettle with a black handle and visible water gauge.
2. **Tempo Clock**: compact tabletop clock with a clear circular dial and one physical alarm control.
3. **Grid Tray System**: stackable serving and organisation trays in anodised aluminium and dark polymer.
4. **Signal Radio**: compact domestic radio with a perforated speaker face and two direct controls.
5. **Ratio Coffee Mill**: cylindrical burr grinder with a stepped adjustment collar and removable grounds cup.

### Lighting

1. **Column Table Lamp**: compact cylindrical lamp with an opal diffuser and weighted aluminium base.
2. **Rail Task Light**: articulated desk light with a slim linear head and exposed pivot logic.
3. **Halo Pendant**: shallow circular pendant with diffuse downward light and a thin suspension cable.
4. **Plane Wall Light**: folded metal wall light that produces reflected ambient light without visible glare.
5. **Line Floor Lamp**: slender floor lamp with a stable disc base, vertical stem, and adjustable linear head.

## Data Model

Add required `category` to every project. Allowed values are `furniture`, `homewares`, and `lighting`. Validation rejects missing or unknown categories and requires exactly five projects per category.

Each new project follows the existing complete story contract:

- one lead image;
- one card image;
- four detail crop images;
- four in-situ images;
- year, type, materials, summary, and at least three design notes;
- a unique slug and `/work/<slug>` route.

The admin project editor exposes Category as a select control using the same allowed values.

## Image Direction

Every new asset is an original 4:3 WebP. Product identity must remain consistent across the lead, card, detail, and in-situ images for a project. Homewares use cool neutral surfaces, aluminium, off-white polymer, charcoal controls, and sparse domestic context. Lighting uses the same materials with light output shown softly and without theatrical colour effects.

No image contains logos, text overlays, decorative captions, people, or copied Braun product details.

## Accessibility

- The category row uses `role="tablist"` and each control uses `role="tab"` with `aria-selected` and `aria-controls`.
- Left and right arrow keys move between tabs; Home and End select the first and last tabs.
- Visible focus follows the existing olive focus treatment.
- The filtered grid updates its heading and busy state without removing accessible project names.
- Query-string navigation remains usable without JavaScript because the server still returns all project data and Furniture is the default rendered state.

## Tests And Evals

- Validation tests cover allowed categories, missing categories, unknown categories, and five-project category counts.
- Rendering tests verify three tabs, URL persistence, category filtering, keyboard behavior, and category-scoped project navigation.
- Asset tests verify every referenced image exists, is WebP, has unique content within its project, and is exactly 4:3.
- Evals verify the complete fifteen-project catalogue, five projects per category, full detail metadata, restrained tab styling, and absence of copied brand language.
- Browser QA covers desktop and mobile `/work` tabs, one Homewares project, one Lighting project, image loading, console health, and horizontal overflow.

## Deployment

Commit the currently staged 4:3 Furniture assets with the category work so the existing live `404` responses are fixed in the same release. After pushing, rebuild the portfolio service if the live host does not update automatically, then verify all card and lead image URLs return HTTP 200.
