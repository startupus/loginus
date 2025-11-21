# Руководство по использованию дизайн-системы Loginus ID

## Быстрый старт

### Импорт компонентов

```typescript
// ✅ Правильно - из единой точки экспорта
import { Button, Input, Modal, DataSection } from '@/design-system';

// ✅ Правильно - прямой импорт для tree-shaking
import { Button } from '@/design-system/primitives/Button';
import { DataSection } from '@/design-system/composites/DataSection';
```

### Использование темы

```typescript
import { useTheme } from '@/design-system/contexts';
import { themeClasses } from '@/design-system/utils';

function MyComponent() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  
  return (
    <div className={themeClasses.card.default}>
      <h1 className={themeClasses.text.primary}>Заголовок</h1>
    </div>
  );
}
```

### Использование i18n

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Button>{t('common.save', 'Сохранить')}</Button>
  );
}
```

---

## Primitives (Атомарные компоненты)

### Button

```typescript
import { Button } from '@/design-system/primitives/Button';

// Основное действие
<Button variant="primary" fullWidth>Войти</Button>

// С иконками
<Button variant="outline" leftIcon={<Icon name="plus" />}>
  Добавить
</Button>

// Состояние загрузки
<Button variant="primary" loading>Отправка...</Button>

// Только иконка
<Button variant="ghost" iconOnly>
  <Icon name="settings" />
</Button>
```

**Варианты:** `primary`, `secondary`, `outline`, `ghost`, `error`, `success`, `warning`, `link`  
**Размеры:** `xs`, `sm`, `md`, `lg`, `xl`

### Input

```typescript
import { Input } from '@/design-system/primitives/Input';

// Базовое поле
<Input 
  label="Email" 
  placeholder={t('auth.emailPlaceholder', 'Введите email')}
/>

// С иконками
<Input 
  label="Телефон"
  leftIcon={<Icon name="phone" />}
  error="Неверный формат"
/>

// С подсказкой
<Input 
  label="Пароль"
  type="password"
  helperText="Минимум 8 символов"
/>
```

### UniversalInput

```typescript
import { UniversalInput } from '@/design-system/primitives/UniversalInput';

// Автоматическое определение типа (телефон/email)
<UniversalInput
  value={contact}
  onChange={setContact}
  placeholder={t('auth.contactPlaceholder', 'Телефон или email')}
/>
```

### CodeInput

```typescript
import { CodeInput } from '@/design-system/primitives/CodeInput';

<CodeInput
  length={6}
  value={code}
  onChange={setCode}
  onComplete={(code) => handleVerify(code)}
/>
```

### Badge

```typescript
import { Badge } from '@/design-system/primitives/Badge';

<Badge variant="primary">Новое</Badge>
<Badge variant="success" rounded="full">Активно</Badge>
<Badge variant="danger" outline>Ошибка</Badge>
```

---

## Composites (Молекулярные компоненты)

### Modal

```typescript
import { Modal } from '@/design-system/composites/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title={t('modal.title', 'Подтверждение')}
>
  <p>{t('modal.message', 'Вы уверены?')}</p>
  <Button onClick={handleConfirm}>Подтвердить</Button>
</Modal>
```

### DataSection

```typescript
import { DataSection } from '@/design-system/composites/DataSection';

<DataSection
  id="documents"
  title={t('data.documents', 'Документы')}
  description={t('data.documentsDescription', 'Ваши документы')}
  viewAllLink={{ 
    label: t('common.viewAll', 'Все документы'), 
    href: '/data/documents' 
  }}
>
  <DocumentsList />
</DataSection>
```

### Tabs

```typescript
import { Tabs } from '@/design-system/composites/Tabs';

<Tabs
  tabs={[
    { id: 'tab1', label: t('tabs.first', 'Первая') },
    { id: 'tab2', label: t('tabs.second', 'Вторая') },
  ]}
  activeTab="tab1"
  onChange={(id) => setActiveTab(id)}
/>
```

---

## Layouts (Организмы)

### PageTemplate

```typescript
import { PageTemplate } from '@/design-system/layouts/PageTemplate';

<PageTemplate 
  title={t('page.title', 'Заголовок страницы')}
  showSidebar={true}
