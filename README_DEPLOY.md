# 🚀 CI/CD Setup для Loginus

## Что было настроено

✅ GitHub Actions workflow для автоматического деплоя  
✅ Production docker-compose конфигурация  
✅ Скрипты деплоя и запуска фронтенда  
✅ Документация по настройке  

## Следующие шаги

### 1. Добавьте SSH ключ в GitHub Secrets

См. [SETUP_SSH.md](./SETUP_SSH.md) для подробной инструкции.

**Кратко:**
- Откройте https://github.com/teramisuslik/loginus-v2/settings/secrets/actions
- Добавьте секрет `SSH_PRIVATE_KEY` со значением вашего приватного SSH ключа

### 2. Первоначальная настройка на сервере

См. [QUICK_START.md](./QUICK_START.md) для быстрого старта.

**Кратко:**
```bash
ssh root@45.144.176.42
mkdir -p /root/loginus-new
cd /root/loginus-new
git clone https://github.com/teramisuslik/loginus-v2.git .
cp .env.production.example .env.production
# Отредактируйте .env.production с реальными значениями!
npm install -g pnpm
cd frontend && pnpm install && cd ..
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 3. Запуск фронтенда

В отдельном терминале на сервере:
```bash
cd /root/loginus-new
./scripts/start-frontend.sh
```

### 4. Тестирование CI/CD

Сделайте любой коммит и push в `main`:
```bash
git add .
git commit -m "Test CI/CD"
git push origin main
```

Проверьте статус деплоя:
- GitHub: https://github.com/teramisuslik/loginus-v2/actions

## Структура файлов

```
.github/workflows/deploy.yml    # GitHub Actions workflow
docker-compose.prod.yml         # Production Docker конфигурация
scripts/deploy.sh               # Скрипт деплоя на сервере
scripts/start-frontend.sh       # Скрипт запуска фронтенда
.env.production.example         # Шаблон переменных окружения
DEPLOYMENT.md                   # Полная документация
QUICK_START.md                  # Быстрый старт
SETUP_SSH.md                    # Настройка SSH
```

## Важные замечания

⚠️ **Обязательно обновите `.env.production`** с реальными значениями:
- `DB_PASSWORD` - надежный пароль
- `JWT_SECRET` - случайная строка минимум 32 символа
- `JWT_REFRESH_SECRET` - другая случайная строка минимум 32 символа
- `SMTP_*` - настройки почты

⚠️ **Фронтенд запускается локально** на сервере (не в Docker), так как требуется hot-reload для разработки.

⚠️ **Домен:** https://loginus.startapus.com - уже настроен в `docker-compose.prod.yml`

## Мониторинг

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Логи API
docker-compose -f docker-compose.prod.yml logs -f loginus-api-prod

# Логи фронтенда
tail -f /tmp/loginus-frontend.log
```

## Поддержка

Если что-то не работает:
1. Проверьте логи GitHub Actions
2. Проверьте логи на сервере
3. Убедитесь, что SSH ключ добавлен в GitHub Secrets
4. Убедитесь, что `.env.production` настроен правильно

