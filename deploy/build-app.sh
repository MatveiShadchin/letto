#!/bin/bash
# Сборка одного инстанса LETTO
# Использование: bash deploy/build-app.sh /var/www/letto letto 3000

set -e

APP_DIR="${1:-/var/www/letto}"
PM2_NAME="${2:-letto}"
PORT="${3:-3000}"

if [ ! -f "$APP_DIR/.env.local" ]; then
  echo "ОШИБКА: нет $APP_DIR/.env.local"
  exit 1
fi

echo "==> Сборка $PM2_NAME ($APP_DIR, порт $PORT)"
cd "$APP_DIR"

rm -rf node_modules .next
npm ci
npm run build

pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start "$APP_DIR/deploy/ecosystem.config.cjs" --only "$PM2_NAME"
pm2 save

echo "Готово: $PM2_NAME на порту $PORT"
