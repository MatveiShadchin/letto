#!/bin/bash
# PostgreSQL на том же VPS + миграция из Supabase
# Запуск: bash deploy/install-postgres-and-migrate.sh

set -e
cd /var/www/letto

DB_PASS="${LETTO_DB_PASSWORD:-letto$(openssl rand -hex 4)}"

echo "==> Установка PostgreSQL"
apt update
apt install -y postgresql

echo "==> База letto"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='letto'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER letto WITH PASSWORD '$DB_PASS';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='letto'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE letto OWNER letto;"

sudo -u postgres psql -d letto -f database/schema.sql
bash deploy/fix-postgres-permissions.sh

DATABASE_URL="postgresql://letto:${DB_PASS}@127.0.0.1:5432/letto"

if grep -q '^DATABASE_URL=' .env.local 2>/dev/null; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env.local
else
  echo "DATABASE_URL=$DATABASE_URL" >> .env.local
fi

export DATABASE_URL

echo "==> Миграция данных из Supabase"
node scripts/migrate-from-supabase.mjs

echo ""
echo "DATABASE_URL добавлен в .env.local"
echo "Дальше: npm run build && pm2 restart letto"
