#!/usr/bin/env bash
# Build the Next.js standalone output and assemble a self-contained deploy
# bundle under deploy/_bundle/, ready to copy to the server and run with
# `docker compose up -d --build`. Build here (not on the small VPS) to avoid OOM.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> next build (standalone)"
npm run build

BUNDLE="$ROOT/deploy/_bundle"
echo "==> assembling bundle at $BUNDLE"
rm -rf "$BUNDLE"
mkdir -p "$BUNDLE/app" "$BUNDLE/static" "$BUNDLE/public"

cp -a .next/standalone/. "$BUNDLE/app/"
cp -a .next/static/. "$BUNDLE/static/"
if [ -d public ]; then cp -a public/. "$BUNDLE/public/"; fi
cp deploy/Dockerfile deploy/docker-compose.yml deploy/Caddyfile "$BUNDLE/"

echo "==> bundle ready: $BUNDLE"
du -sh "$BUNDLE" 2>/dev/null || true
