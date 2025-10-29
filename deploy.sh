#!/bin/bash
set -e

echo "🚀 Building Next.js app..."
npm run build

echo "📦 Syncing standalone build..."
rsync -avz --delete .next/standalone/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/

echo "📦 Syncing static files..."
rsync -avz .next/static/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/.next/static/

echo "📦 Syncing public files..."
rsync -avz public/ wqqeu@lambda.hostup.se:~/stegetfore.nu/stegetfore-wp-frontend/public/

echo "🔗 Creating symlinks in document root..."
ssh wqqeu@lambda.hostup.se << 'ENDSSH'
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
echo "✅ Symlinks created"
ENDSSH

echo "🔄 Restarting PM2..."
ssh wqqeu@lambda.hostup.se "cd ~/stegetfore.nu/stegetfore-wp-frontend && pm2 restart stegetfore-frontend"

echo "✅ Deployment complete!"
echo "🌐 Visit: http://stegetfore.nu"
