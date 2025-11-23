# LanguageSwitcher

Единый компонент для переключения языка в приложении. Используется в Header и Sidebar.

## Использование

```tsx
import { LanguageSwitcher } from '@/design-system/composites/LanguageSwitcher';

<LanguageSwitcher 
  variant="compact" 
  showFlags={true}
  className="custom-class"
/>
```

## Props

- `variant?: 'button' | 'compact'` - Вариант отображения (по умолчанию `'button'`)
- `className?: string` - Дополнительные CSS классы
- `showFlags?: boolean` - Показывать ли флаги стран (по умолчанию `true`)

## Функциональность

- Автоматически синхронизирует язык с:
  - `i18n` (react-i18next)
  - `languageStore` (Zustand)
  - URL (через `buildPathWithLang`)
  - `document.documentElement.lang`
- Сохраняет query параметры и hash при переключении языка
- Использует `changeLanguage` из `@/services/i18n` для загрузки всех модулей переводов

## Размещение

Компонент должен быть размещен:
- В `Header` (для десктопной версии)
- В `Sidebar` и `AdminSidebar` (для мобильной и десктопной версий)

## Примеры использования

### В Header
```tsx
<div className="hidden xl:block">
  <LanguageSwitcher variant="compact" />
</div>
```

### В Sidebar
```tsx
<LanguageSwitcher variant="compact" />
```

