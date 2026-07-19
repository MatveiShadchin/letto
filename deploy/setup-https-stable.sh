#!/bin/bash
# Let's Encrypt для stable-доменов (после того как DNS укажет на VPS)
# bash deploy/setup-https-stable.sh [email]
#
# Домены: letto-miass.ru, www, летто-миасс.рф (punycode), www

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

EMAIL="${1:-admin@${LETTO_STABLE_PRIMARY}}"
PUNYCODE="xn----8sbnnmim2aada.xn--p1ai"

echo "==> HTTPS stable: ${LETTO_STABLE_PRIMARY} + ${PUNYCODE}"
echo "==> Email: ${EMAIL}"

apt-get update -qq
apt-get install -y certbot python3-certbot-nginx

# HTTP-конфиг без редиректа на HTTPS (пока нет сертификата) — для ACME
bash "$SCRIPT_DIR/reload-nginx.sh"

CERT_DIR="/etc/letsencrypt/live/${LETTO_STABLE_PRIMARY}"

issue_cert() {
  local method="$1"
  shift
  echo "==> certbot (${method})..."
  if [ "$method" = "nginx" ]; then
    certbot certonly --nginx \
      -d "$LETTO_STABLE_PRIMARY" \
      -d "www.${LETTO_STABLE_PRIMARY}" \
      -d "$PUNYCODE" \
      -d "www.${PUNYCODE}" \
      --non-interactive --agree-tos -m "$EMAIL" \
      --cert-name "$LETTO_STABLE_PRIMARY" \
      "$@"
  else
    # standalone: временно освобождаем :80
    systemctl stop nginx
    certbot certonly --standalone \
      -d "$LETTO_STABLE_PRIMARY" \
      -d "www.${LETTO_STABLE_PRIMARY}" \
      -d "$PUNYCODE" \
      -d "www.${PUNYCODE}" \
      --non-interactive --agree-tos -m "$EMAIL" \
      --cert-name "$LETTO_STABLE_PRIMARY" \
      "$@"
    systemctl start nginx
  fi
}

if [ -f "${CERT_DIR}/fullchain.pem" ]; then
  echo "==> Сертификат уже есть — обновляем (expand при необходимости)"
  issue_cert nginx --expand || issue_cert standalone --expand || {
    echo "WARN: expand не удался, оставляем существующий сертификат"
  }
else
  issue_cert nginx || issue_cert standalone
fi

if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
  echo "ERROR: сертификат не найден в ${CERT_DIR}"
  exit 1
fi

bash "$SCRIPT_DIR/reload-nginx.sh"

echo ""
echo "HTTPS stable готов:"
echo "  https://${LETTO_STABLE_PRIMARY}"
echo "  https://www.${LETTO_STABLE_PRIMARY}"
echo "  https://${PUNYCODE}  (летто-миасс.рф)"
ls -la "${CERT_DIR}/"
openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -subject -dates -ext subjectAltName 2>/dev/null || true
