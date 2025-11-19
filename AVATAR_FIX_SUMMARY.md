# Исправление проблемы с разными аватарами

## Проблема
На странице "Профиль" и в хедере (ProfileMenu) отображались разные аватары из-за рассинхронизации данных между:
- **authStore** (локальное хранилище Zustand с persist) - использовалось в ProfileMenu через PageTemplate
- **API getDashboard** - использовалось на странице Profile/Dashboard

## Причина
1. При логине в `authStore` сохранялись базовые данные пользователя (иногда с `avatar: undefined`)
2. API возвращал актуальные данные с `avatar: null` или реальным URL
3. Данные не синхронизировались между authStore и API, что приводило к разным аватарам

## Решение

### 1. Компонент Avatar (`frontend/src/design-system/primitives/Avatar/Avatar.tsx`)
- ✅ Добавлен `useEffect` для сброса состояния `imageError` при изменении `src`
- ✅ Корректная обработка всех случаев:
  - Есть `src` и загружается → показываем изображение
  - `src` = null/undefined, есть `initials` → показываем инициалы
  - Нет ни `src`, ни `initials` → показываем иконку профиля

### 2. DashboardPage (`frontend/src/pages/DashboardPage.tsx`)
- ✅ Добавлен импорт `useAuthStore`
- ✅ Добавлен `useEffect` для синхронизации данных API с authStore:
```typescript
useEffect(() => {
  if (data?.data?.user) {
    const apiUser = data.data.user;
    updateUser({
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
      avatar: apiUser.avatar,
    });
  }
}, [data, updateUser]);
```

### 3. WorkPage (`frontend/src/pages/WorkPage.tsx`)
- ✅ Добавлен импорт `useAuthStore`
- ✅ Добавлена синхронизация данных API с authStore (аналогично DashboardPage)

### 4. ProfileMenu (`frontend/src/design-system/layouts/Header/ProfileMenu.tsx`)
- ✅ Улучшена обработка данных пользователя:
  - Проверка валидности `name` перед вызовом `getInitials`
  - Проверка валидности `avatar` (не null, не пустая строка)

### 5. getInitials (`frontend/src/utils/stringUtils.ts`)
- ✅ Улучшена обработка пустых строк и пробелов
- ✅ Фильтрация только букв (исключаем спецсимволы)
- ✅ Защита от некорректных имен

## Результат

Теперь аватар **всегда одинаковый** на всех страницах:
1. **ProfileMenu (хедер)** - берет данные из `authStore`, который синхронизируется с API
2. **ProfileCard (Dashboard)** - берет данные из API и синхронизирует с `authStore`
3. **WorkPage** - берет данные из API и синхронизирует с `authStore`

### Что показывается:
- Если в API `avatar: null` → показываются инициалы "ДЛ" на синем фоне
- Если в API `avatar: "URL"` → показывается изображение
- Если изображение не загружается → показываются инициалы
- Если нет ни аватара, ни имени → показывается иконка профиля

## Дополнительно

### Очистка localStorage (если нужно)
Если у пользователя остались старые данные в localStorage, они автоматически обновятся при следующей загрузке любой страницы с данными профиля.

### Архитектурное улучшение
Создана единая точка истины для данных пользователя:
- **Source of Truth**: API (`/api/profile/dashboard`)
- **Local Cache**: authStore (Zustand с persist)
- **Синхронизация**: автоматическая при загрузке данных из API

Это гарантирует консистентность данных во всем приложении.

