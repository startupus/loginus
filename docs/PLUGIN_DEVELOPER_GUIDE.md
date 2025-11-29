# Loginus Plugin Developer Guide

> Руководство по разработке плагинов и расширений для платформы Loginus

## Оглавление

1. [Введение](#введение)
2. [Быстрый старт](#быстрый-старт)
3. [Архитектура плагина](#архитектура-плагина)
4. [Система событий](#система-событий)
5. [Типы расширений](#типы-расширений)
6. [API Reference](#api-reference)
7. [Примеры](#примеры)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)

---

## Введение

Система расширений Loginus позволяет разработчикам создавать плагины и виджеты, которые расширяют функциональность платформы без изменения основного кода.

### Основные возможности

- **Событийная архитектура** - подписка на системные события
- **Приоритеты обработчиков** - контроль порядка выполнения
- **Wildcard подписки** - подписка на группы событий (`user.*`)
- **Автоматическое логирование** - все события записываются в БД
- **UI интеграция** - создание пунктов меню и виджетов
- **Конфигурация** - настраиваемые параметры через админку

### Типы расширений

1. **Plugin** - расширение с бизнес-логикой (с UI или без)
2. **Widget** - UI-компонент для отображения данных в дашбордах
3. **Menu Item** - пункт меню с iframe/embedded/external контентом

---

## Быстрый старт

### Структура плагина

```
my-plugin/
├── manifest.json          # Метаданные плагина
├── plugin.ts             # Основной код (будет скомпилирован в plugin.js)
├── README.md             # Документация
└── ui/                   # Опционально: UI файлы
    ├── index.html
    └── assets/
```

### Минимальный manifest.json

```json
{
  "slug": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description of what my plugin does",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "extensionType": "plugin",
  "ui": {
    "type": "none"
  },
  "events": {
    "subscribes": [
      "user.after_login",
      "user.after_create"
    ],
    "emits": []
  },
  "permissions": []
}
```

### Минимальный plugin.ts

```typescript
import { BasePlugin } from '@loginus/plugin-sdk';
import { OnEvent } from '@loginus/plugin-sdk/decorators';

export default class MyPlugin extends BasePlugin {
  
  async onEnable(): Promise<void> {
    this.log('My Plugin enabled!');
  }

  @OnEvent('user.after_login', 10) // приоритет 10
  async handleUserLogin(payload: any, context: any): Promise<void> {
    this.log(`User logged in: ${payload.userId}`);
    
    // Ваша бизнес-логика здесь
    // Например, отправка уведомления
  }

  @OnEvent('user.after_create')
  async handleUserCreate(payload: any): Promise<void> {
    this.log(`New user created: ${payload.userId}`);
  }
}
```

---

## Архитектура плагина

### BasePlugin API

Все плагины наследуются от `BasePlugin` и имеют доступ к следующим методам:

#### Lifecycle Hooks

```typescript
class MyPlugin extends BasePlugin {
  // Вызывается при включении плагина
  async onEnable(): Promise<void> {
    // Инициализация
  }

  // Вызывается при выключении плагина
  async onDisable(): Promise<void> {
    // Очистка ресурсов
  }

  // Вызывается при удалении плагина
  async onUninstall(): Promise<void> {
    // Удаление данных
  }
}
```

#### Event Methods

```typescript
// Подписка на событие
this.subscribe(
  'user.login',           // eventName
  this.handleLogin,       // handler
  50,                     // priority (меньше = выше)
  false                   // once (одноразовая подписка)
);

// Генерация события
await this.emit('my-plugin.notification-sent', {
  userId: '123',
  type: 'email'
});
```

#### Logging Methods

```typescript
this.log('Info message');           // INFO уровень
this.warn('Warning message');       // WARNING уровень
this.error('Error message', trace); // ERROR уровень
```

---

## Система событий

### Стандартные события

#### Аутентификация (AUTH_EVENTS)

```typescript
AUTH_EVENTS.BEFORE_LOGIN         // user.before_login
AUTH_EVENTS.AFTER_LOGIN          // user.after_login
AUTH_EVENTS.LOGIN_FAILED         // user.login_failed
AUTH_EVENTS.BEFORE_REGISTER      // user.before_register
AUTH_EVENTS.AFTER_REGISTER       // user.after_register
AUTH_EVENTS.REGISTER_FAILED      // user.register_failed
AUTH_EVENTS.TOKEN_REFRESH        // user.token_refresh
AUTH_EVENTS.SESSION_EXPIRED      // user.session_expired
```

**Payload Example (AFTER_LOGIN):**
```typescript
{
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}
```

#### Пользователи (USER_EVENTS)

```typescript
USER_EVENTS.BEFORE_CREATE       // user.before_create
USER_EVENTS.AFTER_CREATE        // user.after_create
USER_EVENTS.BEFORE_UPDATE       // user.before_update
USER_EVENTS.AFTER_UPDATE        // user.after_update
USER_EVENTS.BEFORE_DELETE       // user.before_delete
USER_EVENTS.AFTER_DELETE        // user.after_delete
USER_EVENTS.PROFILE_UPDATED     // user.profile_updated
USER_EVENTS.ROLE_CHANGED        // user.role_changed
```

#### Меню (MENU_EVENTS)

```typescript
MENU_EVENTS.BEFORE_RENDER       // menu.before_render
MENU_EVENTS.AFTER_RENDER        // menu.after_render
MENU_EVENTS.STRUCTURE_CHANGED   // menu.structure_changed
MENU_EVENTS.ITEM_CREATED        // menu.item.created
MENU_EVENTS.ITEM_UPDATED        // menu.item.updated
MENU_EVENTS.ITEM_DELETED        // menu.item.deleted
```

#### Виджеты (WIDGET_EVENTS)

```typescript
WIDGET_EVENTS.BEFORE_LOAD       // widget.before_load
WIDGET_EVENTS.AFTER_LOAD        // widget.after_load
WIDGET_EVENTS.BEFORE_RENDER     // widget.before_render
WIDGET_EVENTS.AFTER_RENDER      // widget.after_render
```

#### Плагины (PLUGIN_EVENTS)

```typescript
PLUGIN_EVENTS.INSTALLED         // plugin.installed
PLUGIN_EVENTS.ENABLED           // plugin.enabled
PLUGIN_EVENTS.DISABLED          // plugin.disabled
PLUGIN_EVENTS.UNINSTALLED       // plugin.uninstalled
```

### Приоритеты обработчиков

Обработчики выполняются в порядке приоритета (меньше число = выше приоритет):

- **0-10**: Критические системные операции
- **10-50**: Высокий приоритет (безопасность, аудит)
- **50-100**: Нормальный приоритет (бизнес-логика)
- **100-150**: Низкий приоритет (уведомления, логирование)

```typescript
@OnEvent('user.after_login', 10)  // Выполнится первым
async criticalHandler() { }

@OnEvent('user.after_login', 100) // Выполнится последним
async notificationHandler() { }
```

### Wildcard подписки

```typescript
@OnEvent('user.*')  // Все события пользователей
async handleAllUserEvents(payload: any, context: any) {
  console.log(`Event: ${context.eventName}`);
}

@OnEvent('menu.item.*')  // Все события пунктов меню
async handleAllMenuItemEvents(payload: any, context: any) {
  // ...
}
```

---

## Типы расширений

### 1. Plugin (плагин с бизнес-логикой)

**manifest.json:**
```json
{
  "extensionType": "plugin",
  "ui": {
    "type": "none"  // или "iframe", "embedded", "external_link"
  }
}
```

**Пример использования:**
- Отправка email уведомлений
- Интеграция с внешними API
- Бизнес-логика и автоматизация

### 2. Widget (виджет для дашборда)

**manifest.json:**
```json
{
  "extensionType": "widget",
  "ui": {
    "type": "iframe",
    "entryFile": "/widget/index.html",
    "icon": "chart-bar"
  }
}
```

**Пример использования:**
- Графики и аналитика
- Быстрые действия
- Информационные карточки

### 3. Menu Item Plugin (пункт меню)

**manifest.json:**
```json
{
  "extensionType": "menu_item",
  "ui": {
    "type": "iframe",
    "entryFile": "/app/index.html",
    "path": "/my-app",
    "label": "My Application",
    "labelRu": "Моё приложение",
    "labelEn": "My Application",
    "icon": "puzzle"
  }
}
```

---

## API Reference

### EventContext

```typescript
interface EventContext {
  eventName: string;        // Название события
  payload: any;             // Данные события
  timestamp: Date;          // Время события
  pluginId?: string;        // ID плагина-источника
  correlationId?: string;   // ID для отслеживания цепочки
}
```

### EventBusService Methods

```typescript
// Генерация события
await eventBus.emit(
  'event.name',
  { data: 'payload' },
  'plugin-id',           // опционально
  'correlation-id'       // опционально
);

// Подписка
eventBus.subscribe(
  'event.name',
  handler,
  priority,
  pluginId,
  once
);

// Отписка
eventBus.unsubscribe('event.name', handler);

// Статистика
const stats = eventBus.getStats();
```

---

## Примеры

### 1. Email Notification Plugin (простой)

```typescript
import { BasePlugin } from '@loginus/plugin-sdk';
import { OnEvent } from '@loginus/plugin-sdk/decorators';

export default class EmailNotificationPlugin extends BasePlugin {
  
  @OnEvent('user.after_register', 100)
  async sendWelcomeEmail(payload: any) {
    const { userId, email, firstName } = payload;
    
    this.log(`Sending welcome email to ${email}`);
    
    // Отправка email через внешний сервис
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Loginus!',
      body: `Hi ${firstName}, welcome aboard!`
    });
  }

  @OnEvent('user.password_changed', 100)
  async sendPasswordChangedEmail(payload: any) {
    const { userId, email } = payload;
    
    this.log(`Sending password changed notification to ${email}`);
    
    await this.sendEmail({
      to: email,
      subject: 'Password Changed',
      body: 'Your password was changed successfully.'
    });
  }

  private async sendEmail(options: any) {
    // Логика отправки email
    // Например, через SendGrid, Mailgun, etc.
  }
}
```

### 2. Analytics Plugin (с модификацией данных)

```typescript
export default class AnalyticsPlugin extends BasePlugin {
  
  @OnEvent('user.after_login', 50)
  async trackLogin(payload: any) {
    await this.trackEvent('user_login', {
      userId: payload.userId,
      timestamp: new Date(),
      ip: payload.ipAddress,
      userAgent: payload.userAgent
    });
  }

  @OnEvent('widget.before_render', 5)
  async enrichWidgetData(payload: any) {
    // Модифицируем данные виджета перед отображением
    if (payload.widgetId === 'analytics-dashboard') {
      payload.data = {
        ...payload.data,
        totalUsers: await this.getUserCount(),
        activeToday: await this.getActiveUsersToday()
      };
    }
  }

  private async trackEvent(name: string, data: any) {
    // Отправка в аналитику
  }

  private async getUserCount(): Promise<number> {
    // Получение количества пользователей
    return 0;
  }

  private async getActiveUsersToday(): Promise<number> {
    // Получение активных пользователей
    return 0;
  }
}
```

---

## Best Practices

### 1. Обработка ошибок

```typescript
@OnEvent('user.after_create')
async handleUserCreate(payload: any) {
  try {
    // Ваш код
    await this.someAsyncOperation();
  } catch (error) {
    this.error('Failed to handle user create', error.stack);
    // НЕ пробрасывайте ошибку - она не должна ломать другие плагины
  }
}
```

### 2. Асинхронные операции

```typescript
// ✅ ПРАВИЛЬНО: используйте async/await
@OnEvent('user.login')
async handleLogin(payload: any) {
  await this.sendNotification(payload.userId);
}

// ❌ НЕПРАВИЛЬНО: не забывайте await
@OnEvent('user.login')
async handleLogin(payload: any) {
  this.sendNotification(payload.userId); // Операция может не завершиться
}
```

### 3. Производительность

```typescript
// ✅ ПРАВИЛЬНО: быстрые операции в обработчике
@OnEvent('user.login', 100)
async handleLogin(payload: any) {
  // Быстрое логирование
  this.log(`User ${payload.userId} logged in`);
  
  // Тяжёлые операции - в фоне
  setImmediate(() => this.heavyOperation(payload));
}

// ❌ НЕПРАВИЛЬНО: блокировка события
@OnEvent('user.login')
async handleLogin(payload: any) {
  await this.sendMultipleEmails(); // 5+ секунд
  await this.updateStatistics();   // Замедлит вход
}
```

### 4. Очистка ресурсов

```typescript
async onDisable() {
  // Закрываем соединения
  await this.closeDatabase();
  
  // Отменяем таймеры
  if (this.timer) {
    clearInterval(this.timer);
  }
  
  // Очищаем кеш
  this.cache.clear();
}
```

### 5. Версионирование

```json
{
  "version": "1.0.0",
  "minLoginus Version": "2.0.0",
  "maxLoginusVersion": "2.9.9"
}
```

---

## FAQ

### Как протестировать плагин локально?

1. Создайте структуру плагина
2. Скомпилируйте TypeScript: `tsc plugin.ts`
3. Упакуйте в .zip: `zip -r my-plugin.zip .`
4. Загрузите через админку: `/admin/extensions/plugins/upload`

### Можно ли блокировать события?

Нет, система не поддерживает блокировку событий. Все события асинхронные и не возвращают результат.

### Как общаться между плагинами?

Используйте пользовательские события:

```typescript
// Плагин A генерирует событие
await this.emit('my-plugin-a.data-processed', { data: '...' });

// Плагин B подписывается
@OnEvent('my-plugin-a.data-processed')
async handleDataFromA(payload: any) {
  // Обработка
}
```

### Как хранить данные плагина?

Используйте API базы данных через конфигурацию плагина или создайте собственные таблицы через миграции.

### Как обновить плагин?

1. Увеличьте версию в `manifest.json`
2. Загрузите новый .zip через админку
3. Система автоматически выполнит миграцию

### Что делать если плагин не загружается?

1. Проверьте логи: `docker logs loginus-backend-new`
2. Убедитесь что `manifest.json` корректный
3. Проверьте что `plugin.js` скомпилирован
4. Проверьте права доступа к файлам

---

## Полезные ссылки

- [API Reference](./API_REFERENCE.md)
- [Event System README](../backend/src/core/events/README.md)
- [Extension System Roadmap](./extension-system-final-roadmap.md)
- [Example Plugins](./examples/)

---

**© 2025 Loginus Platform | Developer Documentation**

