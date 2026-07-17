#!/bin/bash
# Обновление ТЕСТОВОГО инстанса (последняя версия с main/HEAD)
# На сервере: bash /root/update-on-server.sh /root/letto-clean.tgz

set -e

ARCHIVE="${1:-/root/letto-clean.tgz}"
APP_DIR="/var/www/letto"
ENV_BACKUP="/root/letto-env-backup"
UPLOADS_BACKUP="/root/letto-uploads-backup"
LETTO_TEST_DOMAIN="testletto.ru"
LETTO_TEST_PORT=3000

if [ ! -f "$ARCHIVE" ]; then
  echo "ОШИБКА: нет архива $ARCHIVE"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "Папки $APP_DIR нет — запустите wipe-and-redeploy.sh"
  exit 1
fi

echo "==> [TEST] Бэкап .env.local и загруженных фото"
if [ -f "$APP_DIR/.env.local" ]; then
  cp "$APP_DIR/.env.local" "$ENV_BACKUP"
fi
mkdir -p "$UPLOADS_BACKUP"
if [ -d "$APP_DIR/public/uploads/products" ]; then
  cp -a "$APP_DIR/public/uploads/products/." "$UPLOADS_BACKUP/" 2>/dev/null || true
fi

echo "==> [TEST] Распаковка новой версии"
rm -rf "$APP_DIR/.next"
tar -xzf "$ARCHIVE" -C "$APP_DIR"

SCRIPT_DIR="$APP_DIR/deploy"
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

if [ -f "$ENV_BACKUP" ]; then
  cp "$ENV_BACKUP" "$APP_DIR/.env.local"
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "$APP_DIR/.env.local"; then
    sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://${LETTO_TEST_DOMAIN}|" "$APP_DIR/.env.local"
  fi
fi

mkdir -p "$APP_DIR/public/uploads/products"
if [ -d "$UPLOADS_BACKUP" ]; then
  cp -a "$UPLOADS_BACKUP/." "$APP_DIR/public/uploads/products/" 2>/dev/null || true
fi

cd "$APP_DIR"

if grep -q '^DATABASE_URL=' .env.local; then
  echo "==> [TEST] Миграции PostgreSQL"
  DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-)"
  for m in database/migrations/*.sql; do
    psql "$DATABASE_URL" -f "$m" || true
  done
fi

echo "==> [TEST] Сборка и перезапуск"
bash "$SCRIPT_DIR/build-app.sh" "$APP_DIR" letto "$LETTO_TEST_PORT"
bash "$SCRIPT_DIR/reload-nginx.sh"

rm -f "$ARCHIVE"
echo "Готово [TEST]: https://${LETTO_TEST_DOMAIN}"
