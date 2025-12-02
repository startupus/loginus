#!/bin/bash
# Скрипт для копирования локальной БД на сервер

set -e

echo "📦 Создание дампа локальной БД..."

# Параметры локальной БД
LOCAL_DB_HOST=${DB_HOST:-localhost}
LOCAL_DB_PORT=${DB_PORT:-5432}
LOCAL_DB_NAME=${DB_DATABASE:-loginus_dev}
LOCAL_DB_USER=${DB_USERNAME:-loginus}
LOCAL_DB_PASS=${DB_PASSWORD:-loginus_secret}

# Имя файла дампа
DUMP_FILE="loginus_db_dump_$(date +%Y%m%d_%H%M%S).sql"

# Создаем дамп
echo "Создаю дамп базы данных $LOCAL_DB_NAME..."
PGPASSWORD=$LOCAL_DB_PASS pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME -F c -f $DUMP_FILE

if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Ошибка: дамп не создан"
    exit 1
fi

echo "✅ Дамп создан: $DUMP_FILE"
echo "📤 Копирую на сервер..."

# Копируем на сервер
scp -i ~/.ssh/id_ed25519 $DUMP_FILE root@45.144.176.42:/tmp/

echo "✅ Дамп скопирован на сервер"
echo ""
echo "📥 Для восстановления на сервере выполните:"
echo "   ssh root@45.144.176.42"
echo "   docker exec -i loginus-db-prod pg_restore -U loginus -d loginus_prod -c < /tmp/$DUMP_FILE"
echo ""
echo "Или используйте скрипт restore-database.sh на сервере"

