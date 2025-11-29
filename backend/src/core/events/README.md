# Loginus Event System

## 📖 Обзор

Event System - это центральная система управления событиями в Loginus, построенная по принципу event-driven архитектуры. Она позволяет плагинам и модулям подписываться на события и реагировать на них, обеспечивая гибкую и расширяемую архитектуру.

## 🎯 Основные возможности

- ✅ **Event Bus** - центральная шина событий с приоритетами
- ✅ **50+ базовых событий** - пользователи, меню, виджеты, данные, система
- ✅ **Wildcard подписки** - `user.*` для всех событий пользователей
- ✅ **Приоритеты обработчиков** - контроль порядка выполнения
- ✅ **Фильтрация событий** - условная обработка
- ✅ **Автоматическое логирование** - все события сохраняются в БД
- ✅ **Асинхронная обработка** - не блокирует основной поток
- ✅ **Декораторы** - `@OnEvent()`, `@EmitsEvent()`
- ✅ **BasePlugin класс** - готовая база для плагинов

## 🚀 Быстрый старт

### 1. Создание плагина

```typescript
import { BasePlugin, PluginManifest } from '@core/extensions/base/base-plugin';
import { OnEvent } from '@core/extensions/decorators/event.decorators';
import { USER_EVENTS, UserCreatedEventData } from '@core/events/events';
import { IEvent } from '@core/events/interfaces/event.interface';

export class MyPlugin extends BasePlugin {
  constructor() {
    const manifest: PluginManifest = {
      slug: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
      extensionType: 'plugin',
      events: {
        subscribes: [USER_EVENTS.AFTER_CREATE],
        emits: ['my-plugin.custom_event'],
      },
    };
    super(manifest);
  }

  // Обработчик события с декоратором
  @OnEvent(USER_EVENTS.AFTER_CREATE, 50) // priority = 50
  async onUserCreated(event: IEvent<UserCreatedEventData>) {
    const { userId, email } = event.data;
    this.log(`New user: ${email}`);
    
    // Ваша бизнес-логика
    await this.sendWelcomeEmail(email);
    
    // Испустить кастомное событие
    await this.emit('my-plugin.welcome_sent', { userId });
  }

  async sendWelcomeEmail(email: string) {
    // ...
  }
}
```

### 2. Подписка на события (без BasePlugin)

```typescript
import { EventBusService } from '@core/events/event-bus.service';
import { USER_EVENTS } from '@core/events/events';

export class MyService {
  constructor(private readonly eventBus: EventBusService) {}

  async init() {
    // Подписка на событие
    this.eventBus.on(USER_EVENTS.AFTER_CREATE, {
      handle: async (event) => {
        console.log('User created:', event.data);
      },
      priority: 100,
      name: 'MyServiceHandler',
    });

    // Wildcard подписка
    this.eventBus.on('user.*', {
      handle: async (event) => {
        console.log('Any user event:', event.name);
      },
    });
  }
}
```

### 3. Испускание событий

```typescript
import { EventBusService } from '@core/events/event-bus.service';
import { USER_EVENTS } from '@core/events/events';

export class UserService {
  constructor(private readonly eventBus: EventBusService) {}

  async createUser(email: string) {
    const user = await this.userRepository.save({ email });

    // Испустить событие
    await this.eventBus.emit(USER_EVENTS.AFTER_CREATE, {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return user;
  }
}
```

## 📚 Доступные события

### Пользователи (`USER_EVENTS`)
- `user.before_create`, `user.after_create`
- `user.before_update`, `user.after_update`
- `user.before_delete`, `user.after_delete`
- `user.login`, `user.logout`
- `user.password_changed`, `user.email_changed`
- `user.role_assigned`, `user.role_removed`

### Меню (`MENU_EVENTS`)
- `menu.before_render`, `menu.after_render`
- `menu.item.before_click`, `menu.item.after_click`
- `menu.item.created`, `menu.item.updated`, `menu.item.deleted`
- `menu.structure_changed`

### Виджеты (`WIDGET_EVENTS`)
- `widget.before_load`, `widget.after_load`
- `widget.before_render`, `widget.after_render`
- `widget.data_received`, `widget.error`
- `widget.added`, `widget.removed`

### Система (`SYSTEM_EVENTS`, `PLUGIN_EVENTS`)
- `system.startup`, `system.shutdown`
- `plugin.installed`, `plugin.enabled`, `plugin.disabled`
- `plugin.loading`, `plugin.loaded`

