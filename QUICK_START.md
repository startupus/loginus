# ⚡ Быстрый старт деплоя

## 1. Настройка SSH ключа в GitHub (один раз)

Следуйте инструкции в [SETUP_SSH.md](./SETUP_SSH.md)

## 2. Первоначальная настройка на сервере (один раз)

```bash
ssh root@45.144.176.42

# Создаем директорию и клонируем репозиторий
mkdir -p /root/loginus-new
cd /root/loginus-new
git clone https://github.com/teramisuslik/loginus-v2.git .

# Создаем .env.production
cp .env.production.example .env.production
nano .env.production  # Обязательно обновите пароли и секреты!

# Устанавливаем pnpm
npm install -g pnpm

# Устанавливаем зависимости фронтенда
cd frontend
pnpm install
cd ..

# Делаем скрипты исполняемыми
chmod +x scripts/*.sh
```

## 3. Первый запуск

```bash
# На сервере
cd /root/loginus-new

# Запускаем Docker контейнеры
./scripts/deploy.sh

# В отдельном терминале запускаем фронтенд
./scripts/start-frontend.sh
```

## 4. Автоматический деплой

Теперь просто делайте push в `main` - деплой запустится автоматически!

```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions автоматически:
- Склонирует/обновит код на сервере
- Пересоберет Docker образы
- Перезапустит контейнеры
- Применит миграции

## 5. Обновление фронтенда

После деплоя нужно перезапустить фронтенд вручную:

```bash
ssh root@45.144.176.42
cd /root/loginus-new

# Останавливаем старый процесс
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Запускаем заново
./scripts/start-frontend.sh
```

Или можно настроить автоматический перезапуск фронтенда в workflow (см. DEPLOYMENT.md)

## Полезные команды

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Логи API
docker-compose -f docker-compose.prod.yml logs -f loginus-api-prod

# Логи фронтенда
tail -f /tmp/loginus-frontend.log

# Остановка всего
docker-compose -f docker-compose.prod.yml down
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

