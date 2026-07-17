#!/bin/bash
# Первичная настройка stable-инстанса на сервере (один раз)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

TEST_DIR="$LETTO_TEST_APP_DIR"
STABLE_DIR="$LETTO_STABLE_APP_DIR"
STABLE_ENV="/root/letto-stable-env-backup"

if [ ! -d "$TEST_DIR" ]; then
  echo "ОШИБКА: нет тестового инстанса $TEST_DIR"
  exit 1
fi

echo "==> Каталог stable: $STABLE_DIR"
mkdir -p "$STABLE_DIR"

if [ ! -f "$STABLE_ENV" ] && [ -f "$TEST_DIR/.env.local" ]; then
  echo "==> .env.local для stable (копия с test, SITE_URL -> https://${LETTO_STABLE_PRIMARY})"
  cp "$TEST_DIR/.env.local" "$STABLE_ENV"
  if grep -q '^NEXT_PUBLIC_SITE_URL=' "$STABLE_ENV"; then
    sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://${LETTO_STABLE_PRIMARY}|" "$STABLE_ENV"
  else
    echo "NEXT_PUBLIC_SITE_URL=https://${LETTO_STABLE_PRIMARY}" >> "$STABLE_ENV"
  fi
fi

echo "Готово. Дальше: bash deploy/update-on-server-stable.sh /root/letto-stable.tgz"
