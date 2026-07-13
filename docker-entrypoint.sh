#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running seed (if needed)..."
node prisma/seed.js || true

echo "Starting server..."
exec node server.js
