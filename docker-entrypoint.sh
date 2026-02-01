#!/bin/sh
set -e

PRISMA_BIN="./node_modules/prisma/build/index.js"

echo "🔄 Running database migrations..."
node $PRISMA_BIN db push --skip-generate 2>&1 || echo "⚠️  Migration issue"

# Seed on first run
echo "🌱 Checking if seed is needed..."
NEEDS_SEED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log(count === 0 ? 'yes' : 'no');
  process.exit(0);
}).catch(() => {
  console.log('yes');
  process.exit(0);
});
" 2>/dev/null || echo "yes")

if [ "$NEEDS_SEED" = "yes" ]; then
  echo "🌱 Seeding database..."
  node prisma/seed.js 2>&1 || echo "⚠️  Seed failed (non-blocking)"
else
  echo "✅ Database already seeded."
fi

echo "🚀 Starting server..."
exec node server.js
