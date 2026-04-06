#!/usr/bin/env bash
set -euo pipefail

echo "Installing PHP dependencies with Composer..."
if command -v composer >/dev/null 2>&1; then
  composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader
else
  echo "Composer not found. Install Composer first: https://getcomposer.org/download/"
  exit 1
fi

echo "Ensuring Laravel storage directories exist (sessions, cache, views, logs)..."
mkdir -p storage/framework/sessions \
  storage/framework/cache/data \
  storage/framework/views \
  storage/logs
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

if [ -f package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    echo "Installing Node dependencies..."
    if [ -f package-lock.json ]; then
      npm ci
    else
      npm install
    fi
    echo "Building front-end assets if present..."
    npm run build --if-present
  else
    echo "npm not found. Install Node.js/npm first: https://nodejs.org/"
    exit 1
  fi
else
  echo "No package.json found — skipping Node/npm steps."
fi

# If this file exists (often copied from a dev machine), Laravel loads assets from
# the Vite dev server (e.g. localhost:5173) instead of public/build — blank page in production.
echo "Removing public/hot if present (forces use of npm run build output)..."
rm -f public/hot

echo "All done."