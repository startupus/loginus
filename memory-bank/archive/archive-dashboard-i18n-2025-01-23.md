# Архив: Наведение порядка в i18n на /dashboard

**Дата завершения:** 2025-01-23  
**Статус:** ✅ Завершено

## Контекст задачи

На странице `/dashboard` не все модули переключали перевод при смене языка. Необходимо было привести страницу к эталонному состоянию и зафиксировать метод для тиражирования на остальные страницы проекта.

## Выполненные задачи

### 1. Подготовка и исследование ✅

- Создан чеклист задачи в `memory-bank/tasks.md`
- Зафиксированы бизнес-требования/риски в `research/RESEARCH_STEP.md`
- Синхронизированы исходные ожидания с текущей архитектурой i18n

### 2. Усиление инфраструктуры i18n ✅

**Изменения в конфигурации:**
- `frontend/src/services/i18n/v2/config.ts`: `I18N_MODE` по умолчанию изменен на `hybrid`
- `CRITICAL_MODULES` расширен: добавлен `dashboard` для загрузки при инициализации
- `AVAILABLE_MODULES` в backend расширен: добавлены `features`, `help`, `payment`, `admin`

**Синхронизация языка:**
- `getInitialLanguage()` теперь приоритетно берет язык из URL, затем из localStorage
- Синхронизация `document.documentElement.lang` при инициализации i18n
- `LanguageRoute.tsx` оптимизирован для предотвращения лишних переключений
- `LanguageSwitcher` сохраняет query параметры и hash при переключении языка

**Удаление артефактов:**
- Удалена пустая директория `backend-mock/src/translations/`
- Обновлен `frontend/src/services/i18n/index.ts` (удалено упоминание `config-integrated`)
- `DISABLE_OLD_I18N.md` помечен как устаревший

### 3. Приведение /dashboard к эталону ✅

**Навигация:**
- Все компоненты Dashboard используют `buildPathWithLang()` вместо сырых путей:
  - `MailWidget.tsx` → `/mail`
  - `PlusWidget.tsx` → `/plus` и `/plus/tasks`
  - `PayWidget.tsx` → `/pay`
  - `CoursesWidget.tsx` → `/courses` (уже использовал)
  - `RoadmapWidget.tsx` → `/roadmap` (уже использовал)

**Форматирование:**
- Создан `frontend/src/utils/intl/formatters.ts` с функциями:
  - `formatNumber(value, locale)` - форматирование чисел
  - `formatCurrency(value, currency, locale)` - форматирование валют
  - `formatDate(date, locale, options)` - форматирование дат
  - `formatRelativeTimeWithT(date, t, locale)` - относительное время с переводами
- Применены форматтеры во всех компонентах:
  - `ProfileCard.tsx` - баланс и игровые баллы
  - `MailWidget.tsx` - количество писем
  - `PlusWidget.tsx` - баллы
  - `PayWidget.tsx` - лимит
  - `EventsWidget.tsx` - относительное время событий
  - `RoadmapWidget.tsx` - даты шагов

**UI компоненты:**
- `LanguageSwitcher` добавлен в `Header.tsx` для десктопной версии
- Создан `frontend/src/design-system/composites/LanguageSwitcher/README.md`

**Реактивность:**
- Все компоненты используют `useCurrentLanguage()` для получения текущего языка
- Компоненты подписаны на изменения языка через зависимости в `useMemo`

### 4. Документация "метода" ✅

**Созданные документы:**
- `frontend/src/components/Dashboard/README.md` - чеклист i18n/UX и эталонный метод
- `frontend/src/design-system/composites/LanguageSwitcher/README.md` - документация компонента

**Обновленные документы:**
- `research/I18N_V2_CONSOLIDATION.md` - добавлен раздел об эталонном методе
- `I18N_V2_USAGE.md` - добавлена секция о форматтерах
- `TEST_I18N_V2.md` - добавлены проверки форматтеров и отсутствия мигания
- `README.md` (корень) - добавлена информация о `utils/intl`
- `DISABLE_OLD_I18N.md` - помечен как устаревший

### 5. Тестирование ✅

**E2E тесты:**
- Добавлены тесты для проверки форматирования чисел/дат
- Добавлен тест для проверки отсутствия мигания текста при загрузке
- Обновлены существующие тесты с учетом новых требований

## Ключевые решения

### Приоритет языка из URL
При инициализации i18n язык определяется из URL в первую очередь, что предотвращает мигание текста при загрузке страницы.

### Единые форматтеры
Все форматирование чисел и дат вынесено в отдельные утилиты, которые учитывают текущий язык. Это обеспечивает консистентность и упрощает поддержку.

### Единая навигация
Все навигационные ссылки используют `buildPathWithLang()`, что гарантирует сохранение языка при переходах и переключении языка.

## Метод тиражирования на другие страницы

1. Создать `README.md` в директории компонентов страницы с чеклистом из `Dashboard/README.md`
2. Пройтись по всем компонентам и применить чеклист:
   - Заменить сырые пути на `buildPathWithLang()`
   - Применить форматтеры для чисел/дат
   - Убедиться в реактивности компонентов
3. Протестировать переключение языка на странице
4. Задокументировать изменения

## Результаты

✅ Страница `/dashboard` приведена к эталонному состоянию  
✅ Все модули корректно переключают перевод  
✅ Нет мигания текста при загрузке страницы  
✅ Форматтеры работают корректно для обоих языков  
✅ Навигация сохраняет язык при переходах  
✅ Создан эталонный метод для тиражирования  
✅ Документация обновлена  

## Файлы изменений

**Конфигурация:**
- `frontend/src/services/i18n/v2/config.ts`
- `frontend/src/services/i18n/config.ts`
- `frontend/src/services/i18n/index.ts`
- `frontend/src/router/LanguageRoute.tsx`
- `backend-mock/src/translations-v2/translations-v2.service.ts`

**Компоненты Dashboard:**
- `frontend/src/components/Dashboard/MailWidget.tsx`
- `frontend/src/components/Dashboard/PlusWidget.tsx`
- `frontend/src/components/Dashboard/PayWidget.tsx`
- `frontend/src/components/Dashboard/ProfileCard.tsx`
- `frontend/src/components/Dashboard/EventsWidget.tsx`
- `frontend/src/components/Dashboard/RoadmapWidget.tsx`

**Layout компоненты:**
- `frontend/src/design-system/layouts/Header/Header.tsx`
- `frontend/src/design-system/composites/LanguageSwitcher/LanguageSwitcher.tsx`

**Утилиты:**
- `frontend/src/utils/intl/formatters.ts` (новый файл)

**Документация:**
- `frontend/src/components/Dashboard/README.md` (новый файл)
- `frontend/src/design-system/composites/LanguageSwitcher/README.md` (новый файл)
- `research/I18N_V2_CONSOLIDATION.md`
- `I18N_V2_USAGE.md`
- `TEST_I18N_V2.md`
- `README.md`
- `DISABLE_OLD_I18N.md`

**Тесты:**
- `frontend/e2e/i18n-language-switch.spec.ts`

## Рекомендации для следующих страниц

1. Использовать чеклист из `Dashboard/README.md`
2. Применять форматтеры из `utils/intl/formatters.ts`
3. Использовать `buildPathWithLang()` для всех навигационных ссылок
4. Убедиться в реактивности компонентов при смене языка
5. Протестировать переключение языка перед завершением

