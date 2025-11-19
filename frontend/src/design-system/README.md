# Loginus Design System

Единая дизайн-система для проекта Loginus ID, построенная на принципах Atomic Design и обеспечивающая переиспользование компонентов, глобальную тематизацию и мультиязычность.

## Структура

```
design-system/
├── primitives/      # Атомарные компоненты (Atoms)
├── composites/      # Молекулярные компоненты (Molecules)
├── layouts/         # Организмы (Organisms)
├── contexts/        # React контексты (Theme, Language)
├── themes/          # Токены и темы
└── tailgrids-bank/ # Банк компонентов TailGrids
```

## Принципы

### 1. Atomic Design

- **Primitives (Atoms)**: Базовые компоненты без бизнес-логики
  - `Button`, `Input`, `Badge`, `Avatar`, `Icon`, `Logo`, `CodeInput`, `UniversalInput`, `Separator`
  
- **Composites (Molecules)**: Составные компоненты из primitives
  - `Modal`, `Tabs`, `Switch`, `DataSection`, `WidgetCard`, `AuthPageLayout`, `ContactDisplay`, `ErrorMessage`, `ResendTimer`, `ServiceLink`, `PhoneVerificationCard`, `ProfilePopup`, `ServiceCard`, `FeatureCard`, `FAQItem`, `SectionHeader`, `TrustIndicator`, `LinkButton`
  
- **Layouts (Organisms)**: Макеты страниц
  - `LandingHeader`, `Sidebar`, `PageTemplate`, `Footer`

### 2. Single Source of Truth

- Все компоненты находятся в `design-system/`
- Единая точка экспорта: `design-system/index.ts`
- Централизованные токены тем в `themes/`

### 3. Composition over Inheritance

Компоненты строятся через композицию, а не наследование:

```tsx
// ✅ Правильно - композиция
<DataSection title="Документы">
  <Button>Добавить</Button>
</DataSection>

// ❌ Неправильно - дублирование
<div className="section">
  <h2>Документы</h2>
  <button>Добавить</button>
</div>
```

### 4. Theme-driven Design

- Глобальная тема через `ThemeContext`
- Поддержка светлой и темной темы через Tailwind `dark:` классы
- Все компоненты должны иметь `dark:` классы для темной темы

### 5. Мультиязычность

- Все тексты через `useTranslation()` из `react-i18next`
- Переводы в `services/i18n/locales/ru.json` и `en.json`
- Структура ключей: `section.subsection.key`

## Использование

### Импорт компонентов

```tsx
import { Button, Input, Modal } from '@/design-system';
import { useTheme } from '@/design-system/contexts';
import { LandingHeader, PageTemplate } from '@/design-system/layouts';
```

### Тема

```tsx
import { useTheme } from '@/design-system/contexts';

const MyComponent = () => {
  const { themeMode, setThemeMode, isDark } = useTheme();
  
  return (
    <div className="bg-white dark:bg-dark-2">
      <button onClick={() => setThemeMode(isDark ? 'light' : 'dark')}>
        Переключить тему
      </button>
    </div>
  );
};
```

### Мультиязычность

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('dashboard.title', 'Главная')}</h1>;
};
```

## Стандарты

### Обязательные требования

1. **Темная тема**: Все компоненты должны иметь `dark:` классы
   ```tsx
   <div className="bg-white dark:bg-dark-2 text-dark dark:text-white">
   ```

2. **i18n**: Все тексты через `t()`, никаких hardcoded строк
   ```tsx
   // ✅ Правильно
   <Button>{t('common.save', 'Сохранить')}</Button>
   
   // ❌ Неправильно
   <Button>Сохранить</Button>
   ```

3. **Переиспользование**: Используйте компоненты из дизайн-системы
   ```tsx
   // ✅ Правильно
   import { Button } from '@/design-system';
   
   // ❌ Неправильно
   <button className="btn-primary">Click</button>
   ```

4. **Типизация**: Все компоненты должны иметь TypeScript интерфейсы

## Компоненты

### Primitives

- `Button` - кнопка с вариантами (primary, outline, ghost)
- `Input` - поле ввода с поддержкой иконок и ошибок
- `UniversalInput` - универсальное поле для телефона/email
- `CodeInput` - ввод кода подтверждения (OTP)
- `Badge` - бейдж/метка
- `Avatar` - аватар пользователя
- `Icon` - иконка (SVG)
- `Logo` - логотип Loginus ID
- `Separator` - разделитель

### Composites

- `Modal` - модальное окно
- `Tabs` - вкладки
- `Switch` - переключатель
- `DataSection` - секция данных с заголовком
- `WidgetCard` - карточка виджета
- `AuthPageLayout` - layout для страниц авторизации
- `ContactDisplay` - отображение контакта (телефон/email)
- `ErrorMessage` - сообщение об ошибке
- `ResendTimer` - таймер повторной отправки
- `ServiceLink` - ссылка на сервис
- `PhoneVerificationCard` - карточка верификации телефона
- `ProfilePopup` - попап профиля пользователя
- `ServiceCard` - карточка сервиса
- `FeatureCard` - карточка функции
- `FAQItem` - элемент FAQ
- `SectionHeader` - заголовок секции
- `TrustIndicator` - индикатор доверия
- `LinkButton` - кнопка-ссылка

### Layouts

- `LandingHeader` - хедер для публичных страниц
- `Sidebar` - боковое меню
- `PageTemplate` - шаблон страницы
- `Footer` - футер

## API

Все компоненты используют единое API через `services/api/`:

- `authApi` - аутентификация
- `profileApi` - профиль пользователя
- Мок-данные передаются через NestJS backend-mock

## Документация компонентов

Каждый компонент должен иметь:
- TypeScript интерфейс с JSDoc комментариями
- Примеры использования в комментариях
- Поддержку темной темы
- Поддержку i18n (если содержит тексты)

## Обновление

При добавлении новых компонентов:

1. Разместите в соответствующей категории (primitives/composites/layouts)
2. Добавьте экспорт в `index.ts`
3. Добавьте поддержку темной темы (`dark:` классы)
4. Добавьте i18n для всех текстов
5. Обновите этот README

