# Loginus - Техническое задание: Система авторизации

## Обзор

Система авторизации Loginus должна предоставлять простой, безопасный и универсальный способ входа и регистрации пользователей. Основная концепция: **один универсальный инпут для телефона или email, автоматическое определение типа ввода, автоматическая регистрация при отсутствии аккаунта**.

## Референсы

- **VK ID:** `https://id.vk.com/auth` - универсальное поле, табы телефон/почта
- **Яндекс ID:** `https://passport.yandex.ru/auth/add` - универсальное поле, множественные методы подтверждения

## Основные принципы

1. **Универсальное поле ввода** - один инпут для телефона или email
2. **Автоматическое определение** - система сама определяет тип ввода
3. **Автоматическая регистрация** - если аккаунта нет, создаём автоматически
4. **Progressive Onboarding** - сбор дополнительных данных после регистрации
5. **Множественные методы подтверждения** - SMS, звонок, Telegram, биометрия
6. **Минималистичный дизайн** - только необходимое, без лишнего

---

## Экраны и состояния

### 1. Главный экран авторизации

**URL:** `/auth`  
**Компонент:** `AuthPage`

#### Структура

```tsx
<div className="auth-page">
  {/* Header */}
  <header className="auth-header">
    <Logo />
    <h1>Вход в Loginus</h1>
  </header>

  {/* Основной контент */}
  <main className="auth-content">
    {/* Универсальное поле ввода */}
    <UniversalInput
      placeholder="Телефон или email"
      onInput={handleInput}
      onBlur={handleBlur}
      error={errors.input}
    />

    {/* Кнопка действия */}
    <Button
      variant="primary"
      fullWidth
      disabled={!isValidInput}
      onClick={handleContinue}
    >
      {isExistingUser ? 'Войти' : 'Продолжить'}
    </Button>

    {/* Альтернативные методы */}
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
  </main>

  {/* Footer */}
  <footer className="auth-footer">
    <Text size="sm" color="muted">
      Нажимая «Продолжить», вы принимаете{' '}
      <Link href="/terms">пользовательское соглашение</Link> и{' '}
      <Link href="/privacy">политику конфиденциальности</Link>
    </Text>
  </footer>
</div>
```

#### Логика определения типа ввода

```typescript
function detectInputType(value: string): 'phone' | 'email' | null {
  // Удаляем все пробелы, дефисы, скобки
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  
  // Проверка на телефон (начинается с + или цифры, содержит только цифры)
  if (/^\+?\d+$/.test(cleaned) && cleaned.length >= 10) {
    return 'phone';
  }
  
  // Проверка на email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'email';
  }
  
  return null;
}
```

#### Валидация

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: string;
}

function validateInput(value: string): ValidationResult {
  const type = detectInputType(value);
  
  if (!type) {
    return {
      isValid: false,
      error: 'Введите телефон или email'
    };
  }
  
  if (type === 'phone') {
    const normalized = normalizePhone(value);
    if (!isValidPhone(normalized)) {
      return {
        isValid: false,
        error: 'Некорректный номер телефона'
      };
    }
    return {
      isValid: true,
      normalizedValue: normalized
    };
  }
  
  if (type === 'email') {
    if (!isValidEmail(value)) {
      return {
        isValid: false,
        error: 'Некорректный email'
      };
    }
    return {
      isValid: true,
      normalizedValue: value.toLowerCase().trim()
    };
  }
  
  return { isValid: false };
}
```

---

### 2. Экран ввода кода подтверждения

**URL:** `/auth/verify`  
**Компонент:** `VerifyCodePage`

#### Структура

```tsx
<div className="verify-page">
  <header className="verify-header">
    <Button variant="ghost" onClick={handleBack}>
      <Icon name="arrow-left" />
      Назад
    </Button>
    <Logo />
  </header>

  <main className="verify-content">
    <h1>Введите код подтверждения</h1>
    <Text color="muted">
      Отправили {method === 'sms' ? 'SMS' : 'сообщение'} на{' '}
      {maskContact(contact)}
    </Text>

    {/* Поле ввода кода */}
    <CodeInput
      length={6}
      onComplete={handleCodeComplete}
      autoFocus
    />

    {/* Кнопка действия */}
    <Button
      variant="primary"
      fullWidth
      disabled={!isCodeComplete}
      onClick={handleVerify}
      loading={isVerifying}
    >
      Продолжить
    </Button>

    {/* Альтернативные действия */}
    <div className="verify-actions">
      <Button
        variant="text"
        disabled={canResend}
        onClick={handleResend}
      >
        {canResend ? (
          <>Повторно код можно будет отправить через {timer}</>
        ) : (
          <>Не пришёл код?</>
        )}
      </Button>

      <Button variant="text" onClick={handleChangeMethod}>
        Изменить способ подтверждения
      </Button>
    </div>
  </main>
