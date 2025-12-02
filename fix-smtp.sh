#!/bin/bash
# Скрипт для применения SMTP настроек на сервере

cd /root/loginus-new

# Загружаем переменные из .env.production
set -a
source .env.production
set +a

# Перезапускаем API с правильными переменными
docker-compose -f docker-compose.prod.yml stop loginus-api
docker-compose -f docker-compose.prod.yml up -d loginus-api

echo "✅ API перезапущен с SMTP настройками из .env.production"
echo "Проверьте логи: docker logs loginus-api-prod --tail 20 | grep SMTP"

