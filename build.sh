#!/usr/bin/env bash
set -euo pipefail

echo "=== Build start ==="
node -v
npm -v

echo "=== Installing production dependencies ==="
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

# Sync Puppeteer cache with Render's persistent project dir
echo "=== Handling Puppeteer cache ==="
if [[ ! -d "${PUPPETEER_CACHE_DIR:-}" ]]; then
  echo "...Copying Puppeteer cache FROM build cache -> TO project dir"
  # Puppeteer’s default install cache lives under $XDG_CACHE_HOME/puppeteer
  cp -R "${XDG_CACHE_HOME:-$HOME/.cache}/puppeteer" "/opt/render/project/puppeteer" || true
else
  echo "...Storing Puppeteer cache FROM project dir -> TO build cache"
  mkdir -p "${XDG_CACHE_HOME:-$HOME/.cache}"
  cp -R "/opt/render/project/puppeteer" "${XDG_CACHE_HOME:-$HOME/.cache}/" || true
fi

echo "=== Build done ==="
