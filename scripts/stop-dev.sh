#!/bin/bash

# Скрипт для остановки frontend и backend процессов
# Использование: ./scripts/stop-dev.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Остановка сервисов Loginus UI...${NC}"

# Остановка процессов на порту 3000 (frontend)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}   Остановка frontend (порт 3000)...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
else
    echo -e "${YELLOW}   Frontend не запущен${NC}"
fi

# Остановка процессов на порту 3001 (backend)
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}   Остановка backend (порт 3001)...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 1
else
    echo -e "${YELLOW}   Backend не запущен${NC}"
fi

# Остановка процессов на портах 3002, 3003 (если используются)
for port in 3002 3003; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo -e "${YELLOW}   Остановка процесса на порту $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ Сервисы остановлены${NC}"

