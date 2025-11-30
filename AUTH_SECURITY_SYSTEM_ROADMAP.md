# 🔐 Roadmap: Система Аутентификации и Безопасности

## 📋 Обзор проекта

Данный документ содержит полный план реализации системы аутентификации и безопасности для личного кабинета, включающей:

1. **Раздел "Алгоритм авторизации"** - настройка путей входа, регистрации и многофакторной аутентификации
2. **Раздел "Безопасность"** - управление способами входа, паролями, устройствами и активностью

---

## 🎯 Цели спринта

### 1. Алгоритм авторизации (Админ-панель)
- ✅ Настройка окна входа - порядок и типы окон для пользователя
- ✅ Настройка регистрации - выбор обязательных полей и их последовательности  
- ✅ Настройка факторов авторизации (2FA/MFA) - обязательные для всех пользователей

### 2. Безопасность (Личный кабинет пользователя)
- ⏳ Текущий способ входа - просмотр обязательных настроек + добавление дополнительных факторов
- ⏳ Обновление пароля - смена пароля с валидацией
- ⏳ Способы восстановления - варианты восстановления доступа
- ⏳ Контроль доступа - история активности на аккаунте
- ⏳ Ваши устройства - список устройств с уникальными ID
- ⏳ Выйти везде - массовый выход со всех устройств

---

## 📊 Текущее состояние (Аудит)

### ✅ Что уже реализовано на бэкенде:

#### 1. Базовая аутентификация
- **Файлы:** `backend/src/auth/auth.service.ts`, `backend/src/auth/auth.controller.ts`
- **Функционал:**
  - Регистрация (`register`) и логин (`login`)
  - Генерация JWT токенов (access + refresh)
  - Валидация пользователя по email/phone + password
  - Проверка 2FA/nFA перед выдачей токенов
  - Реферальная система

#### 2. Многофакторная аутентификация (nFA)
- **Файлы:** `backend/src/auth/services/nfa.service.ts`
- **Функционал:**
  - Отправка кодов по Email, Telegram, GitHub
  - Верификация кодов для каждого метода
  - Проверка статуса верификации (все методы подтверждены?)
  - Настройка nFA для пользователя (`configureNfa`)

#### 3. Аутентификация через OAuth провайдеры
- **Файлы:** 
  - `backend/src/auth/services/github-auth.service.ts`
  - `backend/src/auth/micro-modules/two-factor/telegram/telegram-2fa.service.ts`
- **Функционал:**
  - GitHub OAuth
  - Telegram OAuth
  - Отправка кодов через Telegram Bot

#### 4. Email и SMS сервисы
- **Файлы:** 
  - `backend/src/auth/email.service.ts`
  - `backend/src/auth/sms.service.ts`
- **Функционал:**
  - Отправка email с кодами верификации
  - Отправка SMS через Telegram (как fallback)
  - Шаблоны писем для разных событий

#### 5. Сессии и токены
- **Файлы:** 
  - `backend/src/auth/entities/refresh-token.entity.ts`
  - `backend/src/auth/entities/two-factor-code.entity.ts`
- **Функционал:**
  - RefreshToken entity с полями: `userId`, `token`, `expiresAt`, `isRevoked`, `userAgent`, `ipAddress`
  - TwoFactorCode entity с полями: `userId`, `code`, `type`, `status`, `verifiedAt`

#### 6. Безопасность и активность
- **Файлы:** 
  - `backend/src/security/security.service.ts`
  - `backend/src/security/security.controller.ts`
- **Функционал:**
  - `getDevices()` - список устройств пользователя (через refresh tokens)
  - `deleteDevice()` - удаление устройства (revoke token)
  - `getActivity()` - история активности из audit logs
  - `changePassword()` - смена пароля с валидацией старого
  - `updateAuthMethod()` - обновление основного способа входа
  - `setupRecoveryMethod()` - настройка способа восстановления

#### 7. Аудит логирование
- **Файлы:** `backend/src/audit/audit.service.ts`
- **Функционал:**
  - Логирование всех событий: login, logout, password-reset, auth-method-change
  - Сохранение userAgent, ipAddress, timestamp
  - API для получения истории: `getUserAuditHistory()`

#### 8. Алгоритм авторизации (Auth Flow)
- **Файлы:** 
  - `backend/src/admin/admin.controller.ts` (endpoints `/admin/auth-flow`)
  - `backend/src/auth/auth.controller.ts` (endpoint `/auth/flow`)
- **Функционал:**
  - GET `/admin/auth-flow` - получить конфигурацию (login, registration, factors)
  - PUT `/admin/auth-flow` - обновить конфигурацию
  - GET `/auth/flow` - публичная конфигурация для форм входа/регистрации
  - Хранение в settings: `auth_flow_config`

#### 9. User Entity (профиль)
- **Файл:** `backend/src/users/entities/user.entity.ts`
- **Поля:**
  - `primaryAuthMethod` - основной способ входа (EMAIL, PHONE_TELEGRAM, GITHUB и т.д.)
  - `emailAuthType` - тип аутентификации для EMAIL ('password' | 'code')
  - `hasEmailCode` - флаг наличия email-code как доп. фактора
  - `availableAuthMethods` - активные способы аутентификации
  - `mfaSettings` - настройки MFA (enabled, methods, backupCodes, requiredMethods)
  - `twoFactorEnabled`, `twoFactorMethods` - legacy 2FA
  - OAuth поля: `githubId`, `githubUsername`, `gosuslugiId`, `vkontakteId`
  - Статусы верификации: `emailVerified`, `phoneVerified`, `githubVerified`

