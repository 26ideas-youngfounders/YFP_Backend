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

# Use persistent Puppeteer cache on Render
export PUPPETEER_CACHE_DIR="${PUPPETEER_CACHE_DIR:-/opt/render/project/puppeteer}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-/opt/render/.cache}"

mkdir -p "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME"

echo "=== Install Chrome if missing in build cache ==="
if ! find "$XDG_CACHE_HOME/puppeteer" -type f -name chrome -print -quit | grep -q .; then
  echo "...No Chrome in build cache; installing"
  npx puppeteer browsers install chrome
else
  echo "...Chrome found in build cache"
fi

echo "=== Sync cache <-> persistent folder ==="
if ! find "$PUPPETEER_CACHE_DIR" -type f -name chrome -print -quit | grep -q .; then
  echo "...Copying Puppeteer cache FROM build cache TO persistent"
  rsync -a "$XDG_CACHE_HOME/puppeteer/" "$PUPPETEER_CACHE_DIR/" || true
else
  echo "...Persisted cache exists; refreshing build cache FROM persistent"
  rsync -a "$PUPPETEER_CACHE_DIR/" "$XDG_CACHE_HOME/puppeteer/" || true
fi

echo "=== Chrome candidates under $PUPPETEER_CACHE_DIR ==="
find "$PUPPETEER_CACHE_DIR" -maxdepth 5 -type f -name "chrome" -print || true

echo "=== Build done ==="
