# Portfolio

Dark industrial-design portfolio site for `portfolio.jonllm.xyz`, with a small admin UI at `/admin.html`.

## Run Locally

```powershell
Copy-Item .env.example .env
npm test
npm run eval
npm run eval:browser
npm start
```

Open `http://127.0.0.1:8788`.

## Admin

Set `ADMIN_PASSWORD` in `.env`, then open `http://127.0.0.1:8788/admin`.

The admin saves `data/site.json`. Docker mounts `./data` so edits survive container rebuilds.

The Work page uses `?category=furniture`, `?category=homewares`, or `?category=lighting`. Each category contains exactly five projects, enforced by the server, tests, and preflight eval.

Project images use local `/assets/...` WebP files. Each project page needs one main image, materials, at least three notes, four studio/detail studies, and four context images so the detail page renders as a complete nine-image product story. Every Homewares and Lighting project includes a final use scene showing the product being operated or illuminated in context.

Homepage slides, work cards, project leads, and gallery images use native 4:3 assets, so every frame fills edge to edge without side bands or blur fills. Homewares and Lighting media uses the `-vibrant-v1.webp` image set and keeps nine unique files per product story.

Lighting cards use `cardImage` for the switched-off state and `image` for the illuminated hover and keyboard-focus state. Both files must use the same product, framing, and 4:3 geometry so the 650 ms crossfade reads as the light switching on rather than a scene change.

Prepare replacement media at a native 4:3 ratio before adding it to the project. Extend or recompose the source image when required; do not use letterboxing or blurred edge fills.

The admin uses a structured editor: expand a project to edit its details and eight image-study rows, then use the About tab to manage individual experience entries. The server rejects missing, repeated, or invalid product-page image paths before saving.

## Docker

```powershell
docker compose up -d --build
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8788/api/health
```

## Cloudflare

The intended tunnel route is:

```yaml
- hostname: portfolio.jonllm.xyz
  service: http://127.0.0.1:8788
```

Run the route through the existing Cloudflare tunnel that serves the other `jonllm.xyz` subdomains.
