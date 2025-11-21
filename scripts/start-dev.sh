#!/bin/bash

# Скрипт для запуска frontend и backend в режиме разработки
# Использование: ./scripts/start-dev.sh

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск Loginus UI в режиме разработки${NC}"

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm не установлен. Установите его: npm install -g pnpm${NC}"
    exit 1
fi

# Проверка установки зависимостей
if [ ! -d "node_modules" ] || [ ! -d "backend-mock/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
    pnpm install
fi

# Функция для остановки процессов на портах
cleanup_ports() {
    echo -e "${YELLOW}🧹 Очистка портов 3000 и 3001...${NC}"
    
    # Остановка процессов на порту 3000 (frontend)
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "${YELLOW}   Остановка процесса на порту 3000...${NC}"
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    # Остановка процессов на порту 3001 (backend)
    if lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "${YELLOW}   Остановка процесса на порту 3001...${NC}"
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi
    
    sleep 1
}

# Очистка портов перед запуском
cleanup_ports

# Функция для обработки сигнала завершения
cleanup() {
    echo -e "\n${YELLOW}🛑 Остановка сервисов...${NC}"
    cleanup_ports
    exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Запуск backend в фоне
echo -e "${GREEN}🔧 Запуск backend на http://localhost:3001${NC}"
cd backend-mock
pnpm start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ожидание запуска backend
sleep 3

# Проверка, что backend запустился
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Ошибка запуска backend. Проверьте logs/backend.log${NC}"
    exit 1
fi

# Запуск frontend
echo -e "${GREEN}🎨 Запуск frontend на http://localhost:3000${NC}"
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

# Ожидание запуска frontend
sleep 3

# Проверка, что frontend запустился
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Ошибка запуска frontend${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✅ Сервисы запущены!${NC}"
echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}   Backend:  http://localhost:3001/api/v2${NC}"
echo -e "${YELLOW}   Нажмите Ctrl+C для остановки${NC}"

# Создание директории для логов, если её нет
mkdir -p logs

# Ожидание завершения процессов
echo -e "${GREEN}📊 Мониторинг процессов...${NC}"
echo -e "${YELLOW}   Backend PID: $BACKEND_PID${NC}"
echo -e "${YELLOW}   Frontend PID: $FRONTEND_PID${NC}"

# Функция для проверки процессов
check_processes() {
    local backend_running=true
    local frontend_running=true
    
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        backend_running=false
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        frontend_running=false
    fi
    
    if [ "$backend_running" = false ] && [ "$frontend_running" = false ]; then
        return 1
    fi
    
    if [ "$backend_running" = false ]; then
        echo -e "${RED}❌ Backend процесс завершился${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
    
    if [ "$frontend_running" = false ]; then
        echo -e "${RED}❌ Frontend процесс завершился${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        return 1
    fi
    
    return 0
}

# Ожидание завершения
while check_processes; do
    sleep 2
done

cleanup

