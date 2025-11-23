# Консолидация i18n на API v2 - Реализация

## Выполненные задачи

### 1. Консолидация i18n на API v2 ✅
- Переписан `frontend/src/services/i18n/config.ts` для использования API v2 как основного источника
- Используется `loadModule` и `loadModules` из `v2/loader.ts` с fallback на статические файлы
- Все модули загружаются через `/api/v2/translations/:locale/:module`

### 2. Удаление дубликатов конфигурации ✅
- Удален `config-integrated.ts` (дубликат)
- `index.ts` экспортирует из единого `config.ts`
- `v2/config.ts` используется только для констант и утилит

### 3. Синхронизация языка и URL ✅
- `LanguageSwitcher` автоматически синхронизирует язык с URL через `buildPathWithLang`
- `LanguageRoute` обновлен для использования нового `changeLanguage` из `config.ts`

### 4. Единый компонент LanguageSwitcher ✅
- Создан `frontend/src/design-system/composites/LanguageSwitcher/LanguageSwitcher.tsx`
- Используется в `Sidebar`, `AdminSidebar` и `Header`
- Синхронизирует язык с i18n, languageStore и URL
- Сохраняет query параметры и hash при переключении языка

### 5. Реактивность Layout-компонентов ✅
- `PageTemplate`: `useMemo` с зависимостями `[t, currentLang, location.pathname, i18n.language]`
- `AdminPageTemplate`: обернуто в `useMemo` с зависимостями от языка
- `Sidebar` и `AdminSidebar`: используют `LanguageSwitcher` для переключения языка

### 6. Бизнес-компоненты ✅
- `DataSection`: принимает `title` как проп (перевод на рендере в родителе)
- `DocumentsGrid`: использует `t()` на рендере, `buildPathWithLang()` для навигации
- `AddressesGrid`: использует `t()` на рендере, `buildPathWithLang()` для навигации
- Все виджеты Dashboard используют форматтеры из `utils/intl/formatters.ts`
- Все компоненты Dashboard используют `buildPathWithLang()` для навигации

### 7. Недостающие ключи ✅
- Ключи `personalData.documents.diplomas` и `personalData.documents.certificates` присутствуют в:
  - `backend-mock/data/translations/v2/en/profile.json`
  - `backend-mock/data/translations/v2/ru/profile.json`
  - `frontend/src/services/i18n/locales/en/profile.json` (fallback)
  - `frontend/src/services/i18n/locales/ru/profile.json` (fallback)

### 8. Тема ✅
- Глобальная тема реализована через `ThemeContext` и CSS переменные
- Все компоненты используют `themeClasses` вместо хардкода цветов
- Поддержка светлой, темной и корпоративной темы

### 9. Единое API для мок-данных ✅
- Все сервисы используют `frontend/src/services/api/client.ts` для запросов к backend-mock
- Нет прямых импортов JSON файлов (кроме fallback для переводов)

## Архитектурные решения

### Источник переводов
- **Основной**: API v2 (`/api/v2/translations/:locale/:module`) из backend-mock (Nest)
- **Fallback**: Локальные JSON файлы в `frontend/src/services/i18n/locales/`
- **Кэш**: IndexedDB через `v2/cache.ts`

### Загрузка модулей
1. Проверка кэша IndexedDB
2. Загрузка через API v2
3. Fallback на статические файлы
4. Fallback на русский язык
5. Показ ключа перевода

### Реактивность
- Все Layout-компоненты используют `useMemo` с зависимостями от `i18n.language`
- `LanguageSwitcher` триггерит `changeLanguage`, который эмитит `languageChanged`
- Компоненты автоматически перерисовываются при смене языка

## Эталонный метод для Dashboard (2025-01-23)

### Выполненные улучшения

1. **Приоритет языка из URL при инициализации**
   - `getInitialLanguage()` сначала проверяет URL, затем localStorage
   - Предотвращает мигание текста при загрузке страницы
   - Синхронизация `document.documentElement.lang` при инициализации

2. **Утилиты форматирования**
   - Создан `frontend/src/utils/intl/formatters.ts`
   - `formatNumber()`, `formatCurrency()`, `formatDate()`, `formatRelativeTimeWithT()`
   - Все компоненты Dashboard используют форматтеры вместо хардкодных локалей

3. **Единая навигация**
   - Все компоненты используют `buildPathWithLang()` вместо сырых путей
   - Сохранение query параметров и hash при переключении языка
   - `LanguageSwitcher` добавлен в `Header` для десктопной версии

4. **Реактивность компонентов**
   - Все компоненты подписаны на изменения языка
   - `useMemo` с зависимостями `[t, i18n.language, currentLang]`
   - Автоматическая перерисовка при смене языка

5. **Документация**
   - Создан `frontend/src/components/Dashboard/README.md` с чеклистом
   - Описан эталонный метод для тиражирования на другие страницы

### Метод тиражирования

1. Создать README.md в директории компонентов страницы
2. Пройтись по всем компонентам и применить чеклист из Dashboard/README.md
3. Заменить все сырые пути на `buildPathWithLang()`
4. Применить форматтеры для чисел/дат
5. Убедиться в реактивности компонентов
6. Протестировать переключение языка

## Следующие шаги

1. ✅ Добавить Playwright E2E тесты для проверки смены языка
2. ✅ Обновить документацию в `I18N_V2_IMPLEMENTATION.md`
3. Тиражировать эталонный метод на остальные страницы проекта

