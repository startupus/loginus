# Рекомендации по переиспользуемым компонентам для страниц авторизации

## Анализ общих паттернов

После анализа 8 экранов флоу авторизации Яндекс ID выявлены следующие повторяющиеся паттерны:

### 1. Структура страницы
Все страницы имеют единообразную структуру:
- **Header** с кнопкой "Назад" и логотипом
- **Main content** с заголовком, подзаголовком и формой
- **Footer** с текстом и ссылками

### 2. Элементы управления
- Кнопки действий (primary, secondary, text)
- Поля ввода (универсальные, код)
- Сообщения об ошибках
- Таймеры для повторной отправки
- Иллюстрации/иконки

### 3. Состояния
- Loading (загрузка)
- Error (ошибка)
- Success (успех)
- Disabled (отключено)

---

## Архитектура компонентов

### Уровень 1: Primitives (Базовые компоненты)

#### 1.1 Button
**Использование:** Все страницы (8/8)

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'text' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

// Примеры использования:
<Button variant="primary" fullWidth>Войти</Button>
<Button variant="secondary">Изменить номер</Button>
<Button variant="text" disabled>Не пришёл код?</Button>
<Button variant="ghost" icon={<ArrowLeft />}>Назад</Button>
```

**Варианты:**
- `primary` - основное действие (Войти, Продолжить, Далее)
- `secondary` - второстепенное действие (Изменить номер)
- `outline` - альтернативные методы (QR-код, Биометрия)
- `text` - текстовые ссылки (Не помню, Не пришёл код)
- `ghost` - кнопка "Назад" в header

---

#### 1.2 Input
**Использование:** 6/8 страниц

```tsx
interface InputProps {
  type?: 'text' | 'tel' | 'email' | 'password';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  prefix?: ReactNode; // Флаг страны для телефона
  suffix?: ReactNode; // Иконка очистки
}

// Примеры:
<Input 
  type="tel"
  placeholder="Телефон или email"
  value={phone}
  onChange={setPhone}
  error={errors.phone}
  prefix={<Flag country="RU" />}
/>

<Input 
  label="Имя"
  value={firstName}
  onChange={setFirstName}
  required
/>
```

---

#### 1.3 CodeInput
**Использование:** 2/8 страниц (подтверждение кода)

```tsx
interface CodeInputProps {
  length: number; // Обычно 6
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

// Особенности:
// - Автоматический переход между полями
// - Поддержка Backspace для возврата
// - Валидация только цифр
// - Автоматический вызов onComplete при заполнении
```

---

#### 1.4 Text
**Использование:** Все страницы (8/8)

```tsx
interface TextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
}

// Примеры:
<Text size="lg" weight="bold">Введите номер телефона</Text>
<Text size="sm" color="muted">Чтобы войти или зарегистрироваться</Text>
<Text color="error">Неправильный код, попробуйте ещё раз</Text>
```

---

#### 1.5 Link
**Использование:** 7/8 страниц

```tsx
interface LinkProps {
  href: string;
  external?: boolean;
  children: ReactNode;
  variant?: 'default' | 'muted';
}

// Примеры:
<Link href="/terms">пользовательское соглашение</Link>
<Link href="/support">Написать в поддержку</Link>
```

---

#### 1.6 Icon
**Использование:** Все страницы (8/8)

```tsx
interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

// Используемые иконки:
// - arrow-left (кнопка Назад)
// - fingerprint (биометрия)
// - qr-code (QR-код)
// - phone (телефон)
// - message (SMS)
// - telegram (Telegram)
// - alert-circle (ошибки)
// - check-circle (успех)
```

---

### Уровень 2: Composites (Составные компоненты)

#### 2.1 AuthPageLayout
**Использование:** Все страницы (8/8)

**Структура:**
```tsx
interface AuthPageLayoutProps {
  header?: {
    showBack?: boolean;
    onBack?: () => void;
    logo?: ReactNode;
    title?: string;
  };
  children: ReactNode;
  footer?: {
    text?: string;
    links?: Array<{ href: string; text: string }>;
  };
  background?: 'default' | 'image' | 'gradient';
}

// Пример использования:
<AuthPageLayout
  header={{
    showBack: true,
    onBack: () => navigate(-1),
    logo: <Logo />
  }}
  footer={{
    text: "Яндекс ID — ключ от всех сервисов",
    links: [
      { href: "/about", text: "Узнать больше" }
    ]
  }}
>
  {/* Контент страницы */}