### ✅ Что уже реализовано на фронтенде:

#### 1. Админ-панель: AuthFlowBuilderPage
- **Файл:** `frontend/src/pages/admin/AuthFlowBuilderPage.tsx`
- **Функционал:**
  - Drag & Drop конструктор для настройки методов входа
  - Две колонки: "Окно входа" и "Регистрация"
  - Третья колонка: "Факторы авторизации"
  - Добавление/удаление методов через модалку `AddAuthMethodModal`
  - Переключение primary метода
  - Автосохранение с debounce (1 секунда)
  - Интеграция с API: `authFlowApi.getAuthFlow()`, `authFlowApi.updateAuthFlow()`

#### 2. Страница безопасности: SecurityPage
- **Файл:** `frontend/src/pages/SecurityPage.tsx`
- **Функционал:**
  - Промо-блок "Усиленная защита"
  - Секция "Способ входа": текущий способ, обновление пароля, способы восстановления
  - Секция "Контроль доступа": события, устройства (с счетчиком), выход везде
  - Секция "Доступ к вашим данным": внешние аккаунты, управление доступами
  - Модалка `AuthMethodsModal` для настройки путей входа

#### 3. API сервисы
- **Файлы:**
  - `frontend/src/services/api/auth-flow.ts` - работа с алгоритмом авторизации
  - `frontend/src/services/api/security.ts` - работа с безопасностью (устройства, активность)
- **Функционал:**
  - `getAuthFlow()`, `updateAuthFlow()`, `getPublicAuthFlow()`
  - `getDevices()`, `deleteDevice()`, `getActivity()`

#### 4. Компоненты
- **Файлы:**
  - `frontend/src/components/admin/MethodColumn.tsx` - колонка методов с drag & drop
  - `frontend/src/components/admin/AddAuthMethodModal.tsx` - модалка добавления метода
  - `frontend/src/components/Modals/AuthMethodsModal.tsx` - модалка настройки способов входа
  - `frontend/src/design-system/composites/SecurityListItem.tsx` - элемент списка безопасности

---

## ⚠️ Что нужно доработать/реализовать:

### 🔴 КРИТИЧНЫЕ (High Priority)

#### Backend:

1. **Endpoint: Выход со всех устройств**
   - **Где:** `backend/src/security/security.service.ts`
   - **Задача:** Добавить метод `logoutFromAllDevices(userId: string)`
   - **Логика:** 
     - Получить все refresh tokens пользователя
     - Установить `isRevoked = true` для всех токенов
     - Залогировать событие в audit
   - **API:** POST `/security/logout-all`

2. **Endpoint: Получение текущих настроек Auth Flow для пользователя**
   - **Где:** Новый endpoint в `backend/src/auth/auth.controller.ts`
   - **Задача:** Возвращать обязательные настройки из `auth_flow_config` + индивидуальные настройки пользователя
   - **API:** GET `/auth/user-flow-settings`
   - **Структура ответа:**
     ```typescript
     {
       mandatory: {
         login: AuthMethod[],      // Обязательные методы входа
         factors: AuthMethod[]      // Обязательные факторы 2FA
       },
       user: {
         additionalFactors: AuthMethod[]  // Дополнительные факторы, добавленные пользователем
       }
     }
     ```

3. **Логика: Применение Auth Flow при логине/регистрации**
   - **Где:** `backend/src/auth/auth.service.ts`
   - **Задача:** Использовать `auth_flow_config` для определения обязательных шагов
   - **Логика:**
     - При логине: проверять все обязательные факторы из `factors`
     - При регистрации: запрашивать все поля из `registration`
     - Возвращать следующий обязательный шаг, если не все пройдены

4. **Entity: DeviceSession (опционально, для улучшения)**
   - **Где:** Новая entity `backend/src/auth/entities/device-session.entity.ts`
   - **Задача:** Более структурированное хранение информации об устройствах
   - **Поля:**
     - `id` - UUID устройства (уникальный идентификатор как у Steam)
     - `userId` - связь с пользователем
     - `deviceFingerprint` - отпечаток устройства
     - `deviceName` - название (например, "iPhone 13", "Windows PC")
     - `browser` - браузер
     - `os` - операционная система
     - `ipAddress` - IP адрес
     - `location` - геолокация (опционально)
     - `lastActivity` - последняя активность
     - `createdAt` - дата первого входа
     - `isActive` - активная ли сессия

5. **Способы восстановления: расширение логики**
   - **Где:** `backend/src/security/security.service.ts`
   - **Задача:** Метод `getAvailableRecoveryMethods(userId: string)`
   - **Логика:**
     - Анализировать, какие данные есть у пользователя (email, phone, GitHub, Telegram)
     - Возвращать доступные методы восстановления
     - Учитывать верификацию (только проверенные контакты)

#### Frontend:

1. **Модалка: Изменение пароля**
   - **Где:** Новый компонент `frontend/src/components/Modals/ChangePasswordModal.tsx`
   - **Задача:** Форма для смены пароля
   - **Поля:**
     - Старый пароль (required)
     - Новый пароль (required, validation)
     - Подтверждение нового пароля (required, match)
   - **API:** POST `/security/password/change`

2. **Страница: Способы восстановления**
   - **Где:** Новая страница `frontend/src/pages/SecurityRecoveryMethodsPage.tsx`
   - **Задача:** Отображение доступных способов восстановления
   - **Функционал:**
     - Список методов: Email, Телефон, Telegram, GitHub
     - Статус каждого метода (добавлен/не добавлен, верифицирован/нет)
     - Кнопка "Добавить способ" для каждого метода
     - Кнопка "Верифицировать" для не проверенных
   - **API:** 
     - GET `/security/recovery-methods`
     - POST `/security/recovery-method/setup`

