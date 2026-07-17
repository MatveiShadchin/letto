#!/bin/bash
# Обновление STABLE-инстанса (тег stable — прод для letto-miass.ru)
# На сервере: bash /root/update-on-server-stable.sh /root/letto-stable.tgz

set -e

ARCHIVE="${1:-/root/letto-stable.tgz}"
APP_DIR="/var/www/letto-stable"
TEST_DIR="/var/www/letto"
ENV_BACKUP="/root/letto-stable-env-backup"
UPLOADS_BACKUP="/root/letto-stable-uploads-backup"
LETTO_STABLE_PRIMARY="letto-miass.ru"
LETTO_STABLE_PORT=3001

if [ ! -f "$ARCHIVE" ]; then
  echo "ОШИБКА: нет архива $ARCHIVE"
  exit 1
fi

if [ ! -d "$APP_DIR" ]; then
  echo "==> Первый запуск stable"
  mkdir -p "$APP_DIR"
  if [ ! -f "$ENV_BACKUP" ] && [ -f "$TEST_DIR/.env.local" ]; then
    cp "$TEST_DIR/.env.local" "$ENV_BACKUP"
    sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://${LETTO_STABLE_PRIMARY}|" "$ENV_BACKUP" || true
    echo "NEXT_PUBLIC_SITE_URL=https://${LETTO_STABLE_PRIMARY}" >> "$ENV_BACKUP"
  fi
fi

echo "==> [STABLE] Бэкап .env.local и фото"
if [ -f "$APP_DIR/.env.local" ]; then
  cp "$APP_DIR/.env.local" "$ENV_BACKUP"
fi
mkdir -p "$UPLOADS_BACKUP"
if [ -d "$APP_DIR/public/uploads/products" ]; then
  cp -a "$APP_DIR/public/uploads/products/." "$UPLOADS_BACKUP/" 2>/dev/null || true
fi

echo "==> [STABLE] Распаковка"
rm -rf "$APP_DIR/.next"
tar -xzf "$ARCHIVE" -C "$APP_DIR"

SCRIPT_DIR="$APP_DIR/deploy"
mkdir -p "$SCRIPT_DIR"
# Инфраструктурные скрипты с /root (могут быть новее, чем в теге stable)
for f in domains.sh build-app.sh reload-nginx.sh nginx-test-https.conf.template nginx-stable-https.conf.template; do
  [ -f "/root/$f" ] && cp -f "/root/$f" "$SCRIPT_DIR/$f"
done
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

if [ -f "$ENV_BACKUP" ]; then
  cp "$ENV_BACKUP" "$APP_DIR/.env.local"
elif [ -f "/root/letto-env-backup" ]; then
  cp "/root/letto-env-backup" "$APP_DIR/.env.local"
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://${LETTO_STABLE_PRIMARY}|" "$APP_DIR/.env.local"
  cp "$APP_DIR/.env.local" "$ENV_BACKUP"
fi

mkdir -p "$APP_DIR/public/uploads/products"
if [ -d "$UPLOADS_BACKUP" ]; then
  cp -a "$UPLOADS_BACKUP/." "$APP_DIR/public/uploads/products/" 2>/dev/null || true
fi
if [ -d "$TEST_DIR/public/uploads/products" ]; then
  cp -an "$TEST_DIR/public/uploads/products/." "$APP_DIR/public/uploads/products/" 2>/dev/null || true
fi

cd "$APP_DIR"

if grep -q '^DATABASE_URL=' .env.local; then
  echo "==> [STABLE] Миграции PostgreSQL"
  DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2-)"
  for m in database/migrations/*.sql; do
    psql "$DATABASE_URL" -f "$m" || true
  done
fi

echo "==> [STABLE] Сборка и перезапуск"
bash "$SCRIPT_DIR/build-app.sh" "$APP_DIR" letto-stable "$LETTO_STABLE_PORT"
bash "$SCRIPT_DIR/reload-nginx.sh"

rm -f "$ARCHIVE"
echo "Готово [STABLE]: https://${LETTO_STABLE_PRIMARY}"