</AuthPageLayout>
```

**Преимущества:**
- Единообразный layout для всех страниц
- Централизованное управление header/footer
- Легко менять дизайн всех страниц сразу

---

#### 2.2 PageHeader
**Использование:** Все страницы (8/8)

```tsx
interface PageHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  logo?: ReactNode;
  title?: string;
  subtitle?: string;
}

// Пример:
<PageHeader
  showBack
  onBack={() => navigate(-1)}
  logo={<Logo />}
/>
```

---

#### 2.3 PageContent
**Использование:** Все страницы (8/8)

```tsx
interface PageContentProps {
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

// Пример:
<PageContent
  title="Введите номер телефона"
  subtitle="Чтобы войти или зарегистрироваться"
  maxWidth="sm"
>
  <UniversalInput ... />
  <Button ... />
</PageContent>
```

---

#### 2.4 PageFooter
**Использование:** 7/8 страниц

```tsx
interface PageFooterProps {
  text?: string;
  links?: Array<{ href: string; text: string }>;
  showGlobalFooter?: boolean; // "Используйте режим инкогнито..."
}

// Пример:
<PageFooter
  text="Яндекс ID — ключ от всех сервисов"
  links={[
    { href: "/about", text: "Узнать больше" }
  ]}
  showGlobalFooter
/>
```

---

#### 2.5 UniversalInput
**Использование:** 2/8 страниц (но критично)

```tsx
interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

// Особенности:
// - Автоматическое определение типа (телефон/email)
// - Визуальная индикация типа
// - Префикс для телефона (флаг + код страны)
// - Валидация в реальном времени
```

---

#### 2.6 ContactDisplay
**Использование:** 3/8 страниц

```tsx
interface ContactDisplayProps {
  contact: string;
  type: 'phone' | 'email';
  masked?: boolean; // +7 995 ***-**-44
  showChange?: boolean;
  onChangeClick?: () => void;
}

// Пример:
<ContactDisplay
  contact="+7 995 150-34-44"
  type="phone"
  masked
  showChange
  onChangeClick={() => navigate('/auth')}
/>
```

---

#### 2.7 ErrorMessage
**Использование:** 4/8 страниц

```tsx
interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
  retryable?: boolean;
}

// Пример:
<ErrorMessage
  error="Неправильный код, попробуйте ещё раз"
  onRetry={handleResend}
  retryable
/>
```

---

#### 2.8 ResendTimer
**Использование:** 2/8 страниц

```tsx
interface ResendTimerProps {
  initialSeconds: number; // Обычно 60
  onResend: () => void;
  disabled?: boolean;
  label?: string;
}

// Пример:
<ResendTimer
  initialSeconds={60}
  onResend={handleResend}
  label="Повторно код можно будет отправить через"
/>
```

---

#### 2.9 Illustration
**Использование:** 2/8 страниц

```tsx
interface IllustrationProps {
  type: 'welcome' | 'error' | 'success' | 'empty';
  size?: 'sm' | 'md' | 'lg';
}

// Типы:
// - welcome: летающая тарелка (для "Нет аккаунта")
// - error: предупреждение
// - success: галочка
// - empty: пустое состояние
```

---

#### 2.10 MethodCard
**Использование:** 1/8 страниц (но расширяемо)

```tsx
interface MethodCardProps {
  method: {
    type: 'sms' | 'call' | 'telegram' | 'biometric' | 'qr';
    title: string;
    description: string;
    icon: string;
    available: boolean;
  };
  onClick: () => void;
  selected?: boolean;
}

// Пример:
<MethodCard
  method={{
    type: 'telegram',
    title: 'Telegram',
    description: 'Код в чате «Verification Codes»',
    icon: 'telegram',
    available: true
  }}
  onClick={() => handleSelectMethod('telegram')}
/>
```

---

### Уровень 3: Layouts (Макеты страниц)

#### 3.1 AuthFlowLayout
**Использование:** Все страницы авторизации

```tsx
interface AuthFlowLayoutProps {
  step?: number;
  totalSteps?: number;
  showProgress?: boolean;
  children: ReactNode;
}

// Особенности:
// - Единый стиль для всех страниц флоу
// - Опциональный прогресс-бар
// - Центрированный контент
// - Фоновое изображение
```

---

#### 3.2 ModalLayout
**Использование:** Для модальных окон

```tsx
interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

---

### Уровень 4: Hooks (Логика)

#### 4.1 useInputValidation
**Использование:** Все формы

