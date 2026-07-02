#!/bin/bash
# Запуск LETTO на VPS после загрузки файлов
# На сервере: cd /var/www/letto && bash deploy/start-on-server.sh

set -e
cd /var/www/letto

echo "==> Проверка .env.local"
if [ ! -f .env.local ]; then
  echo "ОШИБКА: нет /var/www/letto/.env.local"
  exit 1
fi

if ! grep -q '^DATABASE_URL=' .env.local; then
  echo "==> DATABASE_URL не найден — ставим PostgreSQL и мигрируем данные"
  bash deploy/install-postgres-and-migrate.sh
fi

echo "==> Удаление Windows node_modules и dev-сборки"
rm -rf node_modules .next

echo "==> Установка зависимостей (Linux)"
npm ci

echo "==> Сборка"
npm run build

echo "==> Nginx → прокси на порт 3000"
cp deploy/nginx-letto.conf /etc/nginx/sites-available/letto
ln -sf /etc/nginx/sites-available/letto /etc/nginx/sites-enabled/letto
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> PM2"
pm2 delete letto 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save

echo ""
echo "Готово. Откройте: http://147.45.158.254"
pm2 status
