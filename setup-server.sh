#!/bin/bash
# Скрипт для настройки сервера и запуска фронтенда

# Загружаем nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Устанавливаем Node.js 20 если еще не установлен
if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo "Устанавливаю Node.js 20..."
    nvm install 20
    nvm alias default 20
fi

# Устанавливаем pnpm если еще не установлен
if ! command -v pnpm &> /dev/null; then
    echo "Устанавливаю pnpm..."
    npm install -g pnpm
fi

# Переходим в директорию фронтенда
cd /root/loginus-new/frontend

# Устанавливаем зависимости если нужно
if [ ! -d node_modules ]; then
    echo "Устанавливаю зависимости..."
    pnpm install
fi

# Создаем .env.production если нужно
if [ ! -f .env.production ]; then
    echo "VITE_API_BASE_URL=/api/v2" > .env.production
    echo "VITE_API_URL=http://localhost:3004" >> .env.production
fi

# Останавливаем старый фронтенд
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Запускаем фронтенд
echo "Запускаю фронтенд..."
pnpm dev