>
  <YourContent />
</PageTemplate>
```

### AuthPageLayout

```typescript
import { AuthPageLayout } from '@/design-system/composites/AuthPageLayout';

<AuthPageLayout
  header={{
    showBack: true,
    onBack: () => navigate(-1),
    logo: <Logo />
  }}
  footer={{
    text: t('auth.footer', 'Продолжая, вы соглашаетесь'),
    links: [
      { href: '/terms', text: t('auth.terms', 'Условиями') }
    ]
  }}
>
  <YourAuthForm />
</AuthPageLayout>
```

---

## Темы

### Переключение темы

```typescript
import { useTheme } from '@/design-system/contexts';

function ThemeSwitcher() {
  const { themeMode, setThemeMode } = useTheme();
  
  return (
    <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
      {themeMode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Использование themeClasses

```typescript
import { themeClasses } from '@/design-system/utils';

// Карточки
<div className={themeClasses.card.default}>...</div>
<div className={themeClasses.card.shadow}>...</div>
<div className={themeClasses.card.roundedShadow}>...</div>

// Текст
<h1 className={themeClasses.text.primary}>...</h1>
<p className={themeClasses.text.secondary}>...</p>

// Фоны
<div className={themeClasses.background.default}>...</div>
<div className={themeClasses.background.surfaceElevated}>...</div>

// Границы
<div className={themeClasses.border.default}>...</div>
<div className={themeClasses.border.top}>...</div>
```

---

## Лучшие практики

### ✅ Правильно

```typescript
// Использование компонентов дизайн-системы
import { Button, Input } from '@/design-system';

// Использование themeClasses
<div className={themeClasses.card.default}>

// Использование i18n
{t('common.save', 'Сохранить')}

// Композиция компонентов
<DataSection>
  <Button>Добавить</Button>
</DataSection>
```

### ❌ Неправильно

```typescript
// Создание собственных компонентов вместо использования дизайн-системы
<button className="btn-primary">Click</button>

// Hardcoded классы вместо themeClasses
<div className="bg-white dark:bg-dark-2">

// Hardcoded строки вместо i18n
<Button>Сохранить</Button>

// Дублирование функциональности
const MyButton = () => <button>...</button>
```

---

## Структура компонентов

### Primitives
- Базовые компоненты без бизнес-логики
- Принимают все данные через props
- Полностью переиспользуемые
- Поддержка темной/светлой темы

### Composites
- Составные из primitives
- Минимальная логика
- Используют primitives внутри

### Layouts
- Макеты страниц
- Композиция composites
- Структурные компоненты

### Business Components
- Доменная логика
- Используют design-system + API
- Специфичные для модуля

---

## Примеры использования

### Форма авторизации

```typescript
import { AuthPageLayout } from '@/design-system/composites/AuthPageLayout';
import { UniversalInput } from '@/design-system/primitives/UniversalInput';
import { Button } from '@/design-system/primitives/Button';

function AuthPage() {
  const [contact, setContact] = useState('');
  const { t } = useTranslation();
  
  return (
    <AuthPageLayout>
      <UniversalInput
        value={contact}
        onChange={setContact}
        placeholder={t('auth.contactPlaceholder', 'Телефон или email')}
      />
      <Button variant="primary" fullWidth>
        {t('auth.continue', 'Продолжить')}
      </Button>
    </AuthPageLayout>
  );
}
```

### Страница с данными

```typescript
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { Button } from '@/design-system/primitives/Button';

function DataPage() {
  const { t } = useTranslation();
  
  return (
    <PageTemplate title={t('data.title', 'Мои данные')} showSidebar={true}>
      <DataSection
        title={t('data.documents', 'Документы')}
        action={<Button>{t('common.add', 'Добавить')}</Button>}
      >
        <DocumentsList />
      </DataSection>
    </PageTemplate>
  );
}
```

---

## Поддержка

При возникновении вопросов:
1. Проверьте документацию компонента в `design-system/README.md`
2. Посмотрите примеры использования в существующих страницах
3. Следуйте принципам Atomic Design

---

*Версия: 1.0*  
*Последнее обновление: Декабрь 2024*

