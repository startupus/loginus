# 🔧 Исправление SMTP настроек

## Проблема
Код на почту не отправляется из-за неправильных SMTP настроек в `.env.production`.

## Решение

Нужно обновить файл `/root/loginus-new/.env.production` на сервере с реальными данными:

```bash
ssh -i C:\Users\teramisuslik\.ssh\id_ed25519 root@45.144.176.42
cd /root/loginus-new
nano .env.production
```

Измените следующие строки:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=KazakovVladislav2005@yandex.ru  # Ваш реальный email
SMTP_PASSWORD=bvdjbeygikzrwmnu              # Пароль приложения Yandex
SMTP_FROM=KazakovVladislav2005@yandex.ru    # Отправитель
```

**Важно**: Для Yandex нужно использовать **пароль приложения**, а не обычный пароль!

### Как получить пароль приложения Yandex:

1. Перейдите: https://id.yandex.ru/security
2. Включите "Пароли приложений"
3. Создайте пароль для "Почта"
4. Используйте этот пароль в `SMTP_PASSWORD`

После изменения `.env.production`:

```bash
cd /root/loginus-new
docker-compose -f docker-compose.prod.yml restart loginus-api
```

Проверьте логи:
```bash
docker logs loginus-api-prod --tail 20 | grep SMTP
```

