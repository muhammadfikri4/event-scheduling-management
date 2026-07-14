#!/bin/bash
# Deploy script — jalankan di Mac (lokal)
# Usage: bash deploy.sh

set -e

SERVER="linuxuser@139.180.189.0"
REMOTE_DIR="/home/linuxuser/app/event-scheduling-management"

echo "1. Building Next.js standalone..."
pnpm build

echo "2. Packaging standalone output..."
rm -rf deploy-package
mkdir -p deploy-package

# Copy standalone + static + public
cp -r .next/standalone/. deploy-package/
cp -r .next/static deploy-package/.next/static
cp -r public deploy-package/public

# Copy prisma files for migrate + seed
cp -r prisma deploy-package/prisma
cp prisma.config.ts deploy-package/prisma.config.ts
cp ecosystem.config.js deploy-package/ecosystem.config.js
cp docker-entrypoint.sh deploy-package/

# Compress
tar -czf deploy-package.tar.gz -C deploy-package .

echo "3. Uploading to server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"
scp deploy-package.tar.gz $SERVER:$REMOTE_DIR/

echo "4. Extracting on server..."
ssh $SERVER "cd $REMOTE_DIR && tar -xzf deploy-package.tar.gz && rm deploy-package.tar.gz"

echo "5. Running migrate & seed on server..."
ssh $SERVER "cd $REMOTE_DIR && npx prisma migrate deploy && node prisma/seed.js || true"

echo "6. Restarting PM2..."
ssh $SERVER "cd $REMOTE_DIR && pm2 start ecosystem.config.js --update-env && pm2 save"

echo "Done! App running at http://139.180.189.0:3000"

# Cleanup local
rm -rf deploy-package deploy-package.tar.gz
