#!/usr/bin/env bash
set -euo pipefail

echo "Installing PHP dependencies with Composer..."
if command -v composer >/dev/null 2>&1; then
  composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader
else
  echo "Composer not found. Install Composer first: https://getcomposer.org/download/"
  exit 1
fi

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

echo "All done."