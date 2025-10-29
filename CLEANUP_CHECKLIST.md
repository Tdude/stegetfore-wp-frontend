# Cleanup Checklist for Stegetfore.nu Deployment

## 🧹 Server Cleanup Tasks

### Hostup Server (lambda.hostup.se)

#### Remove Redundant Folders
```bash
# SSH to server
ssh wqqeu@lambda.hostup.se

# Check current structure
ls -la ~/

# Folders to KEEP:
# - stegetfore.nu/stegetfore-wp-frontend/
# - rebelkayaks.eu/ (if actively used)
# - obojen.com/ (if actively used)

# Folders to potentially REMOVE (check first!):
# - Any test/temp directories
# - Old backup folders
# - Unused node_modules in home directory

# Example cleanup (VERIFY FIRST):
# rm -rf ~/old_backup_folder
# rm -rf ~/test_site
```

#### Clean Up Node Modules
```bash
# Remove global node_modules in home (if exists and not needed)
cd ~
ls -la node_modules/
# If these are not needed:
# rm -rf ~/node_modules
# rm package.json package-lock.json
```

#### PM2 Process Cleanup
```bash
# List all PM2 processes
pm2 list

# Remove any old/unused processes
# pm2 delete <process-name>

# Keep only:
# - stegetfore-frontend
```

### Plesk Server (pizza / 13.50.90.88)

#### WordPress Cleanup
```bash
# SSH to Plesk
ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88

# Check WordPress plugins/themes
# Remove unused plugins and themes via WordPress admin
# URL: https://cms.stegetfore.nu/wp-admin
```

### Rebel Server (206.168.213.62)

#### Docker Cleanup
```bash
# SSH to rebel
ssh tibbe@206.168.213.62

# Remove unused Docker images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

---

## 🔑 SSH Configuration Cleanup

### Update ~/.ssh/config (Local Machine)

Create or edit `~/.ssh/config`:

```bash
# Stegetfore Frontend (Hostup)
Host hostup
    HostName lambda.hostup.se
    User wqqeu
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Stegetfore WordPress (Plesk)
Host pizza
    HostName 13.50.90.88
    User ubuntu
    IdentityFile ~/.LS-CG-Stockholm-22.cer
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Rebel Kayaks FastAPI
Host rebel
    HostName 206.168.213.62
    User tibbe
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then you can simply use:
```bash
ssh hostup  # Instead of ssh wqqeu@lambda.hostup.se
ssh pizza   # Instead of ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88
ssh rebel   # Instead of ssh tibbe@206.168.213.62
```

---

## 💬 Welcome Messages Setup

### Hostup Server Welcome Message

Create `~/.bash_profile` or edit `~/.bashrc`:

```bash
# SSH to hostup
ssh wqqeu@lambda.hostup.se

# Edit bash profile
nano ~/.bash_profile

# Add this content:
cat >> ~/.bash_profile << 'EOF'

# Custom welcome message
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🚀 HOSTUP SERVER (lambda.hostup.se)                      ║"
echo "║                                                            ║"
echo "║  Purpose: Next.js Frontend Hosting                        ║"
echo "║  User: wqqeu                                              ║"
echo "║                                                            ║"
echo "║  Active Sites:                                            ║"
echo "║  • stegetfore.nu (Next.js on port 3000)                  ║"
echo "║  • rebelkayaks.eu                                        ║"
echo "║  • obojen.com                                            ║"
echo "║                                                            ║"
echo "║  Quick Commands:                                          ║"
echo "║  • pm2 status          - Check app status                ║"
echo "║  • pm2 logs stegetfore-frontend - View logs              ║"
echo "║  • cd ~/stegetfore.nu/stegetfore-wp-frontend             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
EOF

# Apply changes
source ~/.bash_profile
```

### Plesk Server Welcome Message

The Plesk server already has a custom banner at `/var/opt/tibbe_login_banner`:

```bash
# SSH to pizza
ssh -i ~/.LS-CG-Stockholm-22.cer ubuntu@13.50.90.88

# The banner is already configured and shows:
# "yummy!" and Klingon greeting
# Located at: /var/opt/tibbe_login_banner
```

### Rebel Server Welcome Message

```bash
# SSH to rebel
ssh tibbe@206.168.213.62

# Edit bash profile
nano ~/.bash_profile

# Add this content:
cat >> ~/.bash_profile << 'EOF'

# Custom welcome message
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🐳 REBEL SERVER (206.168.213.62)                        ║"
echo "║                                                            ║"
echo "║  Purpose: FastAPI Backend + Docker Services               ║"
echo "║  User: tibbe                                              ║"
echo "║                                                            ║"
echo "║  Active Sites:                                            ║"
echo "║  • api.rebelkayaks.eu (FastAPI)                          ║"
echo "║  • rebelkayaks.eu (Frontend)                             ║"
echo "║                                                            ║"
echo "║  Quick Commands:                                          ║"
echo "║  • docker ps           - List containers                  ║"
echo "║  • docker logs <name>  - View container logs             ║"
echo "║  • cd /opt/rebelkayaks.eu                                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
EOF

# Apply changes
source ~/.bash_profile
```

---

## 📋 Verification Checklist

### After Cleanup

- [ ] Hostup server only has necessary folders
- [ ] PM2 only runs stegetfore-frontend
- [ ] SSH config is set up with aliases
- [ ] Welcome messages display on login
- [ ] All sites are accessible
- [ ] No redundant processes running
- [ ] Disk space freed up

### Test Each Server

```bash
# Test Hostup
ssh hostup
pm2 status
curl http://localhost:3000
exit

# Test Plesk
ssh pizza
curl https://cms.stegetfore.nu/wp-json/steget/v1/site-info
exit

# Test Rebel
ssh rebel
docker ps
exit
```

---

## 🎯 Final State

### Hostup Server
```
/home/wqqeu/
├── stegetfore.nu/
│   └── stegetfore-wp-frontend/  ✅ KEEP
├── rebelkayaks.eu/              ✅ KEEP (if used)
├── obojen.com/                  ✅ KEEP (if used)
└── .bash_profile                ✅ With welcome message
```

### Local Machine SSH
```
~/.ssh/config                    ✅ With host aliases
~/.bashrc or ~/.zshrc            ✅ Clean, no redundant aliases
```

### PM2 Processes (Hostup)
```
stegetfore-frontend              ✅ Running on port 3000
```

---

*Cleanup Date: October 29, 2025*
