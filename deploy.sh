#!/bin/bash
set -e
cd /var/www/bolajoon

echo "=== git pull ==="
git pull origin main

echo "=== npm install ==="
npm install --production --silent

echo "=== lead-bot npm install ==="
cd lead-bot && npm install --production --silent && cd ..

echo "=== build ==="
npm run build

echo "=== logs papka ==="
mkdir -p logs

echo "=== pm2 restart ==="
pm2 startOrReload ecosystem.config.cjs --env production --update-env

echo "=== pm2 save ==="
pm2 save

echo "✅ Deploy tayyor! $(date '+%Y-%m-%d %H:%M:%S')"
