#!/bin/bash

set -e

echo "🚀 Starting deployment script..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Переходим в директорию проекта
cd /root/loginus-new

# Проверяем наличие .env файла
if [ ! -f .env.production ]; then
  echo -e "${YELLOW}⚠️  .env.production not found, creating from template...${NC}"
  if [ -f backend/env.example ]; then
    cp backend/env.example .env.production
    echo -e "${YELLOW}⚠️  Please update .env.production with production values!${NC}"
  fi
fi

# Загружаем переменные окружения
if [ -f .env.production ]; then
  set -a
  source .env.production
  set +a
fi

# Останавливаем старые контейнеры (только backend и database)
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Собираем образы
echo -e "${GREEN}🔨 Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build

# Запускаем контейнеры (backend и database)
echo -e "${GREEN}🚀 Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Ждем запуска базы данных
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Запускаем миграции (если есть)
echo -e "${GREEN}📦 Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T loginus-api-prod node dist/main.js || true
# Ждем немного перед миграциями
sleep 3
# Миграции запускаются автоматически при старте приложения, но можно запустить вручную если нужно

# Обновляем фронтенд (Vite dev server)
echo -e "${GREEN}🔄 Updating frontend...${NC}"
cd frontend
if [ -d node_modules ]; then
  echo -e "${YELLOW}📦 Installing/updating frontend dependencies...${NC}"
  npm install || pnpm install || yarn install
else
  echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
  npm install || pnpm install || yarn install
fi

# Перезапускаем Vite dev server
echo -e "${GREEN}🚀 Restarting Vite dev server...${NC}"
pkill -f vite || true
sleep 2
nohup npm run dev > /tmp/vite.log 2>&1 &
echo -e "${GREEN}   Vite dev server started in background (logs: /tmp/vite.log)${NC}"

cd ..

# Проверяем статус контейнеров
echo -e "${GREEN}📊 Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}   Backend API: http://localhost:3004${NC}"
echo -e "${GREEN}   Frontend Vite: http://localhost:5173${NC}"

