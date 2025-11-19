# Заметки по реализации профиля и авторизации

## Дата создания
2025-01-17

## Статус компонентов

### ✅ Готовые компоненты
- **Primitives:** Button, Input, Icon, Avatar, Badge, Separator
- **Composites:** Modal, DataSection, SeparatedList, WidgetCard, Switch, Tabs
- **Layouts:** PageTemplate, Header, Sidebar, Footer
- **Contexts:** ThemeContext (светлая/темная тема)
- **i18n:** Настроен react-i18next с ru/en переводами

### ❌ Недостающие компоненты для авторизации
1. **CodeInput** - 6 полей ввода кода (primitives)
2. **UniversalInput** - универсальное поле (телефон/email) (primitives)
3. **AuthPageLayout** - layout для страниц авторизации (composites)
4. **ContactDisplay** - отображение контакта (composites)
5. **ErrorMessage** - сообщения об ошибках (composites)
6. **ResendTimer** - таймер повторной отправки (composites)

### ❌ Недостающие компоненты для профиля
1. **ProfilePopup** - попап профиля (composites)
2. **ServiceLink** - ссылка на сервис (composites)
3. **PhoneVerificationCard** - карточка проверки номера (composites)

### ❌ Недостающие хуки
1. **useInputValidation** - валидация ввода
2. **useCodeInput** - управление полями кода
3. **useResendTimer** - таймер повторной отправки
4. **useContactMasking** - маскирование контактов

### ❌ Недостающие утилиты
1. **validation.ts** - detectInputType, normalizePhone, isValidPhone, isValidEmail
2. **formatting.ts** - formatPhone, formatCode
3. **masking.ts** - maskPhone, maskEmail

## Решения по архитектуре

### Принцип переиспользования
- Все компоненты создаются с учетом переиспользования
- Используется Atomic Design (Primitives → Composites → Layouts → Pages)
- Компоненты поддерживают темную тему через `dark:` классы
- Все тексты через i18n

### Темизация
- Используется ThemeContext из `design-system/contexts/ThemeContext`
- Все компоненты должны поддерживать `dark:` классы Tailwind
- Цвета из `themes/tokens/colors.ts`

### Многоязычность
- Все тексты через `useTranslation()` из react-i18next
- Переводы в `frontend/src/services/i18n/locales/ru.json` и `en.json`
- Ключи структурированы: `auth.*`, `onboarding.*`, `profile.*`

## Порядок реализации

### Этап 1: Подготовка (Фаза 1-2)
1. ✅ Дополнение документации
2. ✅ Анализ компонентов
3. ⏳ Создание мок данных на бэкенде
4. ⏳ Расширение auth.service.ts

### Этап 2: Компоненты авторизации (Фаза 3)
1. ⏳ Utils (validation, formatting, masking)
2. ⏳ Hooks (useInputValidation, useCodeInput, useResendTimer, useContactMasking)
3. ⏳ Primitives (CodeInput, UniversalInput)
4. ⏳ Composites (AuthPageLayout, ContactDisplay, ErrorMessage, ResendTimer)

### Этап 3: Страницы авторизации (Фаза 4)
1. ⏳ AuthPage
2. ⏳ VerifyCodePage
3. ⏳ RegisterPage
4. ⏳ OnboardingPage
5. ⏳ Роутинг

### Этап 4: Компоненты профиля (Фаза 5)
1. ⏳ ServiceLink
2. ⏳ PhoneVerificationCard
3. ⏳ ProfilePopup
4. ⏳ Dashboard widgets

### Этап 5: Dashboard (Фаза 6)
1. ⏳ DashboardPage
2. ⏳ Интеграция ProfilePopup в Header

### Этап 6: API интеграция (Фаза 7)
1. ⏳ Расширение auth API
2. ⏳ Создание profile API
3. ⏳ React Query hooks

### Этап 7: Финальная доработка (Фаза 8-9)
1. ⏳ i18n переводы
2. ⏳ Проверка темизации
3. ⏳ Тестирование
4. ⏳ Документация

## Референсы из TailGrids

### Для авторизации
- `application/Signin/Signin*.jsx` - формы входа
- `application/Modal/Modal*.jsx` - модальные окна

### Для профиля
- `dashboard/Profile/Profile*.jsx` - карточки профиля
- `dashboard/Popover/Popover*.jsx` - структура popover
- `dashboard/DataStats/DataStats*.jsx` - виджеты статистики

## Важные замечания

1. **Не использовать эмодзи** - только React иконки (SVG)
2. **Все компоненты с TypeScript** - строгая типизация
3. **Поддержка accessibility** - ARIA labels, keyboard navigation
4. **Адаптивность** - mobile-first подход
5. **Производительность** - React.memo где необходимо, lazy loading

