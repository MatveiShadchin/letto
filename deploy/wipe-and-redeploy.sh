#!/bin/bash
# Полная зачистка /var/www/letto и развёртывание из letto-clean.tgz
# На сервере после scp архива:
#   bash /root/wipe-and-redeploy.sh

set -e

ARCHIVE="${1:-/root/letto-clean.tgz}"
ENV_BACKUP="/root/letto-env-backup"

if [ ! -f "$ARCHIVE" ]; then
  echo "ОШИБКА: нет архива $ARCHIVE"
  echo "Сначала с Windows: scp letto-clean.tgz root@147.45.158.254:/root/"
  exit 1
fi

echo "==> Бэкап .env.local"
if [ -f /var/www/letto/.env.local ]; then
  cp /var/www/letto/.env.local "$ENV_BACKUP"
  echo "Сохранён: $ENV_BACKUP"
fi

echo "==> Остановка PM2"
pm2 delete letto 2>/dev/null || true

echo "==> Полная очистка /var/www/letto"
rm -rf /var/www/letto
mkdir -p /var/www/letto

echo "==> Распаковка чистых исходников"
tar -xzf "$ARCHIVE" -C /var/www/letto

if [ -f "$ENV_BACKUP" ]; then
  cp "$ENV_BACKUP" /var/www/letto/.env.local
fi

if [ ! -f /var/www/letto/.env.local ]; then
  echo "ОШИБКА: нет .env.local — загрузите с компьютера:"
  echo '  scp "C:\Users\shadc\OneDrive\Desktop\LETTO\.env.local" root@147.45.158.254:/root/letto-env-backup'
  exit 1
fi

echo "==> PostgreSQL (если ещё не настроен)"
cd /var/www/letto
if ! grep -q '^DATABASE_URL=' .env.local; then
  bash deploy/install-postgres-and-migrate.sh
else
  echo "DATABASE_URL уже есть — пропускаем установку PostgreSQL"
fi

echo "==> Сборка и запуск"
bash deploy/start-on-server.sh

echo "==> Можно удалить архив"
rm -f "$ARCHIVE"