### Данные (`DATA_EVENTS`, `DOCUMENT_EVENTS`, `ADDRESS_EVENTS`)
- `data.before_create`, `data.after_create`
- `document.created`, `document.updated`
- `address.created`, `address.selected`

### Аутентификация (`AUTH_EVENTS`)
- `auth.before_login`, `auth.after_login`
- `auth.token_issued`, `auth.token_refresh`
- `auth.session_expired`

### Платежи (`PAYMENT_EVENTS`)
- `payment.success`, `payment.failed`
- `payment.refund_requested`
- `payment.subscription_renewed`

Полный список: см. `backend/src/core/events/events/`

## 🔧 Продвинутые возможности

### Приоритеты

```typescript
// Высокий приоритет (выполнится первым)
eventBus.on('user.created', handler1, { priority: 10 });

// Средний приоритет
eventBus.on('user.created', handler2, { priority: 100 });

// Низкий приоритет (выполнится последним)
eventBus.on('user.created', handler3, { priority: 200 });
```

### Фильтрация

```typescript
eventBus.on(
  'user.updated',
  {
    handle: async (event) => {
      console.log('Admin updated');
    },
  },
  {
    filter: (event) => event.data.role === 'admin',
  },
);
```

### Одноразовая подписка

```typescript
eventBus.once('system.startup', {
  handle: async () => {
    console.log('System started');
  },
});
```

### Отписка

```typescript
const unsubscribe = eventBus.on('user.login', handler);

// Позже...
unsubscribe();
```

### Асинхронная обработка

```typescript
eventBus.on(
  'user.created',
  {
    handle: async (event) => {
      // Долгая операция
      await sendEmail(event.data.email);
    },
  },
  {
    async: true, // Не блокирует основной поток
  },
);
```

## 📊 Логирование и статистика

Все события автоматически логируются в БД (`event_logs` таблица).

```typescript
// Получить статистику
const stats = await eventLoggerService.getStatistics();
// {
//   total: 1234,
//   errors: 5,
//   successRate: 99.59,
//   topEvents: [...],
//   topPlugins: [...]
// }

// Получить логи события
const logs = await eventLoggerService.getEventLogs('user.created', 100);

// Получить ошибки
const errors = await eventLoggerService.getFailedLogs(50);
```

## 🎯 Best Practices

1. **Используйте константы событий** из `@core/events/events`
2. **Именуйте обработчики** для лучшего логирования
3. **Обрабатывайте ошибки** внутри обработчиков
4. **Не блокируйте события** тяжелыми операциями
5. **Используйте фильтры** для условной обработки
6. **Документируйте события** в манифесте плагина

## 📁 Структура файлов

```
backend/src/core/
├── events/
│   ├── event-bus.service.ts          # Центральная шина событий
│   ├── event-logger.service.ts       # Логирование событий
│   ├── interfaces/
│   │   └── event.interface.ts        # Интерфейсы
│   ├── events/
│   │   ├── user.events.ts            # События пользователей
│   │   ├── menu.events.ts            # События меню
│   │   ├── widget.events.ts          # События виджетов
│   │   ├── system.events.ts          # Системные события
│   │   ├── data.events.ts            # События данных
│   │   ├── auth.events.ts            # События аутентификации
│   │   └── index.ts                  # Экспорт всех событий
│   └── entities/
│       └── event-log.entity.ts       # Entity для логов
│
└── extensions/
    ├── base/
    │   └── base-plugin.ts            # Базовый класс плагина
    ├── decorators/
    │   └── event.decorators.ts       # @OnEvent, @EmitsEvent
    └── examples/
        └── example.plugin.ts         # Пример плагина
```

## ✅ Что реализовано

- [x] EventBusService с приоритетами
- [x] 50+ базовых событий системы
- [x] BasePlugin класс для плагинов
- [x] Декораторы @OnEvent и @EmitsEvent
- [x] Автоматическое логирование в БД
- [x] Wildcard подписки
- [x] Фильтрация событий
- [x] Приоритеты обработчиков
- [x] Асинхронная обработка
- [x] Статистика и мониторинг
- [x] Интеграционные тесты

## 🔜 Следующие шаги

- [ ] Webhook система для внешних интеграций
- [ ] Event replay для отладки
- [ ] Событийный pipeline с middleware
- [ ] GraphQL subscriptions поверх событий

