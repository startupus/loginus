# Исправление проблемы подвисания запросов

## Проблема

Приложение зависало при выполнении API запросов из-за отсутствия таймаутов:

1. **i18n v2 API** - использовал обычный `fetch` без таймаута
2. **Основной API клиент** - axios без явного таймаута
3. **Отсутствие отмены запросов** - запросы продолжали выполняться даже при навигации

## Решение

### 1. Добавлен таймаут для основного API клиента

**Файл:** `frontend/src/services/api/config.ts`
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  TIMEOUT: 10000, // 10 секунд таймаут для предотвращения зависаний
  RETRY_ATTEMPTS: 0,
};
```

**Файл:** `frontend/src/services/api/client.ts`
```typescript
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT, // ✅ Добавлен таймаут
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Добавлен таймаут и AbortController для i18n v2 API

**Файл:** `frontend/src/services/i18n/v2/api-client.ts`

Добавлена функция `fetchWithTimeout`:
```typescript
const REQUEST_TIMEOUT = 10000; // 10 секунд

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}
```

Все методы API теперь используют `fetchWithTimeout`:
- `getModule()` ✅
- `getModules()` ✅
- `getStatus()` ✅
- `getVersion()` ✅

## Результат

✅ Запросы теперь имеют таймаут 10 секунд  
✅ При превышении таймаута запрос автоматически отменяется  
✅ Приложение не зависает при проблемах с сетью или сервером  
✅ Пользователь получает понятное сообщение об ошибке вместо бесконечного ожидания

## Тестирование

1. **Нормальный запрос** - должен выполняться без изменений
2. **Медленный сервер** - запрос должен отмениться через 10 секунд
3. **Отсутствие сети** - запрос должен отмениться через 10 секунд
4. **Недоступный сервер** - запрос должен отмениться через 10 секунд

## Дополнительные улучшения (опционально)

В будущем можно добавить:
- Прогрессивные таймауты (разные для разных типов запросов)
- Retry механизм с экспоненциальной задержкой
- Отмена запросов при размонтировании компонентов
- Индикатор загрузки для долгих запросов

