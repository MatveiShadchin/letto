#!/bin/bash
# Исправление permission denied for table products/inquiries
# Запуск: bash deploy/fix-postgres-permissions.sh

set -e

echo "==> Выдаём права пользователю letto"
sudo -u postgres psql -d letto <<'SQL'
GRANT USAGE ON SCHEMA public TO letto;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO letto;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO letto;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO letto;
ALTER TABLE IF EXISTS products OWNER TO letto;
ALTER TABLE IF EXISTS inquiries OWNER TO letto;
ALTER TABLE IF EXISTS orders OWNER TO letto;
ALTER FUNCTION IF EXISTS set_updated_at() OWNER TO letto;
SQL

echo "Готово. Теперь: npm run build && pm2 restart letto"
