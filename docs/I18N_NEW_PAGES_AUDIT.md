# Инструкция: аудит i18n и функционала новых страниц Loginus UI

Документ предназначен как готовый промт/чеклист для ИИ‑агента или инженера, который проверяет и исправляет новые страницы уже на запущенном проекте.

---

## 0. Быстрый старт окружения

1. **Запуск сервисов**
   ```bash
   ./start-all.sh
   ```
   - Backend мок: `http://localhost:3001/api/v2`
   - Frontend: `http://localhost:3000`
2. **Очистка состояния**
   - В devtools выполнить:
     ```js
     localStorage.removeItem('loginus-language');
     sessionStorage.clear();
     ```
   - Сделать Hard Reload (`Cmd+Shift+R` / `Ctrl+Shift+R`).
3. **Подготовка браузера** – открыть две вкладки: `/ru/...` и `/en/...` для нужных страниц.

---

## 1. Чеклист проверки каждой страницы

| Что проверить | Как | Где искать проблему |
| --- | --- | --- |
| `document.documentElement.lang` соответствует URL (`en` / `ru`) | DevTools → Console: `document.documentElement.lang` | `frontend/src/services/i18n/config.ts`, `frontend/src/router/LanguageRoute.tsx` |
| Sidebar/меню показывают переводы, а не строки из API | Смотреть DOM, искать русские строки на `/en/...` | `frontend/src/design-system/layouts/PageTemplate/PageTemplate.tsx` (`convertMenuItemToSidebarItem`) и `AdminPageTemplate` |
| Навигация при смене языка сохраняет путь и query/hash | Переключить `LanguageSwitcher`, сравнить URL | `frontend/src/utils/routing.ts` (`buildPathWithLang`), `frontend/src/design-system/composites/LanguageSwitcher` |
| Форматирование чисел/валют соответствует локали (`12 500 ₽` ↔ `12,500 ₽`) | Проверить суммы/балансы/лимиты | Компоненты должны использовать `formatNumber/formatCurrency` из `frontend/src/utils/intl/formatters.ts` |
| Переводы грузятся через API v2 | DevTools → Network: `/api/v2/translations/{lang}/{module}` → 200 OK | Если нет запроса ⇒ проверить `CRITICAL_MODULES`, `preloadModule` в `frontend/src/services/i18n/config.ts` и вызовы `preloadModule` на странице |
| Нет «мигания» языка при загрузке | Hard reload `/ru/...`, сразу проверить, что нет английских текстов | Убедиться, что локаль читается до рендера (см. `LanguageRoute.tsx`, `i18n` init) |
| Тестовые сценарии E2E покрывают страницу | Запустить `npm run test:e2e -- i18n-language-switch.spec.ts` | Добавить/обновить кейсы в `frontend/e2e` при изменениях |

---

## 2. Диагностика типовых проблем

### 2.1 В DOM показывается ключ (`personalData.documents.title`)
1. Проверить ответ API: `Network → translations/{lang}/{module}`.
2. Если ключ отсутствует только в API — исправить файл `backend-mock/data/translations/v2/{lang}/{module}.json`.  
3. Если ключ есть в API, но не подхватывается:
   - Убедиться, что компонент вызывает `t('module.path')`.
   - Проверь `CRITICAL_MODULES` + `preloadModule('module')`.

### 2.2 На `/en/...` остались русские строки
1. Найди элемент → DevTools → select node → выясни компонент.
2. Если текст берётся из API (например, меню), см. `PageTemplate` (`sidebarTranslationKeys`). Использовать `systemId` для `t(...)`.
3. Если текст хардкодом в компоненте — заменить на `t('...')`. Примеры:
   - `SupportPage` … `support.chat.agentName`, `support.chat.userName` (файлы `frontend/src/services/i18n/locales/{lang}/support.json`).
   - Компоненты Header/Footer → `frontend/src/design-system/layouts`.

### 2.3 Не сохраняется текущий URL при смене языка
1. Проверить, используется ли `buildPathWithLang`.
2. Для кастомной навигации убедиться, что `useNavigate(buildPathWithLang(target, lang))`.
3. Если используется `Link to="/route"` — заменить на `buildPathWithLang`.

### 2.4 Форматирование чисел/дат «ломается»
1. Проверь, что компонент импортирует `formatNumber`, `formatCurrency`, `formatDate`.
2. Убедись, что передаётся актуальная локаль:
   ```ts
   const locale = useCurrentLanguage() === 'en' ? 'en' : 'ru';
   formatCurrency(value, 'RUB', locale);
   ```
3. Для относительных дат — `formatRelativeTimeWithT`.

### 2.5 Модули переводов не загружаются
1. Посмотри `frontend/src/services/i18n/config.ts`:
   - `availableModules` / `CRITICAL_MODULES`.
   - Настройки `loadModules` и IndexedDB.
2. На странице добавить `preloadModule('module')` в `useEffect`, а также подписку на `i18n.on('languageChanged', ...)`.

---

## 3. План действий по исправлению

1. **Определи компонент**: файл, отвечающий за текст.
2. **Почини источник данных**:
   - добавь ключ в `frontend/src/services/i18n/locales/{lang}/...`;
   - синхронизируй мок в `backend-mock/data/translations/v2/{lang}/...`;
   - при необходимости обнови API и `adminApi`/`profileApi`.
3. **Заставь компонент использовать `t(...)`**:
   - избегай хардкода; максимум — `t('key', 'fallback')`.
   - для данных из API (меню) — используем `systemId`.
4. **Обеспечь загрузку модулей** через `preloadModule`.
5. **Проверь навигацию**: `buildPathWithLang`, `useCurrentLanguage`.
6. **Обнови документацию**:
   - README соответствующего раздела (`frontend/src/pages/<section>/README.md` или `design-system/.../README.md`).
   - `research/RESEARCH_STEP.md` — зафиксируй новые проблемы и решения.
7. **Запусти проверки**:
   ```bash
   npm run lint
   npm run test:e2e -- i18n-language-switch.spec.ts
   ```
8. **Зафиксируй в `TEST_RESULTS.md`** новое состояние.

---

## 4. Формат итогового отчёта (примеры)

```
Страница: /en/dashboard
Status: OK
Проблемы: нет
Отладка:
  - document.documentElement.lang === 'en'
  - /api/v2/translations/en/dashboard → 200, в DOM нет ключей
Пример корректной работы: Sidebar сразу показывает Profile/Data/Support, суммы в формате 12,500 ₽
```

```
Страница: /en/support
Status: FAIL
Проблемы:
  - Лейбл “Поддержка Loginus ID” в шапке приходит хардкодом
  - Приветствие “Здравствуйте!” на EN версии
Отладка:
  - DOM: `text=Поддержка` найден в `SupportPage`
  - API `/translations/en/support` не содержит ключа `support.chat.agentName`
Действия:
  1. Добавить `support.chat.agentName` в `frontend/src/services/i18n/locales/en/support.json`
  2. Добавить аналог в RU, синхронизировать backend-mock
  3. Использовать `t('support.chat.agentName')` в `SupportPage`
  4. Прогнать `npm run test:e2e -- i18n-language-switch.spec.ts`
```

---

Используй этот файл как готовый промпт: просто передай его ИИ‑агенту/инженеру, и он сможет провести полный аудит i18n и поведения новой страницы без дополнительного контекста.*** End Patch

