#!/usr/bin/env bash
# Runs ON THE SERVER: /opt/skycoach-advisor/deploy/server-deploy.sh
# Pulls the latest main and rebuilds + restarts the Docker stack (the LE cert in
# the caddy_data volume is preserved). This is the only thing the server does.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "==> fetching origin/main"
git fetch --quiet origin main
git reset --hard origin/main
SHA="$(git rev-parse --short HEAD)"

echo "==> building + restarting ($SHA)"
cd deploy
docker compose up -d --build

echo "==> deployed $SHA"
docker compose ps --format '{{.Name}} {{.Status}}'