```tsx
function useInputValidation(
  value: string,
  type: 'phone' | 'email' | 'universal'
) {
  return {
    isValid: boolean;
    error: string | null;
    normalizedValue: string | null;
  };
}
```

---

#### 4.2 useCodeInput
**Использование:** Страницы ввода кода

```tsx
function useCodeInput(length: number) {
  return {
    values: string[];
    setValue: (index: number, value: string) => void;
    clear: () => void;
    isComplete: boolean;
    code: string;
  };
}
```

---

#### 4.3 useResendTimer
**Использование:** Страницы с повторной отправкой

```tsx
function useResendTimer(initialSeconds: number) {
  return {
    seconds: number;
    canResend: boolean;
    reset: () => void;
    format: string; // "00:60"
  };
}
```

---

#### 4.4 useContactMasking
**Использование:** Отображение контактов

```tsx
function useContactMasking(contact: string, type: 'phone' | 'email') {
  return {
    masked: string; // +7 995 ***-**-44
    full: string;
    lastDigits: string; // последние 4 цифры
  };
}
```

---

## Рекомендуемая структура папок

```
src/
├── components/
│   ├── primitives/          # Базовые компоненты
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── CodeInput/
│   │   ├── Text/
│   │   ├── Link/
│   │   └── Icon/
│   │
│   ├── composites/          # Составные компоненты
│   │   ├── AuthPageLayout/
│   │   ├── PageHeader/
│   │   ├── PageContent/
│   │   ├── PageFooter/
│   │   ├── UniversalInput/
│   │   ├── ContactDisplay/
│   │   ├── ErrorMessage/
│   │   ├── ResendTimer/
│   │   ├── Illustration/
│   │   └── MethodCard/
│   │
│   └── layouts/             # Макеты
│       ├── AuthFlowLayout/
│       └── ModalLayout/
│
├── hooks/                   # Переиспользуемые хуки
│   ├── useInputValidation.ts
│   ├── useCodeInput.ts
│   ├── useResendTimer.ts
│   └── useContactMasking.ts
│
└── utils/                   # Утилиты
    ├── validation.ts
    ├── formatting.ts
    └── masking.ts
```

---

## Принципы переиспользования

### 1. Single Responsibility
Каждый компонент отвечает за одну задачу:
- `Button` - только кнопка
- `Input` - только поле ввода
- `CodeInput` - только ввод кода

### 2. Composition over Inheritance
Собираем сложные компоненты из простых:
```tsx
<AuthPageLayout>
  <PageHeader />
  <PageContent>
    <UniversalInput />
    <Button />
  </PageContent>
  <PageFooter />
</AuthPageLayout>
```

### 3. Props Interface
Чёткие интерфейсы для всех компонентов:
- Обязательные props явно указаны
- Опциональные props имеют значения по умолчанию
- Типизация через TypeScript

### 4. Variant-based Design
Используем варианты вместо создания новых компонентов:
```tsx
<Button variant="primary" />   // Вместо <PrimaryButton />
<Button variant="secondary" /> // Вместо <SecondaryButton />
<Text color="error" />         // Вместо <ErrorText />
```

### 5. Controlled Components
Все инпуты контролируемые:
```tsx
// ✅ Правильно
<Input value={value} onChange={setValue} />

// ❌ Неправильно
<Input defaultValue={value} />
```

---

## Примеры использования

### Пример 1: Страница ввода телефона

```tsx
function AuthPage() {
  const [phone, setPhone] = useState('');
  const { isValid, error } = useInputValidation(phone, 'universal');
  
  return (
    <AuthPageLayout
      header={{ showBack: false, logo: <Logo /> }}
      footer={{
        text: "Нажимая «Продолжить», вы принимаете",
        links: [
          { href: "/terms", text: "пользовательское соглашение" },
          { href: "/privacy", text: "политику конфиденциальности" }
        ]
      }}
    >
      <PageContent
        title="Введите номер телефона"
        subtitle="Чтобы войти или зарегистрироваться"
      >
        <UniversalInput
          value={phone}
          onChange={setPhone}
          error={error}
          autoFocus
        />
        
        <Button
          variant="primary"
          fullWidth
          disabled={!isValid}
          onClick={handleContinue}
        >
          Продолжить
        </Button>
        
        <div className="alternative-methods">
          <Button variant="outline" onClick={handleBiometric}>
            <Icon name="fingerprint" />
            По лицу или отпечатку
          </Button>
          <Button variant="outline" onClick={handleQR}>
            <Icon name="qr-code" />
            QR-код
          </Button>
        </div>
      </PageContent>
    </AuthPageLayout>
  );
}
```

