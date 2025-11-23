# Задачи: Наведение порядка в i18n на /dashboard

## Контекст
На странице `/dashboard` не все модули переключают перевод при смене языка. Необходимо привести страницу к эталонному состоянию и зафиксировать метод для тиражирования на остальные страницы.

## Чеклист

### 1. Подготовка и исследование
- [x] Создать чеклист задачи в `memory-bank/tasks.md`
- [x] Зафиксировать бизнес-требования/риски в `research/RESEARCH_STEP.md`
- [x] Синхронизировать исходные ожидания с текущей архитектурой i18n
- [x] Отметить новые бизнес-детали в `INFO.md` (если появятся)

### 2. Усиление инфраструктуры i18n
- [x] Обновить `frontend/src/services/i18n/v2/config.ts`: `I18N_MODE` по умолчанию `hybrid`
- [x] Расширить `AVAILABLE_MODULES/CRITICAL_MODULES` под реальные модули API v2 (добавлен `dashboard` в CRITICAL_MODULES)
- [x] Обновить `frontend/src/services/i18n/index.ts` (удалить упоминание `config-integrated`)
- [x] Синхронизировать язык с URL + `document.documentElement.lang` в `config.ts` и `LanguageRoute.tsx`
- [x] Обновить `LanguageSwitcher` для сохранения query/hash при переключении
- [x] Расширить `AVAILABLE_MODULES` в `backend-mock/src/translations-v2/translations-v2.service.ts` (добавлены `features`, `help`, `payment`, `admin`)
- [x] Добавить недостающие JSON модули в `backend-mock/data/translations/v2/*` (если нужно) - проверено, все модули на месте

### 3. Приведение /dashboard к эталону
- [x] Добавить `LanguageSwitcher` в `Header.tsx`
- [x] Обновить README разделов Layout и `LanguageSwitcher/README.md`
- [x] Заменить все сырые `Link to="/..."` и `navigate('/...')` на `buildPathWithLang`:
  - [x] `MailWidget.tsx`
  - [x] `PlusWidget.tsx`
  - [x] `ProfileCard.tsx` (уже использует buildPathWithLang для ссылки "Объединить аккаунты")
  - [x] `PayWidget.tsx`
  - [x] Другие компоненты Dashboard (`CoursesWidget`, `RoadmapWidget` уже используют)
- [x] Создать `frontend/src/utils/intl/formatters.ts` для форматирования чисел/дат
- [x] Применить форматтеры в компонентах:
  - [x] `ProfileCard.tsx` (баланс и игровые баллы)
  - [x] `MailWidget.tsx` (числа)
  - [x] `PlusWidget.tsx` (баллы)
  - [x] `PayWidget.tsx` (лимит)
  - [x] `EventsWidget.tsx` (относительное время)
  - [x] `RoadmapWidget.tsx` (даты)
- [x] Убедиться, что все блоки вызывают `t()` при рендере и подписаны на `i18n.language` (проверено)

### 4. Документация "метода" и удаление артефактов
- [x] Создать `frontend/src/components/Dashboard/README.md` с чеклистом i18n/UX
- [x] Обновить `I18N_V2_IMPLEMENTATION.md` (через I18N_V2_CONSOLIDATION.md)
- [x] Обновить `I18N_V2_USAGE.md` (добавлена секция о форматтерах)
- [x] Обновить `TEST_I18N_V2.md` (добавлены проверки форматтеров и отсутствия мигания)
- [x] Обновить корневой `README.md` (добавлена информация о utils/intl)
- [x] Обновить `research/I18N_V2_CONSOLIDATION.md` (добавлен раздел об эталонном методе)
- [x] Удалить пустую `backend-mock/src/translations/`
- [x] Обновить/удалить устаревшие документы (`DISABLE_OLD_I18N.md` помечен как устаревший)

### 5. Тестирование и проверка
- [ ] Запустить `scripts/start-all.sh`
- [ ] Запустить `npm run lint`
- [ ] Запустить `npm run test:e2e -- i18n-language-switch`
- [x] Добавить новый Playwright-кейс для проверки виджетов/formatters на `/en/dashboard`
- [ ] Зафиксировать результаты в `TEST_RESULTS.md`
- [x] Подготовить рекомендации по тиражированию метода на остальные страницы (в Dashboard/README.md)

## Примечания
- Все изменения должны быть задокументированы
- После завершения создать архив в `memory-bank/archive/`

