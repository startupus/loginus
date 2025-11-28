# Миграция с Mock Backend на Production Backend

## Шаг 1: Копирование папки backend

Из-за проблем с кодировкой кириллицы в пути, скопируйте папку вручную:

**Исходный путь:** `C:\Users\teramisuslik\работа\loginusV2\loginus-v2\backend`  
**Целевой путь:** `C:\Users\teramisuslik\Desktop\123123\backend`

### Инструкция:
1. Откройте проводник Windows
2. Перейдите в `C:\Users\teramisuslik\работа\loginusV2\loginus-v2\`
3. Скопируйте папку `backend` (Ctrl+C)
4. Перейдите в `C:\Users\teramisuslik\Desktop\123123\`
5. Вставьте папку `backend` (Ctrl+V)

После копирования структура проекта будет:
```
123123/
├── backend/          # Новый production backend
├── backend-mock/     # Старый mock backend (можно оставить для справки)
├── frontend/
└── ...
```

## Шаг 2: Сравнение структуры

### Mock Backend (backend-mock):
- Простой NestJS приложение
- Использует JSON файлы для данных
- Минимальные зависимости
- Порт: 3001
- API префикс: `/api/v2`

### Production Backend (backend):
- Полноценное NestJS приложение
- Использует базу данных (PostgreSQL)
- Расширенные зависимости
- Модули: auth, profile, admin, audit, dashboard, family, payment, security, support, help, translations, users, organizations, teams, work, notifications, settings, rbac
- Dockerfile уже присутствует

## Шаг 3: Планирование миграции

### Что нужно сделать:

1. **Анализ API endpoints:**
   - Сравнить endpoints mock backend с production backend
   - Определить различия в структуре ответов
   - Составить список необходимых изменений

2. **Обновление frontend:**
   - Обновить API клиенты для работы с production backend
   - Адаптировать типы данных под новую структуру ответов
   - Обновить обработку ошибок
   - Проверить аутентификацию и авторизацию

3. **Обновление Docker конфигурации:**
   - Обновить docker-compose.yml для работы с production backend
   - Настроить подключение к базе данных
   - Обновить переменные окружения

4. **Тестирование:**
   - Проверить все endpoints
   - Протестировать аутентификацию
   - Проверить работу всех страниц

## Шаг 4: Следующие шаги

После копирования папки backend выполните:
1. Проверьте структуру скопированной папки
2. Изучите package.json нового backend
3. Проверьте наличие Dockerfile
4. Изучите структуру модулей
5. Сравните API endpoints

## Полезные команды

```bash
# Проверка структуры backend
ls backend/

# Просмотр package.json
cat backend/package.json

# Проверка Dockerfile
cat backend/Dockerfile

# Сравнение зависимостей
diff backend-mock/package.json backend/package.json
```

