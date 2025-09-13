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

echo "=== Installing Chrome for Puppeteer into /tmp/puppeteer ==="
mkdir -p /tmp/puppeteer
npx puppeteer browsers install chrome --path=/tmp/puppeteer

echo "=== List installed browsers under /tmp/puppeteer ==="
ls -la /tmp/puppeteer || true
find /tmp/puppeteer -maxdepth 5 -type f -name "chrome" -print || true

echo "=== Build done ==="
