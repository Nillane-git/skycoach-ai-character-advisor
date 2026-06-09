#!/usr/bin/env bash
# ONE-COMMAND deploy.
#   ./ship.sh "commit message"
#
# Does: commit -> push a deploy branch -> open & merge a PR into main ->
#       server pulls main & rebuilds/restarts Docker -> health-check the live URL.
# You see the result on `main` immediately; no dev branch.
#
# Prerequisites (see deploy.md):
#   - clean working tree on `main`
#   - `gh` CLI authenticated (GH_TOKEN or `gh auth login`) with repo access
#   - SSH access to the server (key configured for $SKYCOACH_SERVER)
set -euo pipefail

MSG="${1:?usage: ./ship.sh \"commit message\"}"
SERVER="${SKYCOACH_SERVER:-root@109.248.11.136}"
URL="${SKYCOACH_URL:-https://821723.cloud4box.ru/}"
BR="deploy/$(date +%Y%m%d-%H%M%S)"

echo "==> 1/4 commit on $BR"
git checkout -b "$BR"
git add -A
git commit -m "$MSG"
git push -u origin "$BR"

echo "==> 2/4 PR -> merge into main"
gh pr create --base main --head "$BR" --title "$MSG" --body "Automated deploy via ship.sh." >/dev/null
gh pr merge "$BR" --merge --delete-branch
git checkout main
git pull --ff-only

echo "==> 3/4 deploy on $SERVER (git pull + docker rebuild/restart)"
ssh "$SERVER" 'bash /opt/skycoach-advisor/deploy/server-deploy.sh'

echo "==> 4/4 health check"
curl -fsS --retry 10 --retry-delay 3 --retry-all-errors -o /dev/null -w "LIVE %{http_code}\n" "$URL"
echo "==> done — main updated and live at $URL"
