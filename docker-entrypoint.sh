#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma db push --skip-generate 2>/dev/null || true

# Seed on first run (check if users exist)
echo "🌱 Checking if seed is needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('No users found, seeding...');
    process.exit(1);
  } else {
    console.log('Database already seeded.');
    process.exit(0);
  }
}).catch(() => process.exit(1));
" && SKIP_SEED=1 || SKIP_SEED=0

if [ "$SKIP_SEED" = "0" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed 2>/dev/null || echo "⚠️  Seed failed (non-blocking)"
fi

echo "🚀 Starting server..."
exec node server.js
