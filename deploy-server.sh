#!/bin/bash
# Deploy script — jalankan di SERVER
set -e

cd ~/app/event-scheduling-management

echo "1. Install dependencies (npm)..."
npm install --legacy-peer-deps 2>&1 | tail -3

echo "2. Generate Prisma client..."
npx prisma generate

echo "3. Build Next.js..."
npx next build

echo "4. Run migrations..."
npx prisma migrate deploy || true

echo "5. Seed database..."
node prisma/seed.js || true

echo "6. Start PM2..."
pm2 delete event-scheduling 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "Done! App running on port 3000"
