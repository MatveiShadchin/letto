# Домены LETTO (source: deploy/domains.sh)

# Тест / canary — всегда последняя версия с main
export LETTO_TEST_DOMAIN="testletto.ru"
export LETTO_TEST_DOMAINS="testletto.ru www.testletto.ru 147.45.158.254"

# Прод / stable — только проверенные релизы (тег stable)
export LETTO_STABLE_PRIMARY="letto-miass.ru"
export LETTO_STABLE_DOMAINS="letto-miass.ru www.letto-miass.ru xn----8sbnnmim2aada.xn--p1ai www.xn----8sbnnmim2aada.xn--p1ai"

export LETTO_TEST_APP_DIR="/var/www/letto"
export LETTO_STABLE_APP_DIR="/var/www/letto-stable"
export LETTO_TEST_PORT=3000
export LETTO_STABLE_PORT=3001