3. **Страница: События (Activity)**
   - **Где:** Новая страница `frontend/src/pages/SecurityActivityPage.tsx`
   - **Задача:** Отображение истории активности
   - **Функционал:**
     - Список событий (логин, выход, смена пароля и т.д.)
     - Фильтры: по типу события, по дате
     - Информация о каждом событии: дата, IP, устройство, геолокация
   - **API:** GET `/security/activity`

4. **Страница: Ваши устройства**
   - **Где:** Новая страница `frontend/src/pages/SecurityDevicesPage.tsx`
   - **Задача:** Отображение списка устройств
   - **Функционал:**
     - Список устройств с уникальными ID (как у Steam)
     - Информация: название, браузер, OS, IP, последняя активность
     - Текущее устройство помечено
     - Кнопка "Удалить" для каждого устройства (кроме текущего)
   - **API:** 
     - GET `/security/devices`
     - DELETE `/security/devices/:deviceId`

5. **Модалка: Управление дополнительными факторами**
   - **Где:** Обновить `frontend/src/components/Modals/AuthMethodsModal.tsx`
   - **Задача:** 
     - Показывать обязательные факторы (readonly, установленные админом)
     - Показывать дополнительные факторы (может добавлять/удалять пользователь)
     - API для получения доступных методов
   - **API:**
     - GET `/auth/user-flow-settings` (обязательные + дополнительные)
     - POST `/auth/user-additional-factors` (добавить дополнительный фактор)
     - DELETE `/auth/user-additional-factors/:factorId` (удалить дополнительный)

6. **Интеграция с Auth Flow на страницах входа/регистрации**
   - **Где:** `frontend/src/pages/auth/*.tsx`
   - **Задача:**
     - Запрашивать `getPublicAuthFlow()` при загрузке
     - Динамически строить форму входа/регистрации на основе конфигурации
     - Пошаговое прохождение: показывать только текущий шаг
     - Валидация на каждом шаге

### 🟡 СРЕДНИЙ ПРИОРИТЕТ (Medium Priority)

#### Backend:

1. **Геолокация по IP**
   - **Задача:** Добавить определение страны/города по IP адресу
   - **Библиотека:** `geoip-lite` или API сервис (ipapi.co)
   - **Применение:** В `extractDeviceInfo()` и `getActivity()`

2. **Device Fingerprinting**
   - **Задача:** Генерация уникального отпечатка устройства
   - **Библиотека:** На фронте `fingerprintjs2`, передача на бэк
   - **Применение:** Для более точной идентификации устройств

3. **Email уведомления о событиях безопасности**
   - **Задача:** Отправлять email при:
     - Входе с нового устройства
     - Смене пароля
     - Добавлении нового фактора аутентификации
   - **Где:** `backend/src/auth/email.service.ts`

4. **Rate limiting для смены пароля**
   - **Задача:** Ограничить количество попыток смены пароля (3 попытки в час)
   - **Библиотека:** `@nestjs/throttler`

#### Frontend:

1. **Визуализация устройств**
   - **Задача:** Иконки для разных типов устройств (Desktop, Mobile, Tablet)
   - **Библиотека:** Использовать существующие иконки из `Icon` компонента

2. **Подтверждение опасных действий**
   - **Задача:** Модалка подтверждения для:
     - Выход со всех устройств
     - Удаление устройства
     - Удаление способа восстановления
   - **Компонент:** `ConfirmationModal`

3. **Валидация пароля**
   - **Задача:** Визуальный индикатор силы пароля
   - **Требования:**
     - Минимум 8 символов
     - Заглавные и строчные буквы
     - Цифры
     - Специальные символы

### 🟢 НИЗКИЙ ПРИОРИТЕТ (Low Priority)

1. **Backup коды для nFA**
   - **Задача:** Генерация и использование резервных кодов
   - **Где:** `backend/src/auth/services/nfa.service.ts`

2. **Экспорт истории активности**
   - **Задача:** Скачивание истории в CSV/PDF
   - **API:** GET `/security/activity/export`

3. **Trusted devices**
   - **Задача:** Возможность пометить устройство как доверенное (не запрашивать 2FA)

4. **Блокировка подозрительных входов**
   - **Задача:** Автоматическая блокировка при входе с нового IP/устройства

---

## 📝 Детальный план реализации (Step-by-Step)

### ЭТАП 1: Доработка Backend API (3-4 дня)

#### День 1: Устройства и сессии

**Задача 1.1: Endpoint "Выход со всех устройств"**
```typescript
// backend/src/security/security.service.ts
async logoutFromAllDevices(userId: string, currentTokenId?: string) {
  // 1. Получить все токены пользователя
  const tokens = await this.refreshTokensRepo.find({
    where: { userId, isRevoked: false }
  });
  
  // 2. Отметить все как revoked (кроме текущего, если передан)
  for (const token of tokens) {
    if (currentTokenId && token.id === currentTokenId) continue;
    token.isRevoked = true;
    await this.refreshTokensRepo.save(token);
  }
  
  // 3. Залогировать событие
  await this.auditService.log({
    userId,
    service: 'security',
    action: 'logout-all-devices',
    resource: 'sessions',
    statusCode: 200,
    ipAddress: 'system',
    userAgent: 'system',
  });
  
  return { message: 'Logged out from all devices', count: tokens.length };
}
```

