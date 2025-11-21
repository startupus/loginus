#!/bin/bash

# Скрипт для тестирования API переводов v2
# Использование: ./scripts/test-i18n-api.sh

BASE_URL="http://localhost:3001/api/v2/translations"

echo "🧪 Тестирование API переводов v2"
echo "================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки ответа
check_response() {
    local name=$1
    local url=$2
    
    echo -n "Тест: $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        if [ ! -z "$body" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "$body"
    fi
    echo ""
}

# Проверка доступности сервера
echo "Проверка доступности сервера..."
if ! curl -s -f "$BASE_URL/status" > /dev/null 2>&1; then
    echo -e "${RED}Ошибка: Сервер недоступен на $BASE_URL${NC}"
    echo "Убедитесь, что бэкенд запущен: cd backend-mock && npm run start:dev"
    exit 1
fi
echo -e "${GREEN}Сервер доступен${NC}"
echo ""

# Тесты
check_response "Статус системы" "$BASE_URL/status"
check_response "Модуль common (ru)" "$BASE_URL/ru/common"
check_response "Модуль dashboard (ru)" "$BASE_URL/ru/dashboard"
check_response "Версия переводов (ru)" "$BASE_URL/ru/version"
check_response "Несколько модулей" "$BASE_URL/ru?modules=common,dashboard"
check_response "Модуль common (en)" "$BASE_URL/en/common"
check_response "Версия переводов (en)" "$BASE_URL/en/version"

# Тест обработки ошибок
echo -n "Тест: Несуществующий модуль... "
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/ru/nonexistent")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq 500 ] || [ "$http_code" -eq 404 ]; then
    echo -e "${GREEN}✓ OK${NC} (HTTP $http_code - ошибка обработана корректно)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $http_code - ожидалась ошибка)"
fi
echo ""

echo "================================"
echo -e "${GREEN}Тестирование завершено${NC}"

