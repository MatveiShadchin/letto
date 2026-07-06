#!/bin/bash
set -euo pipefail
ENV_FILE=/var/www/letto/.env.local
TOKEN="$1"
grep -v -E '^GITHUB_TELEGRAM_' "$ENV_FILE" > /tmp/letto-env.tmp
mv /tmp/letto-env.tmp "$ENV_FILE"
{
  echo "GITHUB_TELEGRAM_RELAY_TOKEN=$TOKEN"
  echo "GITHUB_TELEGRAM_RELAY_REPO=MatveiShadchin/letto"
} >> "$ENV_FILE"
pm2 restart letto
sleep 2
RELAY_TOKEN=$(grep '^GITHUB_TELEGRAM_RELAY_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
HTTP_CODE=$(curl -sS -o /tmp/gh-relay.out -w '%{http_code}' -X POST \
  -H "Authorization: Bearer $RELAY_TOKEN" \
  -H 'Accept: application/vnd.github+json' \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  https://api.github.com/repos/MatveiShadchin/letto/dispatches \
  -d '{"event_type":"telegram_notify","client_payload":{"token":"8929146738:AAFjXJmgMEdU6ci9j4sYpi99U3FcI0IbR38","messages":[{"chat_id":"8630530451","text":"Relay test from VPS after token fix"}]}}')
echo "dispatch HTTP $HTTP_CODE"
cat /tmp/gh-relay.out