**Задача 1.2: Controller endpoint**
```typescript
// backend/src/security/security.controller.ts
@Post('logout-all')
@ApiOperation({ summary: 'Выйти со всех устройств' })
@ApiResponse({ status: 200, description: 'Выход выполнен' })
async logoutFromAllDevices(
  @CurrentUser() user: any,
  @Body() body: { keepCurrentSession?: boolean }
) {
  const userId = user?.userId || user?.id || user?.sub;
  const currentTokenId = body.keepCurrentSession ? user?.tokenId : undefined;
  return this.securityService.logoutFromAllDevices(userId, currentTokenId);
}
```

**Задача 1.3: Тесты**
- Создать тест для `logoutFromAllDevices()`
- Проверить, что все токены стали revoked
- Проверить, что событие залогировано

#### День 2: Auth Flow для пользователей

**Задача 2.1: Endpoint настроек для пользователя**
```typescript
// backend/src/auth/auth.controller.ts
@Get('user-flow-settings')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Получить настройки Auth Flow для текущего пользователя' })
async getUserFlowSettings(@CurrentUser() user: any) {
  const userId = user?.userId || user?.id || user?.sub;
  
  // 1. Получить обязательные настройки из auth_flow_config
  const configRaw = await this.settingsService.getSetting('auth_flow_config');
  const config = configRaw ? JSON.parse(configRaw) : { login: [], factors: [] };
  
  // 2. Получить индивидуальные настройки пользователя
  const userEntity = await this.usersService.findById(userId);
  const additionalFactors = userEntity?.mfaSettings?.methods || [];
  
  return {
    success: true,
    data: {
      mandatory: {
        login: config.login || [],
        factors: config.factors || []
      },
      user: {
        additionalFactors: additionalFactors.map(method => ({
          id: method,
          name: method,
          enabled: true,
          type: 'user-added'
        }))
      }
    }
  };
}
```

**Задача 2.2: Endpoint добавления дополнительных факторов**
```typescript
// backend/src/auth/auth.controller.ts
@Post('user-additional-factors')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Добавить дополнительный фактор аутентификации' })
async addUserAdditionalFactor(
  @CurrentUser() user: any,
  @Body() body: { method: string }
) {
  const userId = user?.userId || user?.id || user?.sub;
  const userEntity = await this.usersService.findById(userId);
  
  // Проверяем, что метод доступен пользователю
  const availableMethods = userEntity.availableAuthMethods || [];
  if (!availableMethods.includes(body.method)) {
    throw new BadRequestException('Method not available for this user');
  }
  
  // Добавляем метод в mfaSettings
  if (!userEntity.mfaSettings) {
    userEntity.mfaSettings = {
      enabled: true,
      methods: [body.method],
      backupCodes: [],
      backupCodesUsed: [],
      requiredMethods: 1
    };
  } else {
    if (!userEntity.mfaSettings.methods.includes(body.method)) {
      userEntity.mfaSettings.methods.push(body.method);
    }
  }
  
  await this.usersService.update(userId, { mfaSettings: userEntity.mfaSettings });
  
  return {
    success: true,
    message: 'Additional factor added'
  };
}

@Delete('user-additional-factors/:method')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Удалить дополнительный фактор аутентификации' })
async removeUserAdditionalFactor(
  @CurrentUser() user: any,
  @Param('method') method: string
) {
  const userId = user?.userId || user?.id || user?.sub;
  const userEntity = await this.usersService.findById(userId);
  
  // Удаляем метод из mfaSettings (если это не обязательный метод из auth_flow_config)
  if (userEntity.mfaSettings) {
    userEntity.mfaSettings.methods = userEntity.mfaSettings.methods.filter(m => m !== method);
    if (userEntity.mfaSettings.methods.length === 0) {
      userEntity.mfaSettings.enabled = false;
    }
  }
  
  await this.usersService.update(userId, { mfaSettings: userEntity.mfaSettings });
  
  return {
    success: true,
    message: 'Additional factor removed'
  };
}
```

#### День 3: Способы восстановления

**Задача 3.1: Endpoint доступных способов восстановления**
```typescript
// backend/src/security/security.service.ts
async getAvailableRecoveryMethods(userId: string) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const methods = [];
  
  // Email
  if (user.email) {
    methods.push({
      type: 'email',
      contact: user.email,
      verified: user.emailVerified,
      primary: user.primaryAuthMethod === 'EMAIL'
    });
  }
  
  // Phone / Telegram
  if (user.phone || user.messengerMetadata?.telegram) {
    methods.push({
      type: 'phone_telegram',
      contact: user.phone || user.messengerMetadata?.telegram?.username,
      verified: user.phoneVerified,
      primary: user.primaryAuthMethod === 'PHONE_TELEGRAM'
    });
  }
  
  // GitHub
  if (user.githubId) {
    methods.push({
      type: 'github',
      contact: user.githubUsername,
      verified: user.githubVerified,
      primary: user.primaryAuthMethod === 'GITHUB'
    });
  }
  
  return {
    success: true,
    data: { methods }
  };
}
```

**Задача 3.2: Controller endpoint**
```typescript
// backend/src/security/security.controller.ts
@Get('recovery-methods')
@ApiOperation({ summary: 'Получить доступные способы восстановления' })
@ApiResponse({ status: 200, description: 'Список способов восстановления' })
async getRecoveryMethods(@CurrentUser() user: any) {
  const userId = user?.userId || user?.id || user?.sub;
  return this.securityService.getAvailableRecoveryMethods(userId);
}
```

