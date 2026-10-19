#!/bin/bash
# Pulls the latest code, installs dependencies and rebuilds the bot.
# It does not start the bot: /botupdate restarts the running process afterwards
# (under pm2 or systemd), so there is never a second copy of the bot running.
set -euo pipefail

# Go to the root of the Git repository (the folder above this script)
cd "$(dirname "$0")/.."

if [ ! -d ".git" ]; then
	echo "Error: Not a Git repository." >&2
	exit 1
fi

git pull --ff-only
npm ci --no-audit --no-fund
npm run build

echo "Update and build finished."
