#!/bin/bash

set -e

# Скрипт для запуска фронтенда локально на сервере
# Использование: ./scripts/start-frontend.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🎨 Starting frontend locally...${NC}"

cd /root/loginus-new

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Проверка установки зависимостей
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    pnpm install
    cd ..
fi

# Остановка старого процесса если есть
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}🛑 Stopping old frontend process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Создание .env файла для фронтенда если его нет
if [ ! -f frontend/.env.production ]; then
    echo -e "${YELLOW}📝 Creating frontend .env.production...${NC}"
    cat > frontend/.env.production << EOF
VITE_API_BASE_URL=/api/v2
VITE_API_URL=http://localhost:3004
EOF
fi

# Запуск фронтенда
echo -e "${GREEN}🚀 Starting frontend on http://localhost:3000${NC}"
cd frontend
pnpm dev > /tmp/loginus-frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
echo -e "${GREEN}   Access at: http://localhost:3000${NC}"
echo -e "${GREEN}   Logs: /tmp/loginus-frontend.log${NC}"
echo -e "${YELLOW}   To stop: kill $FRONTEND_PID${NC}"

