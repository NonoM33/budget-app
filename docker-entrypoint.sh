#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma db push --skip-generate 2>&1 || echo "⚠️  Migration issue (non-blocking)"

# Seed on first run (check if users exist)
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
