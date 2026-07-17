#!/bin/bash
# Ускорение: PostgreSQL + nginx + пересборка
# После загрузки нового кода на сервер:
#   cd /var/www/letto && bash deploy/speed-up-on-server.sh

set -e
cd /var/www/letto

bash deploy/install-postgres-and-migrate.sh

bash deploy/reload-nginx.sh

rm -rf node_modules .next
npm ci
npm run build
pm2 restart letto || pm2 start deploy/ecosystem.config.cjs
pm2 save

echo ""
echo "Готово. Каталог и главная должны открываться быстрее."
echo "Фото пока с Supabase — следующий шаг: Yandex Object Storage."
