#!/bin/bash
# Собирает /etc/nginx/sites-available/letto из шаблонов (тест + stable)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=domains.sh
source "$SCRIPT_DIR/domains.sh"

OUT="/etc/nginx/sites-available/letto"
TEST_CERT="/etc/letsencrypt/live/${LETTO_TEST_DOMAIN}/fullchain.pem"
STABLE_CERT="/etc/letsencrypt/live/${LETTO_STABLE_PRIMARY}/fullchain.pem"

{
  cat <<EOF
# HTTP test
server {
    listen 80;
    server_name ${LETTO_TEST_DOMAINS};
    return 301 https://${LETTO_TEST_DOMAIN}\$request_uri;
}

# HTTP stable
server {
    listen 80;
    server_name ${LETTO_STABLE_DOMAINS};
EOF

  if [ -f "$STABLE_CERT" ]; then
    echo "    return 301 https://${LETTO_STABLE_PRIMARY}\$request_uri;"
  else
    cat <<'EOF'
    client_max_body_size 10M;
    location /uploads/ {
        alias /var/www/letto-stable/public/uploads/;
        access_log off;
    }
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
EOF
  fi

  echo "}"

  if [ -f "$TEST_CERT" ]; then
    sed "s|__TEST_DOMAIN__|${LETTO_TEST_DOMAIN}|g" "$SCRIPT_DIR/nginx-test-https.conf.template"
  else
    echo "# WARN: нет SSL для ${LETTO_TEST_DOMAIN}"
  fi

  if [ -f "$STABLE_CERT" ]; then
    sed \
      -e "s|__STABLE_PRIMARY__|${LETTO_STABLE_PRIMARY}|g" \
      -e "s|__STABLE_PUNYCODE__|xn----8sbnnmim2aada.xn--p1ai|g" \
      "$SCRIPT_DIR/nginx-stable-https.conf.template"
  else
    echo "# WARN: stable HTTPS выключен — сначала DNS, затем bash deploy/setup-https-stable.sh"
  fi
} > "$OUT"

ln -sf /etc/nginx/sites-available/letto /etc/nginx/sites-enabled/letto
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
echo "Nginx: testletto.ru -> :3000; stable -> :3001"
