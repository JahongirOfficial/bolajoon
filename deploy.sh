#!/bin/bash
set -e
cd /var/www/bolajoon
echo "=== git pull ==="
git pull origin main
echo "=== npm install ==="
npm install --production --silent
echo "=== build ==="
npm run build
echo "=== pm2 restart ==="
pm2 restart bolajoon --update-env
echo "✅ Deploy tayyor! Sat Mar  7 16:28:21 WAST 2026"
