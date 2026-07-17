#!/bin/bash
# Запуск LETTO на VPS после первой загрузки (тест + при необходимости stable)
# cd /var/www/letto && bash deploy/start-on-server.sh

set -e
cd /var/www/letto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f .env.local ]; then
  echo "ОШИБКА: нет /var/www/letto/.env.local"
  exit 1
fi

if ! grep -q '^DATABASE_URL=' .env.local; then
  echo "==> DATABASE_URL не найден — PostgreSQL"
  bash deploy/install-postgres-and-migrate.sh
fi

bash "$SCRIPT_DIR/build-app.sh" /var/www/letto letto 3000

if [ -d /var/www/letto-stable ] && [ -f /var/www/letto-stable/.env.local ]; then
  bash "$SCRIPT_DIR/build-app.sh" /var/www/letto-stable letto-stable 3001
fi

bash "$SCRIPT_DIR/reload-nginx.sh"
pm2 save
pm2 status

echo ""
echo "Тест:  https://testletto.ru"
echo "Stable: https://letto-miass.ru (после DNS + certbot)"
