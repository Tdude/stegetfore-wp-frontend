# Maintenance & Cleanup Checklist (Docker era)

> The previous checklist covered a one-time migration off PM2/cPanel and is no
> longer relevant. This is the routine maintenance checklist for the current
> Docker Compose deployment. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for how
> deploys actually work.

## Routine health

- [ ] `ssh hostup-vps && cd /opt/stegetfore.nu/stegetfore-wp-frontend && make prod-status`
      → frontend container shows `(healthy)`, **not** restart-looping.
- [ ] `make prod-logs` shows the `Ready in ...` banner **once** (repeated banners
      = the healthcheck/HOSTNAME restart loop has returned — see DEPLOYMENT.md).
- [ ] Warm homepage responds in well under a second:
      `curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://127.0.0.1:3001/`

## Disk / image housekeeping (VPS is shared — be careful)

- [ ] Remove only *dangling* build layers from rebuilds: `docker image prune`
      (avoid `-a` on this host — other projects share it).
- [ ] Old compose backups: prune stale `docker-compose.prod.yaml.bak.*` files.

## Repo hygiene

- [ ] All work is on `main` (production branch). `master` is stale — don't use it.
- [ ] No secrets committed. `.env.production` stays on the VPS only.
- [ ] `NEXT_PUBLIC_DEBUG_MODE=false` and `NEXT_PUBLIC_DISABLE_CACHE=false` in
      production `.env.production`.
- [ ] Verbose `console.log` in server code (e.g. `getPageData` dumping page
      object keys) kept out of production paths.

## After any deploy

- [ ] `make prod-status` healthy, public site loads over nginx, WordPress API
      reachable (`curl -I https://cms.stegetfore.nu`).
