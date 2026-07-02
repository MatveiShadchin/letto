#!/bin/bash
# HTTPS для LETTO через Let's Encrypt (Certbot)
# Запуск на сервере:
#   bash deploy/setup-https.sh letto-flowers.ru
#
# Перед запуском:
# 1. Купите домен
# 2. В DNS добавьте A-записи @ и www → IP сервера (147.45.158.254)
# 3. Подождите 5–30 минут, пока DNS обновится

set -e

DOMAIN="${1:-}"
EMAIL="${2:-admin@${DOMAIN}}"

if [ -z "$DOMAIN" ]; then
  echo "Использование: bash deploy/setup-https.sh ваш-домен.ru [email@example.com]"
  exit 1
fi

echo "==> Проверка DNS для $DOMAIN"
RESOLVED=$(dig +short "$DOMAIN" | tail -n1)
SERVER_IP=$(curl -4 -s ifconfig.me || curl -4 -s icanhazip.com)

echo "Домен указывает на: ${RESOLVED:-не найден}"
echo "IP сервера:         $SERVER_IP"

if [ "$RESOLVED" != "$SERVER_IP" ]; then
  echo ""
  echo "ВНИМАНИЕ: DNS ещё не указывает на этот сервер."
  echo "Certbot может не сработать. Продолжайте только когда A-запись совпадёт."
  read -r -p "Продолжить? (y/N) " answer
  if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    exit 1
  fi
fi

echo "==> Установка Certbot"
apt update
apt install -y certbot python3-certbot-nginx

echo "==> Обновление nginx server_name"
sed -i "s/server_name .*/server_name $DOMAIN www.$DOMAIN;/" /etc/nginx/sites-available/letto
nginx -t
systemctl reload nginx

echo "==> Получение сертификата"
certbot --nginx \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --redirect

echo "==> Автопродление"
systemctl enable certbot.timer 2>/dev/null || true
certbot renew --dry-run

echo ""
echo "Готово. Откройте: https://$DOMAIN"
echo "HTTP автоматически перенаправляется на HTTPS."
