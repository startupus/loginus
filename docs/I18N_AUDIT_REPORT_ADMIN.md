# Отчёт об аудите i18n: Админ-панель

**Дата аудита**: 23 ноября 2025  
**Проверенные страницы**: `/en/admin`, `/ru/admin`  
**Статус**: ✅ Проблемы найдены и исправлены

---

## Обнаруженные проблемы

### 1. Отсутствие модуля переводов `admin` на бэкенде
**Статус**: ❌ FAIL → ✅ FIXED

**Проблема**:  
Файлы `admin.json` отсутствовали в папке `backend-mock/data/translations/v2/{locale}/`.

**Проявление**:
- API `/api/v2/translations/en/admin` возвращал ошибку 404
- Фронтенд не мог загрузить переводы для админ-панели

**Решение**:
1. Созданы файлы:
   - `backend-mock/data/translations/v2/en/admin.json`
   - `backend-mock/data/translations/v2/ru/admin.json`
2. Добавлены все необходимые переводы (sidebar, dashboard, users, companies, menuSettings, backup)

---

### 2. Отсутствующие ключи переводов в английской локали
**Статус**: ❌ FAIL → ✅ FIXED

**Проблема**:  
В файле `frontend/src/services/i18n/locales/en/admin.json` отсутствовали ключи:
- `sidebar.title` - "Admin Panel"
- `sidebar.backToProfile` - "Back to Profile"
- `dashboard.title` - "Admin Panel"

**Проявление**:
- В сайдбаре отображались ключи переводов вместо текста:
  - `admin.sidebar.title`
  - `admin.sidebar.backToProfile`
- Заголовок страницы "Админ-панель" на русском для EN локали

**Решение**:
Добавлены недостающие ключи в оба файла локализации (`frontend` и `backend-mock`).

---

### 3. Модуль `admin` не загружается на фронтенде
**Статус**: ❌ FAIL → ✅ FIXED

**Проблема**:  
Компоненты `AdminPageTemplate` и `AdminSidebar` использовали `useTranslation()` без предзагрузки модуля `admin`.

**Проявление**:
- Сайдбар показывал ключи переводов вместо текста:
  - `admin.sidebar.dashboard`
  - `admin.sidebar.users`
  - `admin.sidebar.companies`
  - `admin.sidebar.settings`

**Решение**:
1. Добавлен импорт `preloadModule` в компоненты:
   - `AdminPageTemplate.tsx`
   - `AdminSidebar.tsx`
2. Добавлен `useEffect` для загрузки модуля при монтировании компонента

**Изменённые файлы**:
```typescript
// AdminPageTemplate.tsx
import { preloadModule } from '@/services/i18n/config';

useEffect(() => {
  preloadModule('admin').catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[i18n] Failed to preload admin module:', error);
    }
  });
}, []);
```

---

### 4. Неправильная структура данных при загрузке модуля
**Статус**: ❌ FAIL → ✅ FIXED

**Проблема**:  
Функция `loadModuleForI18n` возвращала данные без обёртки в родительский ключ модуля.

**Проявление**:
- API возвращал данные как `{sidebar: {...}, dashboard: {...}}`
- Компоненты ожидали `{admin: {sidebar: {...}, dashboard: {...}}}`
- Переводы не работали, так как ключи были недоступны через `admin.sidebar.title`

**Решение**:
Изменена функция `loadModuleForI18n` в `frontend/src/services/i18n/config.ts`:

```typescript
if (data && Object.keys(data).length > 0) {
  markModuleAsLoaded(locale, module);
  // Оборачиваем данные в родительский ключ модуля
  return { [module]: data };
}
```

---

## Проверка после исправлений

### Консоль браузера
```
[LOG] [i18n-v2] Loaded en/admin from API
[LOG] [i18n] [preload:admin] add bundle for en: 6 keys [sidebar, dashboard, users, companies, menuSettings, backup]
```

### Проверка через DevTools
```javascript
window.i18next.language // "en"
window.i18next.t('admin.sidebar.title') // "Admin Panel" 
window.i18next.exists('admin.sidebar.dashboard') // true
```

---

## Файлы, созданные/изменённые

### Созданные файлы:
1. `backend-mock/data/translations/v2/en/admin.json`
2. `backend-mock/data/translations/v2/ru/admin.json`

### Изменённые файлы:
1. `frontend/src/services/i18n/locales/en/admin.json` - добавлены ключи `sidebar.title`, `sidebar.backToProfile`, `dashboard.title`
2. `frontend/src/services/i18n/locales/ru/admin.json` - добавлен ключ `dashboard.title`
3. `frontend/src/design-system/layouts/AdminPageTemplate/AdminPageTemplate.tsx` - добавлена загрузка модуля admin
4. `frontend/src/design-system/layouts/AdminSidebar/AdminSidebar.tsx` - добавлена загрузка модуля admin
5. `frontend/src/services/i18n/config.ts` - исправлена структура данных при загрузке модуля

---

## Рекомендации

### 1. Документация
Обновить документацию по добавлению новых модулей переводов, указав необходимость:
- Создания файлов на бэкенде
- Предзагрузки модуля в компонентах через `preloadModule`
- Синхронизации файлов между `frontend` и `backend-mock`

### 2. Автоматизация
Рассмотреть возможность автоматической синхронизации файлов переводов между `frontend/src/services/i18n/locales` и `backend-mock/data/translations/v2`.

### 3. Тестирование
Добавить автотесты для проверки:
- Наличия всех файлов переводов на бэкенде
- Корректности структуры данных при загрузке модулей
- Загрузки всех необходимых модулей для страниц

---

## Итоговый статус

✅ **Все проблемы исправлены**

**Следующие шаги**:
1. Авторизоваться в системе
2. Перейти на `/en/admin`
3. Убедиться, что все переводы отображаются корректно
4. Проверить переключение языка на `/ru/admin`

**Ожидаемое поведение**:
- Сайдбар показывает "Admin Panel", "Dashboard", "Users", "Companies", "Settings"
- Заголовок страницы "Admin Panel"  
- Кнопка "Back to Profile" внизу сайдбара
- Все переводы переключаются при смене языка на русский/английский