</div>
```

#### Компонент CodeInput

```tsx
interface CodeInputProps {
  length: number;
  onComplete: (code: string) => void;
  autoFocus?: boolean;
}

function CodeInput({ length, onComplete, autoFocus }: CodeInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Разрешаем только цифры
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1); // Только последний символ
    setValues(newValues);

    // Автоматический переход к следующему полю
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Проверка на завершение
    if (newValues.every(v => v) && newValues.join('').length === length) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="code-input-grid">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[index]}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          autoFocus={autoFocus && index === 0}
          className="code-input-digit"
        />
      ))}
    </div>
  );
}
```

---

### 3. Экран "Нет аккаунта" / Автоматическая регистрация

**URL:** `/auth/register`  
**Компонент:** `RegisterPage`

#### Структура

```tsx
<div className="register-page">
  <header className="register-header">
    <Button variant="ghost" onClick={handleBack}>
      <Icon name="arrow-left" />
      Назад
    </Button>
    <Logo />
  </header>

  <main className="register-content">
    {/* Иллюстрация */}
    <Illustration type="welcome" />

    <h1>Создаём ваш аккаунт</h1>
    <Text color="muted">
      Аккаунта с {maskContact(contact)} не найдено.
      Мы создадим новый аккаунт автоматически.
    </Text>

    {/* Отображение контакта */}
    <div className="contact-display">
      <Text size="lg" weight="bold">
        {contact}
      </Text>
      <Button variant="text" onClick={handleChangeContact}>
        Изменить
      </Button>
    </div>

    {/* Кнопка действия */}
    <Button
      variant="primary"
      fullWidth
      onClick={handleCreateAccount}
      loading={isCreating}
    >
      Создать аккаунт
    </Button>
  </main>
</div>
```

#### Логика автоматической регистрации

```typescript
async function createAccount(contact: string, type: 'phone' | 'email') {
  // 1. Отправляем код подтверждения
  const { sessionId } = await sendVerificationCode(contact, type);
  
  // 2. После подтверждения кода создаём аккаунт
  const account = await api.post('/auth/register', {
    contact,
    type,
    sessionId,
    verified: true
  });
  
  // 3. Автоматически логиним пользователя
  await login(account);
  
  // 4. Перенаправляем на онбординг
  navigate('/onboarding');
}
```

---

### 4. Экран онбординга (Progressive Onboarding)

**URL:** `/onboarding`  
**Компонент:** `OnboardingPage`

#### Структура (многошаговая форма)

```tsx
<div className="onboarding-page">
  <header className="onboarding-header">
    <ProgressBar current={currentStep} total={totalSteps} />
  </header>

  <main className="onboarding-content">
    {currentStep === 1 && <OnboardingStep1 />}
    {currentStep === 2 && <OnboardingStep2 />}
    {currentStep === 3 && <OnboardingStep3 />}
  </main>

  <footer className="onboarding-footer">
    <Button
      variant="primary"
      fullWidth
      onClick={handleNext}
      disabled={!isStepValid}
    >
      {currentStep === totalSteps ? 'Завершить' : 'Далее'}
    </Button>
    
    {currentStep > 1 && (
      <Button variant="text" onClick={handleBack}>
        Назад
      </Button>
    )}
  </footer>
