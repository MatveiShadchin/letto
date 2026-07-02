#!/bin/bash
# Загрузить товары из Supabase в локальный PostgreSQL
set -e
cd /var/www/letto

bash deploy/fix-postgres-permissions.sh

echo "==> Миграция из Supabase"
node scripts/migrate-from-supabase.mjs

echo "==> Проверка"
sudo -u postgres psql -d letto -c "SELECT COUNT(*) AS products FROM products;"

echo "==> Пересборка (каталог кэшируется при build)"
npm run build
pm2 restart letto

echo ""
echo "Готово. Обновите http://147.45.158.254/catalog"
