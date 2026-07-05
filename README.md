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

Set `ADMIN_PASSWORD` in `.env`, then open `http://127.0.0.1:8788/admin.html`.

The admin saves `data/site.json`. Docker mounts `./data` so edits survive container rebuilds.

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
