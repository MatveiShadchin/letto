#!/bin/bash
# Пометить текущий коммит как stable (прод для letto-miass.ru)
# После этого: SSH_PASSWORD=... node deploy/remote-update-stable.mjs

set -e
cd "$(dirname "$0")/.."

REF="${1:-HEAD}"
echo "Помечаем stable -> $REF"
git tag -f stable "$REF"
git push -f origin stable
echo ""
echo "Stable тег обновлён. Деплой на прод:"
echo "  SSH_PASSWORD=... node deploy/remote-update-stable.mjs"
