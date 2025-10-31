# Stegetfore.nu Deployment Guide

## 🏗️ Architecture Overview

### Production Setup
- **Frontend (Next.js)**: Hostup server (lambda.hostup.se / 185.113.11.10)
- **Backend (WordPress)**: Plesk server (cms.stegetfore.nu / 13.50.90.88)
- **Domain**: stegetfore.nu

### Server Infrastructure

#### Server 1: Hostup/Lambda (185.113.11.10)
- **Purpose**: Next.js frontend hosting
- **User**: `wqqeu`
- **SSH**: `ssh wqqeu@lambda.hostup.se`
- **Control Panel**: cPanel
- **Services**: Node.js (v24.11.0), PM2, Apache
- **Other Sites**: rebelkayaks.eu, obojen.com, boldstatement.se

#### Server 2: Plesk (13.50.90.88)
- **Purpose**: WordPress CMS backend
- **User**: `ubuntu`
- **SSH**: `ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88` (alias: `pizza`)
- **Control Panel**: Plesk
- **Services**: WordPress, MySQL, PHP 8.2.29
- **URL**: https://cms.stegetfore.nu

#### Server 3: Rebel (206.168.213.62)
- **Purpose**: FastAPI backend for rebelkayaks.eu
- **User**: `tibbe`
- **SSH**: `ssh tibbe@206.168.213.62` (alias: `rebel`)
- **Services**: Docker, FastAPI, Nginx
- **Sites**: rebelkayaks.eu API

---

## 📁 Directory Structure

### Hostup Server
```
/home/wqqeu/
├── stegetfore.nu/
│   ├── stegetfore-wp-frontend/    # Next.js app (standalone build)
│   │   ├── server.js              # Main server entry point
│   │   ├── .next/                 # Built Next.js app
│   │   ├── public/                # Static assets
│   │   ├── .env.production        # Production environment variables
│   │   └── package.json
│   └── .htaccess                  # Apache proxy config
├── rebelkayaks.eu/
├── obojen.com/
└── public_html/
```

### Local Development
```
~/Sites/DOCKER/stegetfore.nu/
└── stegetfore-wp-frontend/
    ├── src/                       # Source code
    ├── .next/                     # Build output
    ├── .env.local                 # Local dev environment
    ├── .env.production            # Production environment
    └── next.config.js
```

---

## 🚀 Deployment Process

### Prerequisites
- Node.js v24+ installed locally
- SSH access to Hostup server
- Git repository access

### Quick Deploy (Automated)

Use the `deploy.sh` script for automated deployment:

```bash
# Full deployment (build + sync + restart)
./deploy.sh

# Skip build (use existing .next folder)
./deploy.sh --skip-build

# Skip PM2 restart
./deploy.sh --skip-restart

# Dry run (see what would happen)
./deploy.sh --dry-run

# Show help
./deploy.sh --help
```

**What the script does:**
1. ✅ Builds the Next.js app locally (`npm run build`)
2. ✅ Syncs standalone build to server via rsync
3. ✅ Syncs static files (.next/static)
4. ✅ Syncs public assets
5. ✅ Creates symlinks in document root
6. ✅ Restarts PM2 application
7. ✅ Shows deployment summary

### Manual Deployment

If you prefer manual control:

### Step 1: Build Locally
```bash
cd ~/Sites/DOCKER/stegetfore.nu/stegetfore-wp-frontend
npm run build
```

**Why build locally?**
- Hostup server has limited resources (hits process limits)
- Faster build times on local machine
- Avoids production server crashes during build

### Step 2: Sync to Server
```bash
# Sync standalone build
rsync -avz --delete .next/standalone/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/

# Sync static files
rsync -avz .next/static wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/.next/

# Sync public assets
rsync -avz public/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/public/
```

### Step 3: Restart Application
```bash
# SSH to server
ssh wqqeu@lambda.hostup.se

# Navigate to app directory
cd ~/stegetfore.nu/stegetfore-wp-frontend

# Restart PM2 process
pm2 restart stegetfore-frontend

# Check logs
pm2 logs stegetfore-frontend --lines 50
```

### Step 4: Verify Deployment
```bash
# Test locally on server
curl http://localhost:3000

# Test via domain
curl http://stegetfore.nu

# Check in browser
open http://stegetfore.nu
```

---

## ⚙️ Configuration Files

### Environment Variables (.env.production)
```bash
NEXT_PUBLIC_WORDPRESS_URL=https://cms.stegetfore.nu
NEXT_PUBLIC_API_URL=https://cms.stegetfore.nu/wp-json
NEXT_PUBLIC_THEME_SLUG=steget
NEXT_PUBLIC_USE_MODULAR_TEMPLATES=true
REVALIDATION_TOKEN=#h411edudane-DA_50M_3N_gube_kan_MÅ!
HOMEPAGE_ID=2
```

### Next.js Config (next.config.js)
```javascript
const nextConfig = {
  output: 'standalone',           // Required for production deployment
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,     // Skip linting in production builds
  },
  typescript: {
    ignoreBuildErrors: true,      // Skip TS errors in production builds
  },
  // ... rest of config
};
```