---

### Пример 2: Страница ввода кода

```tsx
function VerifyCodePage() {
  const { values, setValue, isComplete, code } = useCodeInput(6);
  const { seconds, canResend, reset } = useResendTimer(60);
  const { masked } = useContactMasking(contact, 'phone');
  
  return (
    <AuthPageLayout
      header={{ showBack: true, onBack: () => navigate(-1) }}
    >
      <PageContent
        title="Введите код подтверждения"
        subtitle={`Отправили SMS на ${masked}`}
      >
        <CodeInput
          length={6}
          values={values}
          onChange={setValue}
          onComplete={handleVerify}
        />
        
        {error && (
          <ErrorMessage
            error={error}
            onRetry={handleResend}
            retryable
          />
        )}
        
        <Button
          variant="primary"
          fullWidth
          disabled={!isComplete}
          onClick={handleVerify}
          loading={isVerifying}
        >
          Продолжить
        </Button>
        
        <ResendTimer
          seconds={seconds}
          canResend={canResend}
          onResend={handleResend}
          label="Повторно код можно будет отправить через"
        />
      </PageContent>
    </AuthPageLayout>
  );
}
```

---

### Пример 3: Страница "Нет аккаунта"

```tsx
function NoAccountPage() {
  const { masked } = useContactMasking(contact, 'phone');
  
  return (
    <AuthPageLayout
      header={{ showBack: true, onBack: () => navigate(-1) }}
    >
      <PageContent
        title="Нет аккаунтов с этим номером"
        subtitle="Можно зарегистрировать новый аккаунт"
        illustration={<Illustration type="welcome" />}
      >
        <ContactDisplay
          contact={contact}
          type="phone"
          showChange
          onChangeClick={() => navigate('/auth')}
        />
        
        <div className="action-buttons">
          <Button variant="secondary" onClick={handleChangeContact}>
            Изменить номер
          </Button>
          <Button variant="primary" onClick={handleCreateAccount}>
            Создать новый аккаунт
          </Button>
        </div>
      </PageContent>
    </AuthPageLayout>
  );
}
```

---

## Чеклист реализации

### Phase 1: Primitives
- [ ] Button (5 вариантов)
- [ ] Input (с поддержкой prefix/suffix)
- [ ] CodeInput (6 полей)
- [ ] Text (размеры, веса, цвета)
- [ ] Link
- [ ] Icon

### Phase 2: Composites
- [ ] AuthPageLayout
- [ ] PageHeader
- [ ] PageContent
- [ ] PageFooter
- [ ] UniversalInput
- [ ] ContactDisplay
- [ ] ErrorMessage
- [ ] ResendTimer
- [ ] Illustration
- [ ] MethodCard

### Phase 3: Hooks
- [ ] useInputValidation
- [ ] useCodeInput
- [ ] useResendTimer
- [ ] useContactMasking

### Phase 4: Utils
- [ ] validation.ts (detectInputType, normalizePhone, etc.)
- [ ] formatting.ts (formatPhone, formatCode, etc.)
- [ ] masking.ts (maskPhone, maskEmail, etc.)

---

## Преимущества подхода

1. **Консистентность** - все страницы выглядят одинаково
2. **Поддерживаемость** - изменения в одном месте применяются везде
3. **Тестируемость** - легко тестировать изолированные компоненты
4. **Масштабируемость** - легко добавлять новые страницы
5. **Производительность** - переиспользование кода уменьшает bundle size
6. **Документированность** - чёткие интерфейсы служат документацией

---

## Метрики переиспользования

После внедрения компонентов ожидаемые метрики:

- **Сокращение кода:** ~60% (с ~2000 строк до ~800 строк)
- **Компонентов на страницу:** 5-8 переиспользуемых компонентов
- **Дублирование кода:** <5% (только специфичная бизнес-логика)
- **Время разработки новой страницы:** -70% (с 4 часов до 1 часа)

---

## Заключение

Предложенная архитектура компонентов обеспечивает:

1. **Максимальное переиспользование** - один компонент используется на многих страницах
2. **Гибкость** - легко кастомизировать через props
3. **Типобезопасность** - полная типизация через TypeScript
4. **Производительность** - оптимизированные компоненты
5. **Доступность** - встроенная поддержка a11y

Все компоненты должны быть реализованы с учётом:
- Темной темы
- Адаптивности (mobile-first)
- Accessibility (ARIA, keyboard navigation)
- Интернационализации (i18n)

