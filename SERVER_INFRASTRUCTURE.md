# Server Infrastructure Documentation

## Quick SSH Access

```bash
# HostUp (stegetfore.nu frontend)
ssh hostup
# or: ssh wqqeu@lambda.hostup.se

# Rebel/Docker (rebelkayaks.eu)
ssh rebel
# or: ssh tibbe@206.168.213.62

# Immich/Hetzner (images.rebelkayaks.eu)
ssh immich
# or: ssh root@91.98.144.148
```

## Server Overview

### 1. HostUp Lambda (stegetfore.nu)
- **SSH:** `ssh wqqeu@lambda.hostup.se` or `ssh hostup`
- **IP:** 185.113.11.10
- **User:** wqqeu (no sudo)
- **Purpose:** Next.js frontend for stegetfore.nu
- **Deployment:** Use `./deploy.sh` from local machine (rsync-based)
- **App Location:** `~/stegetfore.nu/stegetfore-wp-frontend`
- **Process Manager:** PM2
- **Restart:** `pm2 restart stegetfore-frontend`

**Limitations:**
- Cannot build Next.js (insufficient resources)
- No sudo access
- Limited memory (~200MB)
- Deploy pre-built code via rsync

### 2. Rebel VPS (rebelkayaks.eu + Docker)
- **SSH:** `ssh tibbe@206.168.213.62` or `ssh rebel`
- **IP:** 206.168.213.62
- **Users:** tibbe (has sudo), root
- **Purpose:** Docker-based apps (FastAPI backend, Svelte frontend)
- **Repo Location:** `/opt/rebelkayaks.eu/`
- **Deployment:** Git-based with Docker Compose

**Services:**
- FastAPI backend
- Svelte frontend
- Multiple domains via Docker

**Deployment Process:**
```bash
ssh rebel
cd /opt/rebelkayaks.eu
git pull origin main
make prod
make prod-ps  # Check status
make prod-logs SERVICE=idun-ui  # View logs
```

### 3. Hetzner (images.rebelkayaks.eu)
- **SSH:** `ssh root@91.98.144.148` or `ssh immich`
- **IP:** 91.98.144.148
- **User:** root
- **Purpose:** Immich photo server + immich-public-proxy
- **Services:** Image hosting and management

---

## Domain Configuration

### HostUp Domains (Shared Hosting)
- **Primary:** boldstatement.se
- **Addon Domains:** rebelkayaks.eu, obojen.com, stegetfore.nu
- **Control Panel:** https://cloud.hostup.se/ (BankID login)
- **Admin Panel:** https://min.hostup.se/root/ (Google 2FA)
- **Email:** tibbemail@gmail.com

### DNS Configuration
**HostUp Nameservers:**
- primary.ns.hostup.se
- secondary.ns.hostup.se

**Server IPs:**
- HostUp Web: 185.113.11.10
- HostUp cPanel: 185.113.11.10
- Rebel VPS: 206.168.213.62
- Assigned IP: 206.168.214.190

---

## stegetfore.nu Deployment

### Current Setup (Recommended)
Uses rsync to deploy pre-built Next.js app to HostUp server.

**Local Deployment Script:**
```bash
cd ~/Sites/DOCKER/stegetfore.nu/stegetfore-wp-frontend
./deploy.sh
```

**What deploy.sh does:**
1. Builds Next.js app locally
2. Syncs standalone build to server
3. Syncs static files (.next/static/)
4. Syncs public files
5. Creates symlinks in document root
6. Restarts PM2

