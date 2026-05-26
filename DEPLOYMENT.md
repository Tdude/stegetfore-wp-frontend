# Stegetfore.nu Frontend — Deployment Guide

> **Production is Docker.** This frontend is built and run as a Next.js
> standalone server inside Docker Compose, behind nginx, on the production VPS.
> Older PM2 / rsync / Netlify / Cloudflare instructions have been removed — they
> described an abandoned setup and were the source of repeated confusion.

---

## Architecture

| Piece | Where | Notes |
|-------|-------|-------|
| **Frontend** (this repo) | Production VPS, Docker Compose | Next.js `output: 'standalone'` → `node server.js`, container port `3000`, published to `127.0.0.1:3001` |
| **Reverse proxy** | nginx on the VPS | Proxies the public site to `http://127.0.0.1:3001` |
| **Backend** (WordPress) | `https://cms.stegetfore.nu` | Separate server, headless REST API. Stable; not managed from this repo |

- **SSH to the VPS:** `ssh hostup-vps`
- **App directory on the VPS:** `/opt/stegetfore.nu/stegetfore-wp-frontend`
- **Deployed branch:** `main` (the VPS checkout tracks `origin/main`)

---

## Branch policy (IMPORTANT)

**Production deploys `main`. Do all development on `main`.**

GitHub's *default* branch is currently `master`, but `master` is stale and **not**
deployed. Committing to `master` ships nothing. Set your local default to `main`
and consider changing the GitHub default branch to `main` to remove the trap.

```bash
git checkout main
git branch --set-upstream-to=origin/main main
```

---

## Deploying

All deploys are git-based and run **on the VPS** via the `Makefile`.

```bash
ssh hostup-vps
cd /opt/stegetfore.nu/stegetfore-wp-frontend

make help          # list all commands

# Code change (new commits on origin/main):
make remod         # git pull + docker compose build --no-cache + up -d

# Config-only change (e.g. compose/env), no rebuild needed:
make prod-up       # docker compose up -d

# Other:
make prod-restart  # restart containers
make prod-logs     # tail logs (last 200 lines, follow)
make prod-status   # container status + health
make prod-down     # stop containers
```

The image is built **on the VPS** (`build: context: .` in `docker-compose.prod.yaml`),
so a clean working tree on `main` is all that's required — no local build/rsync.

---

## Runtime configuration

### Standalone bind address (the healthcheck gotcha)

Next.js standalone `server.js` binds to `process.env.HOSTNAME`. Docker auto-sets
`HOSTNAME` to the **container ID**, which makes the server listen only on the
container's eth0 IP. The in-container healthcheck (`fetch http://127.0.0.1:3000/`)
then can never connect, the container is marked **unhealthy**, and the `autoheal`
sidecar restarts a perfectly healthy app every ~2 minutes — causing periodic
multi-second responses as the SSR cache cold-starts each time.

**Fix (already applied):** bind to all interfaces. Set in **both** places so it
survives any rebuild:

- `Dockerfile.prod` runner stage: `ENV HOSTNAME=0.0.0.0` and `ENV PORT=3000`
- `docker-compose.prod.yaml` `frontend.environment`: `- HOSTNAME=0.0.0.0`

### Healthcheck + autoheal

`docker-compose.prod.yaml` defines a healthcheck and labels the container
`autoheal=true`; the `willfarrell/autoheal` sidecar restarts any container that
goes unhealthy. Verify health with `make prod-status` (look for `(healthy)`).

### Environment variables — `.env.production` (NOT committed)

Lives on the VPS at `/opt/stegetfore.nu/stegetfore-wp-frontend/.env.production`
and is loaded via `env_file`. Keys (values are secret, keep them out of git):

```
NEXT_PUBLIC_WORDPRESS_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_THEME_SLUG
NEXT_PUBLIC_USE_MODULAR_TEMPLATES
NEXT_PUBLIC_DEBUG_MODE          # must be false in production
NEXT_PUBLIC_DISABLE_CACHE       # leave false in production
REVALIDATION_TOKEN              # SECRET — rotate if ever exposed
HOMEPAGE_ID
NEXT_PUBLIC_UMAMI_HOST
NEXT_PUBLIC_UMAMI_WEBSITE_ID
```

> ⚠️ Never commit `REVALIDATION_TOKEN` or any secret to git or to docs.

---

## Verifying a deploy

```bash
ssh hostup-vps
cd /opt/stegetfore.nu/stegetfore-wp-frontend
make prod-status                                   # expect: Up ... (healthy)
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://127.0.0.1:3001/
make prod-logs                                     # check for errors
```

A warm homepage should respond well under a second. If you see the banner
`Ready in ...` printed repeatedly in the logs, the container is restart-looping —
check the healthcheck and the `HOSTNAME` binding above.

---

## Rollback

- **Config change:** `docker-compose.prod.yaml` edits are backed up as
  `docker-compose.prod.yaml.bak.<timestamp>`; restore one and `make prod-up`.
- **Code change:** `git revert <bad-commit>` on `main`, push, then `make remod`.

---

## Local development

See [`DEPLOY_LOCAL.md`](./DEPLOY_LOCAL.md). In short: run local WordPress via the
parent `docker-compose.yaml`, then `npm install && npm run dev` in this folder.
The production Docker images are **not** used for local dev.