#### День 4: Тестирование и документация

- Тестирование всех новых endpoints
- Обновление Swagger документации
- Проверка работы с Docker

---

### ЭТАП 2: Доработка Frontend (4-5 дней)

#### День 5: Модалка изменения пароля

**Задача 5.1: Создать компонент ChangePasswordModal**
```typescript
// frontend/src/components/Modals/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/design-system/composites/Modal';
import { Input } from '@/design-system/primitives/Input';
import { Button } from '@/design-system/primitives/Button';
import { securityApi } from '@/services/api/security';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const validatePassword = (password: string) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };
  
  const handleSubmit = async () => {
    setError('');
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t('errors.requiredFields', 'Заполните все поля'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('errors.passwordsDoNotMatch', 'Пароли не совпадают'));
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError(t('errors.weakPassword', 'Пароль должен содержать минимум 8 символов, заглавные и строчные буквы, цифры'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      await securityApi.changePassword(oldPassword, newPassword);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || t('errors.changePasswordFailed', 'Ошибка изменения пароля'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('security.password.change', 'Изменить пароль')}>
      <div className="space-y-4">
        <Input
          type="password"
          label={t('security.password.old', 'Старый пароль')}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          type="password"
          label={t('security.password.new', 'Новый пароль')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          type="password"
          label={t('security.password.confirm', 'Подтвердите новый пароль')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {t('common.save', 'Сохранить')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

**Задача 5.2: Добавить API методы**
```typescript
// frontend/src/services/api/security.ts
export const securityApi = {
  // ... existing methods
  
  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/security/password/change', { oldPassword, newPassword }),
  
  logoutFromAllDevices: (keepCurrentSession: boolean = false) =>
    apiClient.post('/security/logout-all', { keepCurrentSession }),
};
```

**Задача 5.3: Интегрировать в SecurityPage**
```typescript
// frontend/src/pages/SecurityPage.tsx
import { ChangePasswordModal } from '@/components/Modals/ChangePasswordModal';

// В компоненте:
const changePasswordModal = useModal();

// В списке:
<SecurityListItem
  icon="refresh-cw"
  title={t('security.password.change', 'Обновить пароль')}
  description={t('security.password.lastChanged', 'Менялся {{time}}', { time: passwordLastChanged })}
  onClick={changePasswordModal.open}
/>

// В конце:
{changePasswordModal.isOpen && (
  <Suspense fallback={null}>
    <ChangePasswordModal
      isOpen={changePasswordModal.isOpen}
      onClose={changePasswordModal.close}
      onSuccess={() => {
        // Показать уведомление об успехе
        console.log('Password changed successfully');
      }}
    />
  </Suspense>
)}
```

#### День 6: Страница "Способы восстановления"

**Задача 6.1: Создать SecurityRecoveryMethodsPage**
```typescript
// frontend/src/pages/SecurityRecoveryMethodsPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { SecurityListItem } from '@/design-system/composites/SecurityListItem';
import { securityApi } from '@/services/api/security';

interface RecoveryMethod {
  type: string;
  contact: string;
  verified: boolean;
  primary: boolean;
}

const SecurityRecoveryMethodsPage: React.FC = () => {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<RecoveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await securityApi.getRecoveryMethods();
        setMethods(response.data?.data?.methods || []);
      } catch (error) {
        console.error('Failed to fetch recovery methods', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMethods();
  }, []);
  
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'email': return 'mail';
      case 'phone_telegram': return 'message-circle';
      case 'github': return 'github';
      default: return 'shield';
    }
  };
  
  const getMethodTitle = (type: string) => {
    switch (type) {
      case 'email': return t('recovery.email', 'Email');
      case 'phone_telegram': return t('recovery.telegram', 'Telegram');
      case 'github': return t('recovery.github', 'GitHub');
      default: return type;
    }
  };
  
  return (
    <PageTemplate title={t('security.recovery.title', 'Способы восстановления')}>
      <DataSection
        title={t('security.recovery.title', 'Способы восстановления')}
        description={t('security.recovery.description', 'Варианты восстановления доступа к аккаунту')}
      >
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-2">
            {methods.map((method) => (
              <SecurityListItem
                key={method.type}
                icon={getMethodIcon(method.type)}
                title={getMethodTitle(method.type)}
                description={method.contact}
                badge={method.verified ? 'Проверено' : 'Не проверено'}
                onClick={() => {
                  // TODO: Открыть модалку верификации/настройки
                }}
              />
            ))}
          </div>
        )}
      </DataSection>
    </PageTemplate>
  );
};

export default SecurityRecoveryMethodsPage;
```

**Задача 6.2: Добавить роут**
```typescript
// frontend/src/router/index.tsx
{
  path: '/:lang/security/recovery-methods',
  element: (
    <LanguageRoute>
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SecurityRecoveryMethodsPage />
        </Suspense>
      </ProtectedRoute>
    </LanguageRoute>
  ),
},
```

**Задача 6.3: Добавить API метод**
```typescript
// frontend/src/services/api/security.ts
export const securityApi = {
  // ... existing methods
  
  getRecoveryMethods: () => apiClient.get('/security/recovery-methods'),
  
  setupRecoveryMethod: (method: 'email' | 'phone') =>
    apiClient.post('/security/recovery-method/setup', { method }),
};
```

#### День 7: Страница "События (Activity)"

**Задача 7.1: Создать SecurityActivityPage**
```typescript
// frontend/src/pages/SecurityActivityPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { securityApi } from '@/services/api/security';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Activity {
  id: string;
  action: string;
  date: string;
  ip: string;
  device: string;
  location?: string;
}

const SecurityActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await securityApi.getActivity();
        setActivities(response.data?.activity || []);
      } catch (error) {
        console.error('Failed to fetch activity', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, []);
  
  return (
    <PageTemplate title={t('security.activity.title', 'События')}>
      <DataSection
        title={t('security.activity.title', 'События')}
        description={t('security.activity.description', 'История активности на аккаунте за последние 180 дней')}
      >
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{activity.action}</h4>
                    <p className="text-sm text-gray-500">
                      {activity.device} • {activity.ip}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(activity.date), { 
                      addSuffix: true,
                      locale: ru 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DataSection>
    </PageTemplate>
  );
};

export default SecurityActivityPage;
```

**Задача 7.2: Добавить роут**
```typescript
// frontend/src/router/index.tsx
{
  path: '/:lang/security/activity',
  element: (
    <LanguageRoute>
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SecurityActivityPage />
        </Suspense>
      </ProtectedRoute>
    </LanguageRoute>
  ),
},
```

#### День 8: Страница "Ваши устройства"

**Задача 8.1: Создать SecurityDevicesPage**
```typescript
// frontend/src/pages/SecurityDevicesPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { DataSection } from '@/design-system/composites/DataSection';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { securityApi } from '@/services/api/security';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Device {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  lastActivity: string;
  current: boolean;
}

const SecurityDevicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDevices();
  }, []);
  
  const fetchDevices = async () => {
    try {
      const response = await securityApi.getDevices();
      setDevices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm(t('security.devices.confirmDelete', 'Удалить это устройство?'))) {
      return;
    }
    
    try {
      await securityApi.deleteDevice(deviceId);
      await fetchDevices();
    } catch (error) {
      console.error('Failed to delete device', error);
    }
  };
  
  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes('iPhone') || deviceName.includes('Android')) {
      return 'smartphone';
    }
    if (deviceName.includes('iPad') || deviceName.includes('Tablet')) {
      return 'tablet';
    }
    return 'monitor';
  };
  
  return (
    <PageTemplate title={t('security.devices.title', 'Ваши устройства')}>
      <DataSection
        title={t('security.devices.title', 'Ваши устройства')}
        description={t('security.devices.description', 'Устройства, с которых вы входили в Loginus')}
      >
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Icon name={getDeviceIcon(device.device)} size="lg" />
                    <div>
                      <h4 className="font-medium">
                        {device.device}
                        {device.current && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {t('security.devices.current', 'Текущее')}
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {device.browser} • {device.ip}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('security.devices.lastActive', 'Последняя активность')}: {' '}
                        {formatDistanceToNow(new Date(device.lastActivity), { 
                          addSuffix: true,
                          locale: ru 
                        })}
                      </p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      {t('common.delete', 'Удалить')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DataSection>
    </PageTemplate>
  );
};

export default SecurityDevicesPage;
```

**Задача 8.2: Добавить роут**
```typescript
// frontend/src/router/index.tsx
{
  path: '/:lang/security/devices',
  element: (
    <LanguageRoute>
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <SecurityDevicesPage />
        </Suspense>
      </ProtectedRoute>
    </LanguageRoute>
  ),
},
```

**Задача 8.3: Добавить API методы**
```typescript
// frontend/src/services/api/security.ts
export const securityApi = {
  // ... existing methods
  
  getDevices: () => apiClient.get('/security/devices'),
  
  deleteDevice: (deviceId: string) => apiClient.delete(`/security/devices/${deviceId}`),
};
```

#### День 9: Модалка управления дополнительными факторами

**Задача 9.1: Обновить AuthMethodsModal**
```typescript
// frontend/src/components/Modals/AuthMethodsModal.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/design-system/composites/Modal';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { authFlowApi } from '@/services/api/auth-flow';
import { securityApi } from '@/services/api/security';

interface AuthFactor {
  id: string;
  name: string;
  type: 'mandatory' | 'user-added';
  enabled: boolean;
  available: boolean;
}

interface AuthMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (factors: AuthFactor[]) => void;
}