**Why rsync instead of git:**
- ✅ Server has limited resources (can't build)
- ✅ Faster deployments (pre-built locally)
- ✅ No git complexity on server
- ✅ Server just runs the built code

### Manual Deployment (if needed)
```bash
# Build locally
npm run build

# Sync to server
rsync -avz --delete .next/standalone/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/
rsync -avz .next/static/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/.next/static/
rsync -avz public/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/public/

# SSH to server and restart
ssh hostup
cd ~/stegetfore.nu/stegetfore-wp-frontend
pm2 restart stegetfore-frontend
```

---

## rebelkayaks.eu Deployment

### Docker-based Deployment
```bash
ssh rebel
cd /opt/rebelkayaks.eu
git pull origin main
make prod
```

**Check Status:**
```bash
make prod-ps
make prod-logs SERVICE=idun-ui
```

---

## Access Credentials

### HostUp Control Panel
- **URL:** https://cloud.hostup.se/
- **Login:** BankID
- **Email:** tibbemail@gmail.com

### HostUp Admin Panel
- **URL:** https://min.hostup.se/root/
- **Login:** Google 2FA
- **Email:** tibbemail@gmail.com

### FTP/SSH (HostUp)
- **Host:** lambda.hostup.se
- **User:** wqqeu
- **Password:** [REDACTED - See secure storage]
- **Port:** 21 (FTP), 22 (sFTP/SSH)

### Webmail Admin
- **URL:** https://boldstatement.se:2096/
- **User:** info@boldstatement.se
- **Password:** [REDACTED - See secure storage]

### Email Accounts
- info@rebelkayaks.eu - [REDACTED]
- info@boldstatement.se - [REDACTED]

---

## File Structure

### HostUp (Shared Hosting)
```
/home/wqqeu/
├── public_html/              # boldstatement.se
├── rebelkayaks.eu/           # Addon domain
├── obojen.se/                # Addon domain
└── stegetfore.nu/
    └── stegetfore-wp-frontend/  # Next.js app
```

### Rebel VPS (Docker)
```
/opt/rebelkayaks.eu/
├── fastapi/       # Backend
├── svelte/        # Frontend
├── immich/        # Image service config
├── docker-compose.yml
└── Makefile
```

---

## Troubleshooting

### stegetfore.nu Issues

**404 Errors for Static Files:**
- Run `./deploy.sh` to recreate symlinks
- Symlinks must be in document root for Next.js to serve files

**App Not Starting:**
```bash
ssh hostup
cd ~/stegetfore.nu/stegetfore-wp-frontend
pm2 restart stegetfore-frontend
pm2 logs stegetfore-frontend
```

**Build Fails:**
- Never build on server (insufficient resources)
- Always build locally and deploy via rsync

### rebelkayaks.eu Issues

**Docker Services Down:**
```bash
ssh rebel
cd /opt/rebelkayaks.eu
make prod-ps
make prod-logs SERVICE=<service-name>
make prod  # Restart all
```

**Git Pull Fails:**
```bash
git stash
git pull origin main
git stash pop
```

---

## Server Limitations

### HostUp Lambda
- **Memory:** ~200MB (very limited)
- **CPU:** Shared, throttled
- **No sudo access**
- **Cannot build Next.js apps**
- **Max ~200 concurrent users** (will crash under heavy load)

### Recommendations
- Keep using rsync deployment for stegetfore.nu
- Consider migrating to Vercel/Netlify for production traffic
- Keep backends on Rebel VPS (has resources)

---

## Quick Commands

### Check Server IP
```bash
curl ifconfig.me
```

### stegetfore.nu Deployment
```bash
./deploy.sh
```

### rebelkayaks.eu Deployment
```bash
ssh rebel && cd /opt/rebelkayaks.eu && git pull && make prod
```

### View Logs
```bash
# stegetfore.nu
ssh hostup
pm2 logs stegetfore-frontend

# rebelkayaks.eu
ssh rebel
make prod-logs SERVICE=idun-ui
```

---

## Security Notes

⚠️ **TODO: Change all passwords after organizing this document**

- All credentials marked [REDACTED] should be stored in password manager
- Enable 2FA where available
- Rotate SSH keys periodically
- Keep backup of SSH config (~/.ssh/config)
