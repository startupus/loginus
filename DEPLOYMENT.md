# 🚀 Инструкция по деплою Loginus

## Настройка GitHub Secrets

**📖 Подробная инструкция:** См. [SETUP_SSH.md](./SETUP_SSH.md)

Для работы CI/CD необходимо добавить секрет `SSH_PRIVATE_KEY` в GitHub:

1. Перейдите в Settings → Secrets and variables → Actions
2. Добавьте новый секрет `SSH_PRIVATE_KEY` со значением приватного SSH ключа

Для Windows:
```powershell
Get-Content C:\Users\teramisuslik\.ssh\id_ed25519
```

Скопируйте весь вывод и добавьте как секрет в GitHub.

## Первоначальная настройка на сервере

1. Подключитесь к серверу:
```bash
ssh root@45.144.176.42
```

2. Создайте директорию для проекта:
```bash
mkdir -p /root/loginus-new
cd /root/loginus-new
```

3. Клонируйте репозиторий:
```bash
git clone https://github.com/teramisuslik/loginus-v2.git .
```

4. Создайте файл `.env.production`:
```bash
cp .env.production.example .env.production
nano .env.production
```

Обязательно обновите:
- `DB_PASSWORD` - надежный пароль для базы данных
- `JWT_SECRET` - случайная строка минимум 32 символа
- `JWT_REFRESH_SECRET` - другая случайная строка минимум 32 символа
- `SMTP_*` - настройки почты

5. Создайте файл `.env.production` для фронтенда:
```bash
cd frontend
cat > .env.production << EOF
VITE_API_BASE_URL=/api/v2
VITE_API_URL=http://localhost:3004
EOF
cd ..
```

6. Установите pnpm (если не установлен):
```bash
npm install -g pnpm
```

7. Установите зависимости фронтенда:
```bash
cd frontend
pnpm install
cd ..
```

## Автоматический деплой

После настройки, каждый push в ветку `main` автоматически запустит деплой:

1. GitHub Actions склонирует репозиторий на сервер
2. Остановит старые контейнеры
3. Соберет новые Docker образы
4. Запустит контейнеры
5. Применит миграции базы данных

## Ручной деплой

Если нужно запустить деплой вручную:

```bash
ssh root@45.144.176.42
cd /root/loginus-new
git pull origin main
./scripts/deploy.sh
```

## Запуск фронтенда

Фронтенд запускается локально на сервере (не в Docker):

```bash
ssh root@45.144.176.42
cd /root/loginus-new
./scripts/start-frontend.sh
```

Фронтенд будет доступен на `http://localhost:3000` (или через nginx на домене)

## Настройка Nginx (опционально)

Если нужно настроить nginx для проксирования:

```nginx
server {
    listen 80;
    server_name loginus.startapus.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Мониторинг

Проверка статуса контейнеров:
```bash
docker-compose -f docker-compose.prod.yml ps
```

Просмотр логов:
```bash
docker-compose -f docker-compose.prod.yml logs -f loginus-api-prod
```

Логи фронтенда:
```bash
tail -f /tmp/loginus-frontend.log
```

## Остановка сервисов

Остановка Docker контейнеров:
```bash
docker-compose -f docker-compose.prod.yml down
```

Остановка фронтенда:
```bash
lsof -ti:3000 | xargs kill -9
```

## Обновление

Для обновления проекта просто сделайте push в `main` - деплой запустится автоматически.

Или вручную:
```bash
ssh root@45.144.176.42
cd /root/loginus-new
git pull origin main
./scripts/deploy.sh
```

