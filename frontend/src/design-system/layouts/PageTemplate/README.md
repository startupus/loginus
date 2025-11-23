## PageTemplate

Каркас пользовательских страниц, который отвечает за вывод Sidebar, Header и контента.

### Локализация пунктов меню
- Данные меню могут приходить из API `/profile/menu` с полями `label` и `systemId`
- Компонент использует `systemId`, чтобы построить ключ `sidebar.*` и запросить перевод через `i18next`
- Для предопределённых пунктов действует карта соответствий (`profile`, `data`, `data-documents`, `support` и т.д.)
- Если перевод не найден, отображается `label` из API, чтобы кастомные элементы не пропадали

### Рекомендации по доработке
- При добавлении новых `systemId` обновляйте карту соответствий в `PageTemplate.tsx`
- Не передавайте готовые строки в `sidebarItems` — используйте переводимые ключи
- Проверьте наличие переводов в `frontend/src/services/i18n/locales/{lang}/common.json`

### Тестирование
- Поведение Sidebar проверяется Playwright-сценарием `frontend/e2e/i18n-language-switch.spec.ts`
- Сценарий `should render English resources on direct /en/dashboard load` гарантирует корректную инициализацию i18n и отсутствие сырых ключей

