#!/bin/bash
# Let's Encrypt для stable-доменов (после того как DNS укажет на VPS)
# bash deploy/setup-https-stable.sh [email]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

EMAIL="${1:-admin@${LETTO_STABLE_PRIMARY}}"

apt install -y certbot python3-certbot-nginx

bash "$SCRIPT_DIR/reload-nginx.sh"

certbot certonly --nginx \
  -d "$LETTO_STABLE_PRIMARY" \
  -d "www.${LETTO_STABLE_PRIMARY}" \
  -d "xn----8sbnnmim2aada.xn--p1ai" \
  -d "www.xn----8sbnnmim2aada.xn--p1ai" \
  --non-interactive --agree-tos -m "$EMAIL" \
  || certbot certonly --standalone \
  -d "$LETTO_STABLE_PRIMARY" \
  -d "www.${LETTO_STABLE_PRIMARY}" \
  -d "xn----8sbnnmim2aada.xn--p1ai" \
  -d "www.xn----8sbnnmim2aada.xn--p1ai" \
  --non-interactive --agree-tos -m "$EMAIL"

bash "$SCRIPT_DIR/reload-nginx.sh"
echo "HTTPS stable готов: https://${LETTO_STABLE_PRIMARY}"
