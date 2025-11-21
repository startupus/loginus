# Изменения в роутинге: /personal → /data

## Выполненные изменения

### 1. ✅ Роутинг (frontend/src/router/index.tsx)
- Изменен основной путь: `/:lang/personal` → `/:lang/data`
- Изменены подпути:
  - `/:lang/personal/documents` → `/:lang/data/documents`
  - `/:lang/personal/addresses` → `/:lang/data/addresses`
- Добавлены редиректы для обратной совместимости:
  - `/personal` → `/data`
  - `/personal/documents` → `/data/documents`
  - `/personal/addresses` → `/data/addresses`
  - `/:lang/personal` → `/:lang/data`
  - `/:lang/personal/documents` → `/:lang/data/documents`
  - `/:lang/personal/addresses` → `/:lang/data/addresses`

### 2. ✅ Компоненты Dashboard
- **DocumentsGrid.tsx**: обновлен путь `handleViewAll`
- **AddressesGrid.tsx**: обновлен путь `handleViewAll`
- **DataManagementSection.tsx**: добавлен отсутствующий импорт `themeClasses`

### 3. ✅ Layouts
- **Header.tsx**: обновлен путь в `handleEdit`
- **PageTemplate.tsx**: обновлены пути в sidebar navigation

### 4. ✅ Документация
- **DataSection.tsx**: обновлен пример в комментарии

### 5. ℹ️ Без изменений (корректно)
- **API endpoints** (`frontend/src/services/api/personal.ts`): оставлены без изменений, т.к. это бэкенд маршруты

## Исправленные ошибки

### Ошибка 1: `themeClasses is not defined`
**Файл:** `frontend/src/components/Dashboard/DataManagementSection.tsx`  
**Проблема:** Отсутствовал импорт `themeClasses`  
**Решение:** Добавлен импорт:
```typescript
import { themeClasses } from '../../design-system/utils/themeClasses';
```

### Ошибка 2: Неверное название пути
**Проблема:** Страница "Данные" была доступна по пути `/personal` вместо `/data`  
**Решение:** Переименован путь с сохранением обратной совместимости через редиректы

## Структура навигации

### До изменений:
```
/:lang/personal
  ├── /documents
  └── /addresses
```

### После изменений:
```
/:lang/data
  ├── /documents
  └── /addresses
```

## Тестирование

### Проверка новых путей:
1. ✅ http://localhost:3000/ru/data — главная страница данных
2. ✅ http://localhost:3000/ru/data/documents — документы
3. ✅ http://localhost:3000/ru/data/addresses — адреса

### Проверка редиректов (обратная совместимость):
1. ✅ http://localhost:3000/ru/personal → редирект на /ru/data
2. ✅ http://localhost:3000/ru/personal/documents → редирект на /ru/data/documents
3. ✅ http://localhost:3000/ru/personal/addresses → редирект на /ru/data/addresses

### Проверка навигации:
1. ✅ Sidebar: пункт "Данные" ведет на `/data`
2. ✅ Header: кнопка редактирования профиля ведет на `/data`
3. ✅ Кнопки "Все документы" и "Все адреса" ведут на соответствующие подстраницы

## Следующие шаги

1. Перезапустить фронтенд для применения изменений
2. Проверить все страницы в браузере
3. Убедиться, что редиректы работают корректно
4. Продолжить тестирование системы i18n v2

