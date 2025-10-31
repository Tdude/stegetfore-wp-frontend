#!/bin/bash
# Deploy script for Steget Före frontend
# Builds locally and syncs to remote server via SCP/rsync

set -e  # Exit on error

# Configuration
REMOTE_USER="wqqeu"
REMOTE_HOST="lambda.hostup.se"
REMOTE_PATH="~/stegetfore.nu/stegetfore-wp-frontend"
REMOTE_DOC_ROOT="~/stegetfore.nu"
PM2_APP_NAME="stegetfore-frontend"
SITE_URL="http://stegetfore.nu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse arguments
SKIP_BUILD=false
SKIP_RESTART=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-restart)
            SKIP_RESTART=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-build      Skip the build step (use existing .next folder)"
            echo "  --skip-restart    Skip PM2 restart"
            echo "  --dry-run         Show what would be done without doing it"
            echo "  --help            Show this help message"
            echo ""
            echo "Example:"
            echo "  ./deploy.sh                    # Full deployment"
            echo "  ./deploy.sh --skip-build       # Deploy without rebuilding"
            echo "  ./deploy.sh --dry-run          # Test deployment without changes"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Start deployment
echo ""
log_info "Starting deployment to ${REMOTE_HOST}..."
echo ""

# Check if .next exists if skipping build
if [ "$SKIP_BUILD" = true ]; then
    if [ ! -d ".next" ]; then
        log_error ".next directory not found! Cannot skip build."
        exit 1
    fi
    log_warning "Skipping build step (using existing .next folder)"
else
    # Build the application
    log_info "Building Next.js application..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "[DRY RUN] Would run: npm run build"
    else
        npm run build
        log_success "Build completed"
    fi
fi

echo ""

# Check if build output exists
if [ ! -d ".next/standalone" ]; then
    log_error ".next/standalone directory not found!"
    log_error "Make sure your next.config.js has: output: 'standalone'"
    exit 1
fi

# Sync standalone build
log_info "Syncing standalone build to remote server..."
if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would run: rsync -avz --delete .next/standalone/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
else
    rsync -avz --delete --progress .next/standalone/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
    log_success "Standalone build synced"
fi

echo ""

# Sync static files
log_info "Syncing static files..."
if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would run: rsync -avz .next/static/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/.next/static/"
else
    rsync -avz --progress .next/static/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/.next/static/
    log_success "Static files synced"
fi

echo ""

# Sync public files
log_info "Syncing public files..."
if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would run: rsync -avz public/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/public/"
else
    rsync -avz --progress public/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/public/
    log_success "Public files synced"
fi

echo ""

# Create symlinks in document root
log_info "Creating symlinks in document root..."
if [ "$DRY_RUN" = true ]; then
    log_warning "[DRY RUN] Would create symlinks on remote server"
else
    ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd ~/stegetfore.nu
rm -f file.svg globe.svg logo-tryggve-inverted.svg logo-tryggve.svg next.svg trumpet2d.svg vercel.svg window.svg images
ln -s stegetfore-wp-frontend/public/file.svg .
ln -s stegetfore-wp-frontend/public/globe.svg .
ln -s stegetfore-wp-frontend/public/logo-tryggve-inverted.svg .
ln -s stegetfore-wp-frontend/public/logo-tryggve.svg .
ln -s stegetfore-wp-frontend/public/next.svg .
ln -s stegetfore-wp-frontend/public/trumpet2d.svg .
ln -s stegetfore-wp-frontend/public/vercel.svg .
ln -s stegetfore-wp-frontend/public/window.svg .
ln -s stegetfore-wp-frontend/public/images .
ENDSSH
    log_success "Symlinks created"
fi

echo ""

# Restart PM2
if [ "$SKIP_RESTART" = true ]; then
    log_warning "Skipping PM2 restart"
else
    log_info "Restarting PM2 application..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "[DRY RUN] Would run: pm2 restart ${PM2_APP_NAME}"
    else
        ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && pm2 restart ${PM2_APP_NAME}" || {
            log_error "PM2 restart failed!"
            log_info "You may need to start the app manually:"
            log_info "  ssh ${REMOTE_USER}@${REMOTE_HOST}"
            log_info "  cd ${REMOTE_PATH}"
            log_info "  pm2 start server.js --name ${PM2_APP_NAME}"
            exit 1
        }
        log_success "PM2 application restarted"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN COMPLETE - No changes were made"
else
    log_success "Deployment complete!"
fi
echo ""
log_info "Site URL: ${SITE_URL}"
log_info "Remote path: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