### Apache Proxy (.htaccess)
Located at: `/home/wqqeu/stegetfore.nu/.htaccess`
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?stegetfore\.nu$ [NC]
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### PM2 Configuration
```bash
# Start application
HOSTNAME=0.0.0.0 PORT=3000 pm2 start server.js --name "stegetfore-frontend"

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## 🔧 Common Tasks

### Update Code
```bash
# Local machine
cd ~/Sites/DOCKER/stegetfore.nu/stegetfore-wp-frontend
git pull
npm run build
rsync -avz --delete .next/standalone/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/
rsync -avz .next/static wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/.next/
rsync -avz public/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/public/

# Server
ssh wqqeu@lambda.hostup.se
cd ~/stegetfore.nu/stegetfore-wp-frontend
pm2 restart stegetfore-frontend
```

### View Logs
```bash
# Real-time logs
pm2 logs stegetfore-frontend

# Last 100 lines
pm2 logs stegetfore-frontend --lines 100

# Error logs only
pm2 logs stegetfore-frontend --err

# Log files location
ls -la ~/.pm2/logs/
```

### Check Application Status
```bash
# PM2 status
pm2 status

# Detailed info
pm2 info stegetfore-frontend

# Monitor resources
pm2 monit
```

### Restart Application
```bash
# Graceful restart
pm2 restart stegetfore-frontend

# Hard restart
pm2 delete stegetfore-frontend
HOSTNAME=0.0.0.0 PORT=3000 pm2 start server.js --name "stegetfore-frontend"
pm2 save
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 not accessible
**Symptoms**: `curl http://localhost:3000` fails
**Solution**:
```bash
# Check if app is running
pm2 status

# Check logs for errors
pm2 logs stegetfore-frontend --lines 50

# Restart with explicit hostname
pm2 delete stegetfore-frontend
HOSTNAME=0.0.0.0 PORT=3000 pm2 start server.js --name "stegetfore-frontend"
```

### Issue: 404 on domain
**Symptoms**: Browser shows Apache 404
**Solution**:
```bash
# Check .htaccess exists
ls -la ~/stegetfore.nu/.htaccess

# Verify content
cat ~/stegetfore.nu/.htaccess

# Test proxy
curl -I http://stegetfore.nu
```

### Issue: Build fails on server
**Symptoms**: `npm run build` crashes with EAGAIN error
**Solution**: Always build locally, never on server
```bash
# Local machine only
npm run build
rsync -avz --delete .next/standalone/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/
```

### Issue: DNS not resolving
**Symptoms**: Domain points to wrong IP
**Solution**:
```bash
# Check current DNS
dig stegetfore.nu +short

# Should return: 185.113.11.10
# If returns 13.50.90.88, contact Plesk admin (Brett) to fix DNS
```

### Issue: API calls failing
**Symptoms**: Pages show no content
**Solution**:
```bash
# Test API from server
curl https://cms.stegetfore.nu/wp-json/steget/v1/site-info

# Check environment variables
cat .env.production

# Verify WordPress is accessible
curl -I https://cms.stegetfore.nu
```

---

## 🔐 SSH Access Quick Reference

### Hostup Server (Frontend)
```bash
# Full command
ssh wqqeu@lambda.hostup.se

# Or using IP
ssh wqqeu@185.113.11.10

# Alias (add to ~/.ssh/config)
Host hostup
    HostName lambda.hostup.se
    User wqqeu
```

### Plesk Server (WordPress)
```bash
# Full command
ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88

# Alias (add to ~/.bashrc or ~/.zshrc)
alias pizza='ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88'
```

### Rebel Server (FastAPI)
```bash
# Full command
ssh tibbe@206.168.213.62

# Alias
alias rebel='ssh tibbe@206.168.213.62'
```

---

## 📝 Important Notes

### Server Resource Limitations
- **Hostup server has limited resources** - cannot build Next.js apps
- Always build locally and rsync the built files
- Monitor PM2 memory usage: `pm2 monit`

### DNS Configuration
- Domain managed via Plesk DNS
- Current issue: DNS not updating properly (contact Brett/Codegravity)
- Temporary workaround: Access via `http://lambda.hostup.se:3000`

### Deployment Strategy
- **Development**: Local machine with `npm run dev`
- **Build**: Local machine with `npm run build`
- **Deploy**: Rsync to server, restart PM2
- **Monitor**: PM2 logs and status

### Security Considerations
- Environment variables in `.env.production` (not committed to Git)
- WordPress backend on separate server (cms.stegetfore.nu)
- API authentication tokens in environment variables
- SSL/HTTPS to be configured after DNS propagation

---

## 🎯 Next Steps

1. **DNS Resolution**: Contact Brett to fix Plesk DNS sync issue
2. **SSL Certificate**: Add Let's Encrypt SSL after DNS is working
3. **PM2 Startup**: Configure PM2 to auto-start on server reboot
4. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot)
5. **Backups**: Configure automated backups of production data
6. **CI/CD**: Consider GitHub Actions for automated deployments

---

## 📞 Support Contacts

- **Hostup Support**: For cPanel, Apache, server issues
- **Brett/Codegravity**: For Plesk, DNS, WordPress issues
- **GitHub**: https://github.com/Tdude/stegetfore-wp-frontend

---

*Last Updated: October 29, 2025*
