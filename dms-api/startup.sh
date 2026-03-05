#!/bin/bash

set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Build files that need a database connection at runtime
echo "Generating SQL types..."
npx prisma generate --sql

echo "Building SQL TypeScript files..."
npx tsc prisma/generated/prisma/sql/*.ts --outDir dist/dms-api/prisma/generated/prisma/sql --target es2020 --module commonjs --declaration

echo "Creating SQL module index..."
cat > dist/dms-api/prisma/generated/prisma/sql/index.js << 'EOF'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { getDonorListItem } = require("./getDonorListItem");
module.exports = { getDonorListItem };
EOF

# Cleanup build files
echo "Cleaning up build files..."
rm -rf prisma
rm -f tsconfig.json prisma.config.ts

echo "Starting application..."
if [ "$1" = "worker" ]; then
  # Run worker-specific logic
  exec node dist/dms-api/src/worker
else
  # Default logic
  exec node dist/dms-api/src/main
fi
