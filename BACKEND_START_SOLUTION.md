# Решение проблемы с данными

## Проблема
На странице `/en/admin/backup` не отображались данные с API, все запросы возвращали ошибку 500.

## Причина
Backend-mock не был запущен. Frontend пытался обратиться к API на `http://localhost:3001`, но сервер не отвечал.

## Решение
Запустить backend-mock перед запуском frontend:

```bash
# Терминал 1: Backend
cd backend-mock
npm run start:dev

# Терминал 2: Frontend  
cd frontend
npm run dev
```

Или использовать единый скрипт:

```bash
./start-all.sh
```

## Результат
После запуска бэкенда все данные успешно загружаются:
- ✅ Статистика бэкапов
- ✅ Статус синхронизации  
- ✅ Настройки синхронизации
- ✅ История бэкапов

## API эндпоинты, которые работают
- `GET /api/v2/admin/backup/stats` - статистика бэкапов
- `GET /api/v2/admin/backup/sync/status` - статус синхронизации
- `GET /api/v2/admin/backup/sync/settings` - настройки синхронизации
- `GET /api/v2/admin/backup/history` - история бэкапов

## Проверка работы
```bash
# Проверка backend
curl http://localhost:3001/api/v2/admin/backup/stats

# Ожидаемый ответ
{
  "success": true,
  "data": {
    "totalSize": 14680064,
    "totalCount": 3,
    "lastBackup": { ... }
  }
}
```

