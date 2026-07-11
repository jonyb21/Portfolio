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

Project images can use existing `/assets/...` files or full `https://` URLs. Each project page needs one main image, materials, at least three notes, four cropped image studies, and four in situ images so the detail page renders as a complete nine-image product story. Every Homewares project includes at least one `-in-use-` scene showing a person or hand operating the product.

Homepage slides, work cards, and project leads use native 4:3 image assets, so the frames fill edge to edge without side bands or product cropping. Detail-study tiles fill their frames and retain the uncropped source in the click-to-preview view.

Run `powershell -ExecutionPolicy Bypass -File scripts/normalize-media.ps1` after replacing local project images. It pads the uncropped source over a blurred 4:3 fill and skips assets that are already native 4:3.

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