export const AuthMethodsModal: React.FC<AuthMethodsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [mandatoryFactors, setMandatoryFactors] = useState<AuthFactor[]>([]);
  const [userFactors, setUserFactors] = useState<AuthFactor[]>([]);
  const [availableFactors, setAvailableFactors] = useState<AuthFactor[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      fetchFactors();
    }
  }, [isOpen]);
  
  const fetchFactors = async () => {
    try {
      // Получить обязательные факторы + индивидуальные
      const response = await authFlowApi.getUserFlowSettings();
      const data = response.data?.data;
      
      setMandatoryFactors(data?.mandatory?.factors || []);
      setUserFactors(data?.user?.additionalFactors || []);
      
      // Получить доступные факторы для добавления
      // TODO: API для получения доступных методов
      setAvailableFactors([
        { id: 'email', name: 'Email', type: 'user-added', enabled: false, available: true },
        { id: 'telegram', name: 'Telegram', type: 'user-added', enabled: false, available: true },
        { id: 'github', name: 'GitHub', type: 'user-added', enabled: false, available: true },
      ]);
    } catch (error) {
      console.error('Failed to fetch factors', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFactor = async (factorId: string) => {
    try {
      await securityApi.addAdditionalFactor(factorId);
      await fetchFactors();
    } catch (error) {
      console.error('Failed to add factor', error);
    }
  };
  
  const handleRemoveFactor = async (factorId: string) => {
    try {
      await securityApi.removeAdditionalFactor(factorId);
      await fetchFactors();
    } catch (error) {
      console.error('Failed to remove factor', error);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('security.authMethods.title', 'Способы входа')}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Обязательные факторы */}
          <div>
            <h3 className="font-medium mb-2">
              {t('security.authMethods.mandatory', 'Обязательные факторы')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('security.authMethods.mandatoryDescription', 'Установлены администратором для всех пользователей')}
            </p>
            <div className="space-y-2">
              {mandatoryFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Icon name="shield" size="md" />
                    <span>{factor.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {t('security.authMethods.required', 'Обязательно')}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Дополнительные факторы */}
          <div>
            <h3 className="font-medium mb-2">
              {t('security.authMethods.additional', 'Дополнительные факторы')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t('security.authMethods.additionalDescription', 'Вы можете добавить дополнительные способы защиты')}
            </p>
            <div className="space-y-2">
              {userFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Icon name="shield" size="md" />
                    <span>{factor.name}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveFactor(factor.id)}
                  >
                    {t('common.remove', 'Удалить')}
                  </Button>
                </div>
              ))}
              
              {/* Доступные для добавления */}
              {availableFactors
                .filter(f => !userFactors.some(uf => uf.id === f.id))
                .map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-3 border rounded border-dashed">
                    <div className="flex items-center gap-3">
                      <Icon name="plus" size="md" />
                      <span>{factor.name}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddFactor(factor.id)}
                    >
                      {t('common.add', 'Добавить')}
                    </Button>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t('common.close', 'Закрыть')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
```

**Задача 9.2: Добавить API методы**
```typescript
// frontend/src/services/api/auth-flow.ts
export const authFlowApi = {
  // ... existing methods
  
  getUserFlowSettings: () => apiClient.get('/auth/user-flow-settings'),
};

// frontend/src/services/api/security.ts
export const securityApi = {
  // ... existing methods
  
  addAdditionalFactor: (method: string) => 
    apiClient.post('/auth/user-additional-factors', { method }),
  
  removeAdditionalFactor: (method: string) => 
    apiClient.delete(`/auth/user-additional-factors/${method}`),
};
```

---

### ЭТАП 3: Интеграция Auth Flow в формы входа/регистрации (2-3 дня)

#### День 10-11: Динамическая форма входа

**Задача 10.1: Обновить страницу входа**
```typescript
// frontend/src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authFlowApi } from '@/services/api/auth-flow';
import { authApi } from '@/services/api/auth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [flowConfig, setFlowConfig] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    // Загрузить конфигурацию Auth Flow
    const fetchFlow = async () => {
      const response = await authFlowApi.getPublicAuthFlow();
      const config = response.data?.data;
      setFlowConfig(config);
    };
    
    fetchFlow();
  }, []);
  
  const currentMethod = flowConfig?.login?.[currentStep];
  
  const handleSubmit = async () => {
    // Логика в зависимости от текущего шага
    if (currentMethod.id === 'phone-email') {
      // Отправить логин (email или телефон)
      // Перейти к следующему шагу
      setCurrentStep(currentStep + 1);
    } else if (currentMethod.id === 'password') {
      // Отправить пароль
      // Выполнить вход
      await authApi.login(formData);
    }
    // И т.д. для других методов
  };
  
  return (
    <div>
      <h1>{t('auth.login', 'Вход')}</h1>
      {currentMethod && (
        <div>
          {/* Динамически рендерим поля в зависимости от currentMethod.id */}
          {currentMethod.id === 'phone-email' && (
            <input 
              type="text" 
              placeholder={t('auth.phoneOrEmail', 'Телефон или Email')}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
            />
          )}
          {currentMethod.id === 'password' && (
            <input 
              type="password" 
              placeholder={t('auth.password', 'Пароль')}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
          {/* Другие методы... */}
          
          <button onClick={handleSubmit}>
            {t('common.continue', 'Продолжить')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
```

**Задача 10.2: Аналогично для регистрации**
- Обновить `RegistrationPage` для использования `flowConfig.registration`
- Динамически добавлять поля в зависимости от конфигурации

#### День 12: Кнопка "Выйти везде"

**Задача 12.1: Добавить модалку подтверждения**
```typescript
// frontend/src/pages/SecurityPage.tsx
import { ConfirmationModal } from '@/components/Modals/ConfirmationModal';

const SecurityPage: React.FC = () => {
  // ... existing code
  
  const logoutAllModal = useModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    
    try {
      await securityApi.logoutFromAllDevices(false); // Не сохранять текущую сессию
      // Перенаправить на страницу входа
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout from all devices', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <>
      {/* ... existing content */}
      
      <Button 
        variant="outline" 
        fullWidth
        className={themeClasses.button.error}
        leftIcon={<Icon name="logout" size="sm" />}
        rightIcon={<Icon name="chevron-right" size="sm" />}
        onClick={logoutAllModal.open}
      >
        {t('security.control.logoutAll', 'Выйти везде')}
      </Button>
      
      {/* Модалка подтверждения */}
      {logoutAllModal.isOpen && (
        <ConfirmationModal
          isOpen={logoutAllModal.isOpen}
          onClose={logoutAllModal.close}
          onConfirm={handleLogoutAll}
          title={t('security.logoutAll.title', 'Выйти везде?')}
          description={t('security.logoutAll.description', 'Вы будете разлогинены на всех устройствах, включая это')}
          confirmText={t('security.logoutAll.confirm', 'Выйти везде')}
          cancelText={t('common.cancel', 'Отмена')}
          isLoading={isLoggingOut}
        />
      )}
    </>
  );
};
```

---

### ЭТАП 4: Тестирование и полировка (2-3 дня)

#### День 13-14: Тестирование

1. **Backend тесты:**
   - Unit тесты для всех новых методов
   - Integration тесты для endpoints
   - Тесты для Auth Flow логики

2. **Frontend тесты:**
   - Тесты для новых компонентов
   - E2E тесты для критических путей (вход, выход, смена пароля)

3. **Ручное тестирование:**
   - Проверить все функции в реальных браузерах
   - Тестирование мобильной версии
   - Проверка i18n (переводы)

#### День 15: Документация и деплой

1. **Документация:**
   - Обновить README
   - Добавить примеры использования API
   - Создать руководство для админов

2. **Деплой:**
   - Миграция БД (если есть новые поля)
   - Деплой бэкенда
   - Деплой фронтенда
   - Проверка в production

---

## 📦 Структура проекта (после реализации)

### Backend:
```
backend/src/
├── auth/
│   ├── entities/
│   │   ├── refresh-token.entity.ts (обновлено)
│   │   ├── two-factor-code.entity.ts
│   │   └── device-session.entity.ts (новая, опционально)
│   ├── services/
│   │   ├── nfa.service.ts (уже есть)
│   │   └── auth-flow.service.ts (новый, опционально)
│   ├── auth.controller.ts (обновлено)
│   └── auth.service.ts (обновлено)
├── security/
│   ├── security.controller.ts (обновлено)
│   └── security.service.ts (обновлено)
└── admin/
    └── admin.controller.ts (обновлено)
```

### Frontend:
```
frontend/src/
├── pages/
│   ├── admin/
│   │   └── AuthFlowBuilderPage.tsx (уже есть)
│   ├── SecurityPage.tsx (уже есть)
│   ├── SecurityRecoveryMethodsPage.tsx (новая)
│   ├── SecurityActivityPage.tsx (новая)
│   ├── SecurityDevicesPage.tsx (новая)
│   └── auth/
│       ├── LoginPage.tsx (обновлено)
│       └── RegisterPage.tsx (обновлено)
├── components/
│   └── Modals/
│       ├── ChangePasswordModal.tsx (новая)
│       ├── AuthMethodsModal.tsx (обновлено)
│       └── ConfirmationModal.tsx (новая)
└── services/
    └── api/
        ├── auth-flow.ts (обновлено)
        └── security.ts (обновлено)
```

---

## 🎯 KPI и метрики успеха

### Функциональные требования:
- ✅ Админ может настроить алгоритм входа (login, registration, factors)
- ✅ Пользователь видит обязательные факторы + может добавить дополнительные
- ✅ Пользователь может сменить пароль
- ✅ Пользователь видит список устройств и может удалить
- ✅ Пользователь видит историю активности
- ✅ Пользователь может выйти со всех устройств
- ✅ Пользователь видит способы восстановления доступа

### Нефункциональные требования:
- Время ответа API < 500ms
- Покрытие тестами > 80%
- Поддержка 3 языков (RU, EN, CN)
- Мобильная адаптация
- Accessibility (WCAG 2.1 AA)

---

## 🚀 Следующие шаги (за рамками спринта)

1. **Геолокация** - определение города/страны по IP
2. **Device Fingerprinting** - более точная идентификация устройств
3. **Email уведомления** - автоматические уведомления о событиях безопасности
4. **Backup коды** - резервные коды для nFA
5. **Trusted devices** - доверенные устройства без 2FA
6. **OAuth 2.0 Server** - полноценный OAuth провайдер для внешних приложений
7. **WebAuthn / Passkeys** - биометрическая аутентификация

---

## 📚 Референсы и вдохновение

- Yandex ID: https://id.yandex.ru/security
- Steam Guard: https://store.steampowered.com/twofactor/manage
- Google Account Security: https://myaccount.google.com/security
- GitHub Security: https://github.com/settings/security

---

## ✅ Чеклист перед релизом

### Backend:
- [ ] Все endpoints протестированы
- [ ] Swagger документация обновлена
- [ ] Миграции БД подготовлены
- [ ] Environment variables настроены
- [ ] Rate limiting настроен
- [ ] Audit logging работает

### Frontend:
- [ ] Все страницы работают
- [ ] Переводы добавлены (RU, EN, CN)
- [ ] Мобильная версия протестирована
- [ ] Loading states добавлены
- [ ] Error handling реализован
- [ ] Accessibility проверен

### DevOps:
- [ ] Docker контейнеры собираются
- [ ] CI/CD пайплайн работает
- [ ] Production secrets настроены
- [ ] Backup стратегия определена
- [ ] Monitoring настроен (Sentry, LogRocket)

---

## 🎉 Заключение

Данный roadmap покрывает все требования из технического задания и обеспечивает пошаговую реализацию системы аутентификации и безопасности. Оценка времени: **15 рабочих дней** для полной реализации.

**Приоритеты:**
1. 🔴 Критичные - День 1-4 (Backend API)
2. 🔴 Критичные - День 5-9 (Frontend страницы и модалки)
3. 🟡 Средние - День 10-12 (Интеграция Auth Flow)
4. 🟢 Полировка - День 13-15 (Тестирование и документация)

**Команда:**
- 1 Backend разработчик
- 1 Frontend разработчик
- 1 QA инженер (с 13 дня)

Успехов в реализации! 🚀

