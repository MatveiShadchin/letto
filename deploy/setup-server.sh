#!/bin/bash
# Первичная настройка VPS (Ubuntu 24.04) для LETTO
# Запуск на сервере: bash setup-server.sh

set -e

echo "==> Обновление системы"
apt update && apt upgrade -y

echo "==> Установка пакетов"
apt install -y curl git nginx ufw

echo "==> Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "==> PM2"
npm install -g pm2

echo "==> Swap 1GB (для сборки на слабом VPS)"
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Папка проекта"
mkdir -p /var/www/letto
chown -R "$USER:$USER" /var/www/letto

echo ""
echo "Готово. Дальше:"
echo "1) Загрузите проект в /var/www/letto"
echo "2) Создайте /var/www/letto/.env.local"
echo "3) cd /var/www/letto && npm ci && npm run build"
echo "4) pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup"
