# 🚨 КРИТИЧЕСКОЕ ДОПОЛНЕНИЕ к Этапу 1

## ❌ ПРОПУЩЕНО: Применение Auth Flow в реальной логике

### Что есть сейчас:
- ✅ AuthFlowBuilderPage (админ настраивает)
- ✅ API для сохранения/получения config
- ✅ Frontend загружает config

### Что НЕ работает:
- ❌ **Backend НЕ применяет auth_flow_config при входе/регистрации**
- ❌ **Frontend НЕ строит форму по config**
- ❌ **Нет пошаговой валидации**

---

## 🔴 КРИТИЧНО: Надо реализовать СЕЙЧАС

### Backend:

#### 1. Новый сервис: AuthFlowService
```typescript
// backend/src/auth/services/auth-flow.service.ts
@Injectable()
export class AuthFlowService {
  async getLoginFlow(): Promise<AuthMethod[]> {
    // Получить config.login
  }
  
  async getRegistrationFlow(): Promise<AuthMethod[]> {
    // Получить config.registration
  }
  
  async getFactorsFlow(): Promise<AuthMethod[]> {
    // Получить config.factors
  }
  
  async validateStep(userId: string, step: string, data: any): Promise<{
    success: boolean;
    nextStep?: string;
    completed?: boolean;
  }> {
    // Валидация текущего шага
    // Возврат следующего шага или completion
  }
}
```

#### 2. Обновить AuthService.login()
```typescript
async login(dto: LoginDto) {
  // 1. Получить login flow из config
  const flow = await this.authFlowService.getLoginFlow();
  
  // 2. Определить текущий шаг
  const currentStep = this.determineCurrentStep(dto, flow);
  
  // 3. Валидировать текущий шаг
  const validation = await this.authFlowService.validateStep(userId, currentStep, dto);
  
  // 4. Если не все шаги пройдены - вернуть nextStep
  if (!validation.completed) {
    return {
      requiresNextStep: true,
      nextStep: validation.nextStep,
      userId
    };
  }
  
  // 5. Все шаги пройдены - выдать токены
  return this.generateTokens(user);
}
```

#### 3. Новые endpoints для пошагового входа
```typescript
@Post('auth/step')
async loginStep(@Body() dto: {
  stepId: string;
  sessionId: string;
  data: any;
}) {
  // Валидация шага
  // Возврат следующего шага или токенов
}
```

### Frontend:

#### 1. Динамическая форма входа
```typescript
// AuthPage.tsx
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const loginSteps = publicAuthFlow?.login || [];
const currentStep = loginSteps[currentStepIndex];

const renderStep = (step: AuthMethod) => {
  switch (step.id) {
    case 'phone-email':
      return <InputField type="universal" />;
    case 'password':
      return <InputField type="password" />;
    case 'sms-code':
      return <CodeInput />;
    // ...
  }
};

const handleNext = async () => {
  // Валидация текущего шага
  // Переход к следующему
  setCurrentStepIndex(currentStepIndex + 1);
};
```

#### 2. Аналогично для регистрации

---

## ⏱️ Временная оценка

| Задача | Время |
|--------|-------|
| Backend: AuthFlowService | 2 часа |
| Backend: Обновить login/register | 2 часа |
| Backend: Endpoints для шагов | 1 час |
| Frontend: Динамическая форма входа | 3 часа |
| Frontend: Динамическая форма регистрации | 2 часа |
| Тестирование | 2 часа |
| **ИТОГО** | **12 часов (1.5 дня)** |

---

## 🎯 Статус

**КРИТИЧНО - Должно быть реализовано в ЭТАПЕ 1!**

Без этого админ может настраивать Auth Flow, но он не будет применяться при реальном входе/регистрации.

---

Создано: [Текущая дата]  
Статус: ⏳ Требует немедленной реализации

