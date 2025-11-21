# Инструкция по настройке и запуску проекта

## Предварительные требования

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

## Установка

### 1. Установка pnpm (если не установлен)

```bash
npm install -g pnpm
```

### 2. Установка зависимостей

```bash
# В корне проекта
pnpm install
```

Это установит зависимости для всех workspace пакетов:
- `frontend/` - React приложение
- `backend-mock/` - NestJS мок API

## Запуск проекта

### Способ 1: Автоматический запуск (рекомендуется)

```bash
pnpm dev
```

Этот скрипт:
- ✅ Автоматически очищает порты 3000 и 3001 перед запуском
- ✅ Запускает backend на порту 3001
- ✅ Запускает frontend на порту 3000
- ✅ Выводит логи в консоль
- ✅ Обрабатывает сигналы завершения (Ctrl+C)

### Способ 2: Запуск отдельных сервисов

```bash
# Только backend
pnpm dev:backend
# Backend будет доступен на http://localhost:3001/api/v2

# Только frontend
pnpm dev:frontend
# Frontend будет доступен на http://localhost:3000
```

### Способ 3: Простой запуск (без очистки портов)

```bash
pnpm dev:simple
```

## Остановка сервисов

### Автоматическая остановка

```bash
pnpm stop
```

Этот скрипт остановит все процессы на портах 3000, 3001, 3002, 3003.

### Ручная остановка

Если сервисы запущены через `pnpm dev`, нажмите `Ctrl+C` в терминале.

Для остановки отдельных процессов:

```bash
# Остановка процесса на порту 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Остановка процесса на порту 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

## Проблемы и решения

### Порт уже занят

Если при запуске вы видите сообщение:
```
Port 3000 is in use, trying another one...
```

**Решение:**
1. Используйте `pnpm stop` для очистки портов
2. Или используйте `pnpm dev` (автоматически очищает порты)

### Backend не запускается

**Проверьте:**
1. Установлены ли зависимости: `pnpm install`
2. Нет ли ошибок в `backend-mock/src/`
3. Проверьте логи в `logs/backend.log` (если используете скрипт)

### Frontend не подключается к Backend

**Проверьте:**
1. Backend запущен на порту 3001
2. В `frontend/vite.config.ts` настроен proxy на `http://localhost:3001`
3. API конфигурация использует относительный путь `/api/v2`

### Ошибки компиляции TypeScript

```bash
# Очистка и пересборка
pnpm clean
pnpm install
```

## Структура портов

- **3000** - Frontend (Vite dev server)
- **3001** - Backend (NestJS API)
- **3002, 3003** - Резервные порты (если основные заняты)

## Логи

При использовании `pnpm dev` логи backend сохраняются в:
- `logs/backend.log`

Логи frontend выводятся в консоль.

## Проверка работоспособности

После запуска проверьте:

1. **Backend health check:**
   ```bash
   curl http://localhost:3001/api/v2/health
   ```

2. **Frontend:**
   Откройте http://localhost:3000 в браузере

3. **API endpoint:**
   ```bash
   curl http://localhost:3001/api/v2/translations/status
   ```

## Дополнительные команды

```bash
# Сборка для production
pnpm build:all

# Тестирование
pnpm test          # Unit тесты
pnpm test:e2e      # E2E тесты

# Линтинг и форматирование
pnpm lint          # Проверка кода
pnpm format        # Форматирование кода

# Очистка
pnpm clean         # Удаление node_modules и dist
```

