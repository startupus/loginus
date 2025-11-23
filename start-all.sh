#!/bin/bash

# Скрипт для одновременного запуска frontend и backend-mock

echo "🚀 Запуск Loginus UI..."

# Проверяем, запущены ли процессы
FRONTEND_PID=$(lsof -ti:3000)
BACKEND_PID=$(lsof -ti:3001)

# Останавливаем старые процессы
if [ ! -z "$FRONTEND_PID" ]; then
  echo "⚠️  Останавливаем frontend (PID: $FRONTEND_PID)..."
  kill $FRONTEND_PID
fi

if [ ! -z "$BACKEND_PID" ]; then
  echo "⚠️  Останавливаем backend (PID: $BACKEND_PID)..."
  kill $BACKEND_PID
fi

sleep 2

# Запускаем backend-mock
echo "🔧 Запуск backend-mock (порт 3001)..."
cd backend-mock
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ждем запуска backend
echo "⏳ Ожидание запуска backend..."
sleep 5

# Запускаем frontend
echo "🎨 Запуск frontend (порт 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Сервисы запущены!"
echo "📦 Backend PID: $BACKEND_PID (http://localhost:3001)"
echo "🎨 Frontend PID: $FRONTEND_PID (http://localhost:3000)"
echo ""
echo "📄 Логи:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Остановка: ./stop-dev.sh"

