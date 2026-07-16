#!/bin/bash
# Обновление LETTO без полной переустановки
# На сервере: bash /root/update-on-server.sh /root/letto-clean.tgz

set -e

ARCHIVE="${1:-/root/letto-clean.tgz}"
APP_DIR="/var/www/letto"
ENV_BACKUP="/root/letto-env-backup"
UPLOADS_BACKUP="/root/letto-uploads-backup"

if [ ! -f "$ARCHIVE" ]; then
  echo "ОШИБКА: нет архива $ARCHIVE"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "Папки $APP_DIR нет — запустите wipe-and-redeploy.sh"
  exit 1
fi

echo "==> Бэкап .env.local и загруженных фото"
if [ -f "$APP_DIR/.env.local" ]; then
  cp "$APP_DIR/.env.local" "$ENV_BACKUP"
fi
mkdir -p "$UPLOADS_BACKUP"
if [ -d "$APP_DIR/public/uploads/products" ]; then
  cp -a "$APP_DIR/public/uploads/products/." "$UPLOADS_BACKUP/" 2>/dev/null || true
fi

echo "==> Распаковка новой версии"
rm -rf "$APP_DIR/.next"
tar -xzf "$ARCHIVE" -C "$APP_DIR"

if [ -f "$ENV_BACKUP" ]; then
  cp "$ENV_BACKUP" "$APP_DIR/.env.local"
fi

mkdir -p "$APP_DIR/public/uploads/products"
if [ -d "$UPLOADS_BACKUP" ]; then
  cp -a "$UPLOADS_BACKUP/." "$APP_DIR/public/uploads/products/" 2>/dev/null || true
fi

cd "$APP_DIR"

if grep -q '^DATABASE_URL=' .env.local; then
  echo "==> Миграции PostgreSQL"
  DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-)"
  psql "$DATABASE_URL" -f database/migrations/001_reviews_pickup_popularity.sql || true
  psql "$DATABASE_URL" -f database/migrations/002_order_recipient_fields.sql || true
  psql "$DATABASE_URL" -f database/migrations/003_messaging_notifications.sql || true
  psql "$DATABASE_URL" -f database/migrations/004_messenger_contact_label.sql || true
  psql "$DATABASE_URL" -f database/migrations/005_telegram_sync_state.sql || true
  psql "$DATABASE_URL" -f database/migrations/006_telegram_support_relay.sql || true
  psql "$DATABASE_URL" -f database/migrations/007_order_delivery_date.sql || true
  psql "$DATABASE_URL" -f database/migrations/008_catalog_categories.sql || true
fi

echo "==> Сборка и перезапуск"
bash deploy/start-on-server.sh

rm -f "$ARCHIVE"
echo "Готово: http://147.45.158.254"
