# Удаление API v1 и миграция на v2

## Выполненные изменения

### Бэкенд

1. ✅ **Удален старый модуль translations v1**
   - Удален `backend-mock/src/translations/translations.controller.ts`
   - Удален `backend-mock/src/translations/translations.service.ts`
   - Удален `backend-mock/src/translations/translations.module.ts`
   - Удален из `app.module.ts`

2. ✅ **Удалены старые данные translations v1**
   - Удален `backend-mock/data/translations/ru.json`
   - Удален `backend-mock/data/translations/en.json`
   - Удалены директории `backend-mock/data/translations/en/` и `backend-mock/data/translations/ru/`

3. ✅ **Обновлен глобальный префикс API**
   - Изменен с `api/v1` на `api/v2` в `main.ts`
   - Все контроллеры теперь доступны по `/api/v2/*`

4. ✅ **Обновлена предзагрузка данных**
   - Убрана предзагрузка старых файлов `translations/ru.json` и `translations/en.json`
   - Оставлена только предзагрузка модулей v2

### Фронтенд

1. ✅ **Обновлена конфигурация API**
   - `API_CONFIG.BASE_URL` изменен с `/api/v1` на `/api/v2`
   - Все API запросы теперь идут на `/api/v2/*`

2. ✅ **Обновлена документация**
   - Обновлены упоминания `/api/v1` на `/api/v2` в документации

## Новые пути API

### Все эндпоинты теперь доступны по `/api/v2/*`:

- `/api/v2/health` - проверка здоровья сервера
- `/api/v2/auth/*` - аутентификация
- `/api/v2/profile/*` - профиль пользователя
- `/api/v2/personal/*` - персональные данные
- `/api/v2/security/*` - безопасность
- `/api/v2/family/*` - семья
- `/api/v2/payment/*` - платежи
- `/api/v2/support/*` - поддержка
- `/api/v2/translations/*` - переводы (v2 система)

## Удаленные эндпоинты

- ❌ `/api/v1/translations/:locale` - старый API переводов
- ❌ `/api/v1/health` - перемещен на `/api/v2/health`

## Миграция

Все существующие клиенты должны обновить базовый URL с `/api/v1` на `/api/v2`.

## Проверка

После перезапуска бэкенда проверьте:
1. `curl http://localhost:3001/api/v2/health` - должен вернуть статус
2. `curl http://localhost:3001/api/v2/translations/status` - должен вернуть статус переводов
3. Все остальные эндпоинты должны работать по `/api/v2/*`