</div>
```

#### Шаг 1: Имя и фамилия

```tsx
function OnboardingStep1() {
  return (
    <>
      <h1>Как вас зовут?</h1>
      <Text color="muted">
        Укажите ваше имя и фамилию
      </Text>

      <Input
        label="Имя"
        value={firstName}
        onChange={setFirstName}
        required
      />

      <Input
        label="Фамилия"
        value={lastName}
        onChange={setLastName}
        required
      />
    </>
  );
}
```

#### Шаг 2: Пароль (опционально)

```tsx
function OnboardingStep2() {
  return (
    <>
      <h1>Создайте пароль</h1>
      <Text color="muted">
        Пароль нужен для дополнительной безопасности.
        Можно пропустить и создать позже.
      </Text>

      <Input
        type="password"
        label="Пароль"
        value={password}
        onChange={setPassword}
        hint="Минимум 8 символов"
      />

      <Input
        type="password"
        label="Подтвердите пароль"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <Checkbox checked={skipPassword} onChange={setSkipPassword}>
        Пропустить, создать позже
      </Checkbox>
    </>
  );
}
```

#### Шаг 3: Согласие

```tsx
function OnboardingStep3() {
  return (
    <>
      <h1>Почти готово!</h1>
      <Text color="muted">
        Осталось принять условия использования
      </Text>

      <Checkbox checked={acceptTerms} onChange={setAcceptTerms} required>
        Я принимаю{' '}
        <Link href="/terms">пользовательское соглашение</Link> и{' '}
        <Link href="/privacy">политику конфиденциальности</Link>
      </Checkbox>

      <Checkbox checked={acceptNewsletter} onChange={setAcceptNewsletter}>
        Хочу получать новости и предложения
      </Checkbox>
    </>
  );
}
```

---

### 5. Экран выбора метода подтверждения

**URL:** `/auth/verify-method`  
**Компонент:** `VerifyMethodPage`

#### Структура

```tsx
<div className="verify-method-page">
  <header className="verify-method-header">
    <Button variant="ghost" onClick={handleBack}>
      <Icon name="arrow-left" />
      Назад
    </Button>
    <Logo />
  </header>

  <main className="verify-method-content">
    <h1>Выберите способ подтверждения</h1>
    <Text color="muted">
      Для {maskContact(contact)}
    </Text>

    <div className="method-list">
      {availableMethods.map(method => (
        <MethodCard
          key={method.type}
          method={method}
          onClick={() => handleSelectMethod(method.type)}
        />
      ))}
    </div>
  </main>
</div>
```

#### Компонент MethodCard

```tsx
interface MethodCardProps {
  method: VerificationMethod;
  onClick: () => void;
}

function MethodCard({ method, onClick }: MethodCardProps) {
  return (
    <button className="method-card" onClick={onClick}>
      <Icon name={method.icon} size="lg" />
      <div className="method-info">
        <Text weight="bold">{method.title}</Text>
        <Text size="sm" color="muted">{method.description}</Text>
      </div>
      <Icon name="chevron-right" />
    </button>
  );
}
```

#### Доступные методы

```typescript
const verificationMethods = {
  sms: {
    type: 'sms',
    icon: 'message',
    title: 'SMS-код',
    description: 'Код придёт в SMS-сообщении',
    available: true
  },
  call: {
    type: 'call',
    icon: 'phone',
    title: 'Звонок',
    description: 'Последние 6 цифр входящего номера',
    available: true
  },
  telegram: {
    type: 'telegram',
    icon: 'telegram',
    title: 'Telegram',
    description: 'Код в чате «Verification Codes»',
    available: hasTelegram
  },
  biometric: {
    type: 'biometric',
    icon: 'fingerprint',
    title: 'Биометрия',
    description: 'По лицу или отпечатку',
    available: hasBiometric
  }
};
```

---

## API эндпоинты

### 1. Проверка существования аккаунта

```typescript
POST /api/auth/check
Body: {
  contact: string; // телефон или email
  type: 'phone' | 'email';
}
Response: {
  exists: boolean;
  userId?: string;
  methods?: VerificationMethod[];
}
```

### 2. Отправка кода подтверждения

```typescript
POST /api/auth/send-code
Body: {
  contact: string;
  type: 'phone' | 'email';
  method: 'sms' | 'call' | 'telegram';
  sessionId?: string; // для повторной отправки
}
Response: {
  sessionId: string;
  expiresIn: number; // секунды
  canResendIn: number; // секунды
}
```

### 3. Проверка кода

```typescript
POST /api/auth/verify-code
Body: {
  sessionId: string;
  code: string;
}
Response: {
  verified: boolean;
  token?: string; // JWT токен для входа
  userId?: string;
  isNewUser?: boolean;
}
```

### 4. Регистрация нового пользователя

```typescript
POST /api/auth/register
Body: {
  contact: string;
  type: 'phone' | 'email';
  sessionId: string; // после подтверждения кода
  firstName?: string;
  lastName?: string;
  password?: string;
}
Response: {
  userId: string;
  token: string;
  requiresOnboarding: boolean;
}
```

### 5. Вход существующего пользователя

```typescript
POST /api/auth/login
Body: {
  contact: string;
  type: 'phone' | 'email';
  sessionId: string; // после подтверждения кода
}
Response: {
  userId: string;
  token: string;
  requiresOnboarding: boolean;
}
```

### 6. Биометрическая авторизация (WebAuthn)

```typescript
POST /api/auth/webauthn/challenge
Body: {
  userId?: string; // если известен
}
Response: {
  challenge: string;
  rpId: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
}

