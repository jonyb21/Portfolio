# Portfolio

Dark furniture-style portfolio site for `portfolio.jonllm.xyz`, with a small admin UI at `/admin.html`.

## Run Locally

```powershell
Copy-Item .env.example .env
npm test
npm run eval
npm start
```

Open `http://127.0.0.1:8788`.

## Admin

Set `ADMIN_PASSWORD` in `.env`, then open `http://127.0.0.1:8788/admin`.

The admin saves `data/site.json`. Docker mounts `./data` so edits survive container rebuilds.

Project images can use existing `/assets/...` files or full `https://` URLs. Each project page needs one main image, materials, at least three notes, four cropped image studies, and four in situ images so the detail page renders as a complete nine-image product story.

Public photos are presented in consistent 4:3 frames with `object-fit: contain`, so source images keep their full composition without cropping.

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
