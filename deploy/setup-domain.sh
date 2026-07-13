#!/bin/bash
# Настройка домена testletto.ru на сервере LETTO
# Запуск на сервере: bash deploy/setup-domain.sh [domain] [email]
#
# Перед запуском в Timeweb DNS:
#   A  @   → 147.45.158.254
#   A  www → 147.45.158.254

set -euo pipefail

DOMAIN="${1:-testletto.ru}"
EMAIL="${2:-admin@${DOMAIN}}"
APP_DIR="/var/www/letto"
ENV_FILE="${APP_DIR}/.env.local"
SERVER_IP="147.45.158.254"

cd "$APP_DIR"

echo "==> DNS: ${DOMAIN}"
RESOLVED=$(dig +short "$DOMAIN" | tail -n1 || true)
echo "Домен → ${RESOLVED:-не найден}, сервер → ${SERVER_IP}"

echo "==> nginx server_name"
cp deploy/nginx-letto.conf /etc/nginx/sites-available/letto
sed -i "s/server_name .*/server_name ${DOMAIN} www.${DOMAIN} ${SERVER_IP};/" /etc/nginx/sites-available/letto
ln -sf /etc/nginx/sites-available/letto /etc/nginx/sites-enabled/letto
nginx -t
systemctl reload nginx

echo "==> NEXT_PUBLIC_SITE_URL в .env.local"
SITE_URL="https://${DOMAIN}"
if grep -q '^NEXT_PUBLIC_SITE_URL=' "$ENV_FILE" 2>/dev/null; then
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=${SITE_URL}|" "$ENV_FILE"
else
  echo "NEXT_PUBLIC_SITE_URL=${SITE_URL}" >> "$ENV_FILE"
fi

if [ "$RESOLVED" = "$SERVER_IP" ]; then
  echo "==> DNS совпадает — получаем HTTPS (Let's Encrypt)"
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --redirect \
    --non-interactive || echo "Certbot не удался — проверьте DNS и запустите снова"
else
  echo "==> DNS ещё не на ${SERVER_IP}. HTTPS пропущен."
  echo "    Добавьте A-записи в Timeweb и повторите: bash deploy/setup-domain.sh"
fi

echo "==> Пересборка (NEXT_PUBLIC_SITE_URL вшивается при build)"
npm run build
pm2 restart letto

echo ""
echo "Готово."
echo "  Сайт:     https://${DOMAIN} (или http:// пока нет SSL)"
echo "  VK URL:   https://${DOMAIN}/api/webhooks/vk"
echo "  Telegram: https://${DOMAIN}/api/webhooks/telegram"
echo ""
echo "После HTTPS выполните на своём ПК (не с VPS):"
echo "  node deploy/set-telegram-webhook.mjs"
