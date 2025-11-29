# 🔧 Диагностика и исправление проблем

## ✅ **Что исправлено:**

### 1. **Загрузка плагинов (400 Bad Request)** ✅
**Проблема:** FormData отправляет `enabled` как строку `"false"`, но DTO ожидает boolean.

**Исправление:** Добавлен `@Transform` декоратор в `UploadExtensionDto`:
```typescript
@Transform(({ value }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return Boolean(value);
})
@IsBoolean()
enabled?: boolean;
```

**Тест:** Попробуйте загрузить `test-simple-plugin.zip` снова.

---

## 🔍 **Диагностика проблем с меню:**

### Проблема 1: Удалённые пункты возвращаются
### Проблема 2: DnD порядок сбрасывается

**Причина:** Backend код ПРАВИЛЬНЫЙ, проблема может быть:
1. Кеш в React Query не инвалидируется
2. В БД действительно есть старые данные
3. Другой сервис восстанавливает пункты

### Шаг 1: Проверьте что реально в БД

```bash
# Подключитесь к БД
docker exec -it loginus-db psql -U loginus -d loginus_dev

# Проверьте текущее состояние меню
SELECT 
  id, 
  "menuId",
  jsonb_array_length(items) as items_count,
  "updatedAt"
FROM navigation_menus 
WHERE "menuId" = 'sidebar-main';

# Посмотрите конкретные ID элементов в меню
SELECT 
  "menuId",
  jsonb_array_elements(items)->>'id' as item_id,
  jsonb_array_elements(items)->>'type' as item_type,
  jsonb_array_elements(items)->>'label' as item_label,
  jsonb_array_elements(items)->>'enabled' as enabled,
  jsonb_array_elements(items)->>'order' as item_order
FROM navigation_menus 
WHERE "menuId" = 'sidebar-main'
ORDER BY (jsonb_array_elements(items)->>'order')::int;
```

### Шаг 2: Проверьте логи backend при удалении

```bash
# Смотрите логи в реальном времени
docker logs -f loginus-api-new

# В другом терминале удалите пункт меню через UI
# Вы должны увидеть:
# - PUT /api/v2/admin/menu-settings
# - UPDATE "navigation_menus" SET "items" = ...
# - Массив items БЕЗ удалённого элемента
```

### Шаг 3: Проверьте frontend кеш

Откройте консоль браузера и выполните:
```javascript
// Проверить кеш React Query
console.log('Menu settings cache:', 
  window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryClient?.getQueryData(['menu-settings'])
);

// Очистить весь кеш
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryClient?.clear();

// Или просто Hard Refresh
// Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac)
```

### Шаг 4: Если элементы всё равно возвращаются

Проблема скорее всего в **одном из двух мест**:

#### A. `getNavigationMenuConfig` загружает старые данные
```typescript
// backend/src/settings/micro-modules/ui-permissions/ui-permissions.service.ts
// Строка ~331

async getNavigationMenuConfig(menuId: string): Promise<NavigationMenu | null> {
  let menu = await this.ensureMenuExists(menuId);
  
  // ДОБАВЬТЕ ЛОГ:
  console.log('[DEBUG] Raw menu from DB:', {
    itemsCount: menu.items.length,
    itemIds: menu.items.map(item => item.id),
  });
  
  // Если здесь уже есть удалённый элемент - проблема в БД
  // Если здесь НЕТ удалённого элемента - проблема в frontend
}
```

#### B. Frontend отправляет старые данные при сохранении
```typescript
// frontend/src/pages/admin/MenuSettingsPage.tsx
// В функции persistMenu

const persistMenu = async (updatedItems: MenuItemConfig[]) => {
  // ДОБАВЬТЕ ЛОГ:
  console.log('[DEBUG] Sending to backend:', {
    itemsCount: updatedItems.length,
    itemIds: updatedItems.map(item => item.id),
  });
  
  const response = await menuSettingsApi.updateMenuSettings({ items: updatedItems });
}
```

---

## 💡 **Быстрое решение (если ничего не помогает):**

### Вариант 1: Очистить меню в БД и начать заново

```sql
-- Удалить текущее меню
DELETE FROM navigation_menus WHERE "menuId" = 'sidebar-main';

-- Перезапустить backend - меню создастся автоматически из seed
```

### Вариант 2: Вручную отредактировать items в БД

```sql
-- Получить текущий items как текст
SELECT items FROM navigation_menus WHERE "menuId" = 'sidebar-main';

-- Скопировать JSON, отредактировать (удалить ненужные элементы)
-- Сохранить обратно:
UPDATE navigation_menus 
SET items = '[...ваш отредактированный JSON...]'::jsonb
WHERE "menuId" = 'sidebar-main';
```

### Вариант 3: Проверить не работает ли Mock Backend

Mock backend игнорирует БД и использует JSON файл:
```bash
# Проверьте какой backend отвечает
curl http://localhost:3000/api/v2/admin/menu-settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Если в ответе есть старые элементы, проверьте:
cat backend-mock/data/menu-settings.json
```

---

## 📋 **Чек-лист диагностики:**

- [ ] Backend логи показывают правильный UPDATE запрос
- [ ] БД содержит правильные данные после UPDATE
- [ ] Frontend не кеширует старые данные (проверить React Query DevTools)
- [ ] При загрузке меню backend возвращает правильные данные из БД
- [ ] Не используется Mock Backend вместо реального
- [ ] После Hard Refresh (Ctrl+Shift+R) данные всё ещё неправильные

---

## 🔄 **Перезапуск для тестирования:**

```bash
# 1. Остановить frontend (если запущен локально)
# Ctrl+C в терминале с npm run dev

# 2. Перезапустить backend в Docker
docker restart loginus-api-new

# 3. Подождать ~5 секунд
Start-Sleep -Seconds 5

# 4. Запустить frontend заново
cd frontend
npm run dev
```

---

## 🎯 **Следующие шаги:**

1. **Загрузите тестовый плагин** через фикс кнопку загрузки
2. **Проверьте БД** по инструкции выше
3. **Добавьте логи** если проблема не найдена
4. **Сообщите результаты** каждого шага для дальнейшей диагностики

Если после всех проверок проблема сохраняется - нужны логи из backend и скриншот данных из БД.