POST /api/auth/webauthn/verify
Body: {
  credential: AuthenticatorAssertionResponse;
  challenge: string;
}
Response: {
  verified: boolean;
  token?: string;
  userId?: string;
}
```

---

## Обработка ошибок

### Типы ошибок

```typescript
enum AuthError {
  INVALID_INPUT = 'INVALID_INPUT',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ACCOUNT_EXISTS = 'ACCOUNT_EXISTS',
  INVALID_CODE = 'INVALID_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  BIOMETRIC_NOT_AVAILABLE = 'BIOMETRIC_NOT_AVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### Сообщения об ошибках

```typescript
const errorMessages = {
  [AuthError.INVALID_INPUT]: 'Введите корректный телефон или email',
  [AuthError.ACCOUNT_NOT_FOUND]: 'Аккаунт не найден. Создадим новый?',
  [AuthError.INVALID_CODE]: 'Неправильный код, попробуйте ещё раз',
  [AuthError.CODE_EXPIRED]: 'Код истёк. Запросите новый',
  [AuthError.TOO_MANY_ATTEMPTS]: 'Слишком много попыток. Попробуйте позже',
  [AuthError.BIOMETRIC_NOT_AVAILABLE]: 'Биометрия недоступна на этом устройстве'
};
```

### Компонент отображения ошибок

```tsx
function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="error-message" role="alert">
      <Icon name="alert-circle" />
      <Text color="error">{errorMessages[error.type] || error.message}</Text>
      {error.retryable && (
        <Button variant="text" onClick={onRetry}>
          Попробовать снова
        </Button>
      )}
    </div>
  );
}
```

---

## Состояния и переходы

### State Machine

```typescript
type AuthState =
  | 'idle'
  | 'inputting'
  | 'checking'
  | 'verifying'
  | 'registering'
  | 'logging_in'
  | 'onboarding'
  | 'authenticated'
  | 'error';

type AuthEvent =
  | 'INPUT_CHANGE'
  | 'CONTINUE'
  | 'CODE_SENT'
  | 'CODE_VERIFIED'
  | 'ACCOUNT_CREATED'
  | 'LOGIN_SUCCESS'
  | 'ERROR'
  | 'RETRY';
```

### Диаграмма флоу

```
[Главный экран]
    ↓ (ввод телефона/email)
[Проверка аккаунта]
    ↓
    ├─→ Аккаунт найден → [Выбор метода] → [Ввод кода] → [Вход]
    │
    └─→ Аккаунт не найден → [Создание аккаунта] → [Ввод кода] → [Онбординг] → [Готово]
```

---

## Компоненты

### UniversalInput

```tsx
interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
}

function UniversalInput({
  value,
  onChange,
  onBlur,
  placeholder = 'Телефон или email',
  error,
  autoFocus
}: UniversalInputProps) {
  const [focused, setFocused] = useState(false);
  const inputType = detectInputType(value);

  return (
    <div className="universal-input">
      {inputType === 'phone' && (
        <div className="input-prefix">
          <Flag country="RU" />
          <Text>+7</Text>
        </div>
      )}
      <input
        type="text"
        inputMode={inputType === 'phone' ? 'tel' : 'email'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn('input', { 'input--error': error })}
      />
      {error && (
        <Text size="sm" color="error" className="input-error">
          {error}
        </Text>
      )}
    </div>
  );
}
```

---

## Безопасность

### Рекомендации

1. **Rate Limiting** - ограничение количества запросов кода (3 в минуту)
2. **Code Expiry** - код действителен 5 минут
3. **Attempts Limit** - максимум 5 попыток ввода кода
4. **Session Management** - безопасное хранение сессий
5. **CSRF Protection** - защита от CSRF атак
6. **Input Sanitization** - очистка всех входных данных
7. **HTTPS Only** - все запросы только по HTTPS

---

## Адаптивность

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Мобильная версия

- Полноэкранные модалки
- Увеличенные кнопки (минимум 44x44px)
- Оптимизация для одной руки
- Поддержка автозаполнения

---

## Accessibility

### Требования

1. **ARIA Labels** - все интерактивные элементы
2. **Keyboard Navigation** - полная поддержка клавиатуры
3. **Screen Readers** - поддержка скринридеров
4. **Focus Management** - видимый фокус
5. **Error Announcements** - объявление ошибок
6. **Color Contrast** - минимум WCAG AA

---

## Тестирование

### Unit тесты

- Валидация ввода
- Определение типа ввода
- Нормализация телефона/email
- Обработка ошибок

### Integration тесты

- Полный флоу регистрации
- Полный флоу входа
- Восстановление доступа
- Биометрическая авторизация

### E2E тесты (Playwright)

- Регистрация нового пользователя
- Вход существующего пользователя
- Обработка ошибок
- Альтернативные методы

---

## Приоритеты реализации

### Phase 1: MVP (Минимально жизнеспособный продукт)
1. Универсальное поле ввода
2. Определение типа ввода
3. Отправка SMS-кода
4. Проверка кода
5. Автоматическая регистрация
6. Базовый онбординг (имя, фамилия)

### Phase 2: Расширенные методы
1. Подтверждение звонком
2. Подтверждение через Telegram
3. Выбор метода подтверждения
4. Повторная отправка кода

### Phase 3: Дополнительные функции
1. Биометрическая авторизация (WebAuthn)
2. QR-код вход
3. Расширенный онбординг
4. Восстановление доступа

---

## Дизайн-система

### Цвета

```css
--color-primary: #0066FF;
--color-primary-hover: #0052CC;
--color-error: #FF3333;
--color-success: #00CC66;
--color-text: #1A1A1A;
--color-text-muted: #666666;
--color-border: #E0E0E0;
--color-background: #FFFFFF;
```

### Типографика

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-size-base: 16px;
--font-size-lg: 20px;
--font-size-xl: 24px;
--font-size-sm: 14px;
--line-height: 1.5;
```

### Spacing

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## Чеклист реализации

- [ ] Компонент UniversalInput
- [ ] Логика определения типа ввода
- [ ] Валидация телефона/email
- [ ] Компонент CodeInput (6 полей)
- [ ] API эндпоинт проверки аккаунта
- [ ] API эндпоинт отправки кода
- [ ] API эндпоинт проверки кода
- [ ] API эндпоинт регистрации
- [ ] API эндпоинт входа
- [ ] Страница авторизации
- [ ] Страница ввода кода
- [ ] Страница создания аккаунта
- [ ] Страница онбординга (3 шага)
- [ ] Обработка ошибок
- [ ] Rate limiting
- [ ] Unit тесты
- [ ] Integration тесты
- [ ] E2E тесты
- [ ] Адаптивная вёрстка
- [ ] Accessibility
- [ ] Документация

---

## Примечания

1. **Автоматическая регистрация** - ключевая фича, отличающая Loginus от других систем
2. **Progressive Onboarding** - сбор данных постепенно, не перегружая пользователя
3. **Множественные методы** - даём выбор пользователю, но SMS остаётся основным
4. **Минималистичный дизайн** - фокус на простоте и скорости
5. **Безопасность** - все методы подтверждения должны быть безопасными

