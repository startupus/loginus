#!/bin/bash
# Скрипт для восстановления БД на сервере

set -e

DUMP_FILE=${1:-/tmp/loginus_db_dump_*.sql}

if [ ! -f $DUMP_FILE ]; then
    echo "❌ Файл дампа не найден: $DUMP_FILE"
    echo "Использование: $0 <путь_к_дампу>"
    exit 1
fi

echo "🛑 Останавливаю API для безопасности..."
docker-compose -f /root/loginus-new/docker-compose.prod.yml stop loginus-api-prod || true

echo "📥 Восстанавливаю базу данных..."

# Получаем пароль из .env.production
DB_PASSWORD=$(grep DB_PASSWORD /root/loginus-new/.env.production | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Восстанавливаем дамп
docker exec -i loginus-db-prod pg_restore -U loginus -d loginus_prod -c --if-exists < $DUMP_FILE || \
docker exec -i loginus-db-prod psql -U loginus -d loginus_prod < $DUMP_FILE

echo "✅ База данных восстановлена"

echo "🚀 Запускаю API..."
docker-compose -f /root/loginus-new/docker-compose.prod.yml start loginus-api-prod

echo "✅ Готово! База данных восстановлена и API перезапущен"

