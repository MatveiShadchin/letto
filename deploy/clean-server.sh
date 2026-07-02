#!/bin/bash
# Удаляет мусор с VPS (Windows node_modules, dev-сборка, архивы)
# Запуск: cd /var/www/letto && bash deploy/clean-server.sh

set -e
cd /var/www/letto

echo "==> Остановка приложения"
pm2 delete letto 2>/dev/null || true

echo "==> Размер ДО очистки"
du -sh /var/www/letto 2>/dev/null || true

echo "==> Удаление тяжёлого и лишнего"
rm -rf node_modules .next
rm -f *.rar *.zip *.tar *.tar.gz *.tgz 2>/dev/null || true
find . -name '*.hot-update.*' -delete 2>/dev/null || true
find . -name 'next-swc.win32-*' -delete 2>/dev/null || true
find . -name '.DS_Store' -delete 2>/dev/null || true

# Случайные вложенные копии после кривого scp
if [ -d "LETTO" ]; then
  echo "==> Найдена вложенная папка LETTO — удаляю"
  rm -rf LETTO
fi

echo "==> Размер ПОСЛЕ очистки"
du -sh /var/www/letto

echo ""
echo "Мусор удалён. Дальше:"
echo "  npm ci && npm run build"
echo "  bash deploy/start-on-server.sh"
