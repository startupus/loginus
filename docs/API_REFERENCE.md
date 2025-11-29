# Loginus Event System - API Reference

> Полный справочник по событиям и API системы расширений

## Содержание

1. [События аутентификации](#события-аутентификации)
2. [События пользователей](#события-пользователей)
3. [События меню](#события-меню)
4. [События виджетов](#события-виджетов)
5. [События плагинов](#события-плагинов)
6. [События данных](#события-данных)
7. [Системные события](#системные-события)
8. [EventBusService API](#eventbusservice-api)

---

## События аутентификации

### AUTH_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `BEFORE_LOGIN` | `auth.before_login` | Перед попыткой входа | `{ login: string, ipAddress?: string, userAgent?: string }` |
| `AFTER_LOGIN` | `auth.after_login` | После успешного входа | `{ userId: string, email: string, ipAddress?: string, userAgent?: string }` |
| `LOGIN_FAILED` | `auth.login_failed` | При неудачной попытке входа | `{ login: string, userId?: string, reason: string }` |
| `BEFORE_REGISTER` | `auth.before_register` | Перед регистрацией | `{ email: string, firstName: string, lastName: string, ipAddress?: string, userAgent?: string }` |
| `AFTER_REGISTER` | `auth.after_register` | После успешной регистрации | `{ userId: string, email: string, firstName: string, lastName: string, ipAddress?: string, userAgent?: string }` |
| `REGISTER_FAILED` | `auth.register_failed` | При ошибке регистрации | `{ email: string, reason: string }` |
| `TOKEN_REFRESH` | `auth.token_refresh` | При обновлении токена | `{ userId: string, oldToken: string, newToken: string }` |
| `SESSION_EXPIRED` | `auth.session_expired` | При истечении сессии | `{ userId: string, sessionId: string }` |
| `TWO_FACTOR_ENABLED` | `auth.two_factor_enabled` | При включении 2FA | `{ userId: string, method: string }` |
| `TWO_FACTOR_DISABLED` | `auth.two_factor_disabled` | При отключении 2FA | `{ userId: string }` |

**Пример:**
```typescript
@OnEvent('auth.after_login', 50)
async onLogin(payload: { userId: string; email: string }, context: EventContext) {
  console.log(`User ${payload.email} logged in at ${context.timestamp}`);
}
```

---

## События пользователей

### USER_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `BEFORE_CREATE` | `user.before_create` | Перед созданием пользователя | `{ userData: Partial<User> }` |
| `AFTER_CREATE` | `user.after_create` | После создания пользователя | `{ userId: string, email: string, userData: Partial<User> }` |
| `BEFORE_UPDATE` | `user.before_update` | Перед обновлением профиля | `{ userId: string, oldData: User, newData: Partial<User> }` |
| `AFTER_UPDATE` | `user.after_update` | После обновления профиля | `{ userId: string, updatedData: Partial<User> }` |
| `BEFORE_DELETE` | `user.before_delete` | Перед удалением пользователя | `{ userId: string, email: string }` |
| `AFTER_DELETE` | `user.after_delete` | После удаления пользователя | `{ userId: string, email: string }` |
| `LOGIN` | `user.login` | При входе (deprecated, используйте `auth.after_login`) | `{ userId: string }` |
| `LOGOUT` | `user.logout` | При выходе | `{ userId: string }` |
| `PASSWORD_CHANGED` | `user.password_changed` | При смене пароля | `{ userId: string, email: string }` |
| `ROLE_CHANGED` | `user.role_changed` | При изменении роли | `{ userId: string, oldRole: string, newRole: string }` |
| `PROFILE_UPDATED` | `user.profile_updated` | При обновлении профиля | `{ userId: string, fields: string[] }` |

**Wildcard:** `user.*` - все события пользователей

---

## События меню

### MENU_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `BEFORE_RENDER` | `menu.before_render` | Перед загрузкой меню | `{ menuId: string, items: MenuItemConfig[] }` |
| `AFTER_RENDER` | `menu.after_render` | После загрузки меню | `{ menuId: string, items: MenuItemConfig[] }` |
| `ITEM_BEFORE_CLICK` | `menu.item.before_click` | Перед кликом на пункт | `{ itemId: string, userId: string }` |
| `ITEM_AFTER_CLICK` | `menu.item.after_click` | После клика на пункт | `{ itemId: string, userId: string }` |
| `ITEM_CREATED` | `menu.item.created` | При создании пункта меню | `{ itemId: string, menuId: string, config: MenuItemConfig }` |
| `ITEM_UPDATED` | `menu.item.updated` | При обновлении пункта | `{ itemId: string, oldConfig: MenuItemConfig, newConfig: MenuItemConfig }` |
| `ITEM_DELETED` | `menu.item.deleted` | При удалении пункта | `{ itemId: string, menuId: string }` |
| `STRUCTURE_CHANGED` | `menu.structure_changed` | При изменении структуры | `{ menuId: string, items: MenuItemConfig[], userId: string }` |

**Wildcard:** `menu.*`, `menu.item.*`

**Пример модификации меню:**
```typescript
@OnEvent('menu.before_render', 10)
async addCustomMenuItems(payload: any) {
  // Добавляем свой пункт в меню
  payload.items.push({
    id: 'my-custom-item',
    type: 'external',
    label: 'My Feature',
    path: '/my-feature',
    icon: 'star',
    enabled: true,
    order: 999
  });
}
```

---

## События виджетов

### WIDGET_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `BEFORE_LOAD` | `widget.before_load` | Перед загрузкой виджета | `{ widgetId: string, userId: string }` |
| `AFTER_LOAD` | `widget.after_load` | После загрузки виджета | `{ widgetId: string, userId: string, data: any }` |
| `BEFORE_RENDER` | `widget.before_render` | Перед отрисовкой виджета | `{ widgetId: string, data: any }` |
| `AFTER_RENDER` | `widget.after_render` | После отрисовки виджета | `{ widgetId: string, renderTime: number }` |
| `DATA_RECEIVED` | `widget.data_received` | При получении данных | `{ widgetId: string, data: any, source: string }` |
| `ERROR` | `widget.error` | При ошибке виджета | `{ widgetId: string, error: string }` |
| `CREATED` | `widget.created` | При создании виджета | `{ widgetId: string, config: any }` |
| `UPDATED` | `widget.updated` | При обновлении виджета | `{ widgetId: string, oldConfig: any, newConfig: any }` |
| `DELETED` | `widget.deleted` | При удалении виджета | `{ widgetId: string }` |
| `REGISTERED` | `widget.registered` | Когда плагин регистрирует виджет | `{ widgetId: string, pluginId: string }` |
| `UNREGISTERED` | `widget.unregistered` | При отмене регистрации | `{ widgetId: string, pluginId: string }` |

**Wildcard:** `widget.*`

---

## События плагинов

### PLUGIN_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `INSTALLING` | `plugin.installing` | Начало установки | `{ pluginId: string, name: string }` |
| `INSTALLED` | `plugin.installed` | После установки | `{ extensionId: string, slug: string, name: string, extensionType: string }` |
| `INSTALL_FAILED` | `plugin.install_failed` | При ошибке установки | `{ name: string, error: string }` |
| `ENABLING` | `plugin.enabling` | Начало включения | `{ pluginId: string }` |
| `ENABLED` | `plugin.enabled` | После включения | `{ extensionId: string, slug: string, name: string }` |
| `ENABLE_FAILED` | `plugin.enable_failed` | При ошибке включения | `{ pluginId: string, error: string }` |
| `DISABLING` | `plugin.disabling` | Начало отключения | `{ pluginId: string }` |
| `DISABLED` | `plugin.disabled` | После отключения | `{ extensionId: string, slug: string, name: string }` |
| `DISABLE_FAILED` | `plugin.disable_failed` | При ошибке отключения | `{ pluginId: string, error: string }` |
| `UNINSTALLING` | `plugin.uninstalling` | Начало удаления | `{ pluginId: string }` |
| `UNINSTALLED` | `plugin.uninstalled` | После удаления | `{ extensionId: string, slug: string, name: string }` |
| `UNINSTALL_FAILED` | `plugin.uninstall_failed` | При ошибке удаления | `{ pluginId: string, error: string }` |
| `UPDATING` | `plugin.updating` | Начало обновления | `{ pluginId: string, oldVersion: string, newVersion: string }` |
| `UPDATED` | `plugin.updated` | После обновления | `{ pluginId: string, version: string }` |
| `CONFIG_CHANGED` | `plugin.config_changed` | При изменении конфига | `{ pluginId: string, oldConfig: any, newConfig: any }` |
| `LOADING` | `plugin.loading` | Начало загрузки кода | `{ pluginId: string }` |
| `LOADED` | `plugin.loaded` | После загрузки кода | `{ pluginId: string }` |
| `LOAD_FAILED` | `plugin.load_failed` | При ошибке загрузки | `{ pluginId: string, error: string }` |
| `ERROR` | `plugin.error` | При любой ошибке плагина | `{ pluginId: string, error: string, stack?: string }` |

**Wildcard:** `plugin.*`

---

## События данных

### DATA_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `DOCUMENT_BEFORE_CREATE` | `data.document.before_create` | Перед созданием документа | `{ userId: string, documentData: any }` |
| `DOCUMENT_AFTER_CREATE` | `data.document.after_create` | После создания документа | `{ documentId: string, userId: string }` |
| `DOCUMENT_BEFORE_UPDATE` | `data.document.before_update` | Перед обновлением документа | `{ documentId: string, oldData: any, newData: any }` |
| `DOCUMENT_AFTER_UPDATE` | `data.document.after_update` | После обновления документа | `{ documentId: string, changes: any }` |
| `ADDRESS_BEFORE_CREATE` | `data.address.before_create` | Перед созданием адреса | `{ userId: string, addressData: any }` |
| `ADDRESS_AFTER_CREATE` | `data.address.after_create` | После создания адреса | `{ addressId: string, userId: string }` |
| `FAMILY_MEMBER_ADDED` | `data.family.member_added` | При добавлении члена семьи | `{ familyId: string, memberId: string }` |
| `FAMILY_MEMBER_REMOVED` | `data.family.member_removed` | При удалении члена семьи | `{ familyId: string, memberId: string }` |
| `VALIDATED` | `data.validated` | При валидации данных | `{ type: string, isValid: boolean }` |

**Wildcard:** `data.*`, `data.document.*`, `data.address.*`

---

## Системные события

### SYSTEM_EVENTS

| Событие | Название | Когда вызывается | Payload |
|---------|----------|------------------|---------|
| `STARTUP` | `system.startup` | При запуске приложения | `{ version: string, environment: string, timestamp: Date }` |
| `SHUTDOWN` | `system.shutdown` | При остановке приложения | `{ graceful: boolean }` |
| `READY` | `system.ready` | Когда система готова | `{ modules: string[] }` |
| `CONFIG_CHANGED` | `system.config_changed` | При изменении конфигурации | `{ key: string, oldValue: any, newValue: any }` |
| `CONFIG_RELOADED` | `system.config_reloaded` | При перезагрузке конфига | `{ config: any }` |
| `HEALTH_CHECK` | `system.health_check` | При проверке здоровья | `{ status: string, services: any[] }` |
| `ERROR` | `system.error` | При системной ошибке | `{ error: string, stack?: string, context?: string }` |
| `WARNING` | `system.warning` | При предупреждении | `{ message: string, context?: string }` |

**Wildcard:** `system.*`

---

## EventBusService API

### Methods

#### emit()

Генерирует событие для всех подписчиков.

```typescript
async emit(
  eventName: string,
  payload: any,
  pluginId?: string,
  correlationId?: string
): Promise<void>
```

**Параметры:**
- `eventName` - название события
- `payload` - данные события
- `pluginId` - ID плагина-источника (опционально)
- `correlationId` - ID для отслеживания цепочки событий (опционально)

**Пример:**
```typescript
await this.eventBus.emit('user.profile_updated', {
  userId: '123',
  fields: ['firstName', 'lastName']
}, 'my-plugin-id');
```

---

#### subscribe()

Подписка на событие.

```typescript
subscribe(
  eventName: string,
  handler: EventHandler,
  priority?: number,
  pluginId?: string,
  once?: boolean
): void
```

**Параметры:**
- `eventName` - название события (поддерживает wildcards: `user.*`)
- `handler` - функция-обработчик
- `priority` - приоритет (default: 100, меньше = выше)
- `pluginId` - ID плагина (опционально)
- `once` - одноразовая подписка (default: false)

**Пример:**
```typescript
this.eventBus.subscribe(
  'user.after_login',
  async (payload, context) => {
    console.log('User logged in:', payload.userId);
  },
  50,
  'my-plugin'
);
```

---

#### unsubscribe()

Отписка от события.

```typescript
unsubscribe(eventName: string, handler: EventHandler): void
```

**Пример:**
```typescript
const handler = (payload) => { /* ... */ };
this.eventBus.subscribe('user.login', handler);
// Позже
this.eventBus.unsubscribe('user.login', handler);
```

---

#### getStats()

Получение статистики по обработчикам.

```typescript
getStats(): {
  totalHandlers: number;
  eventCounts: Array<{ eventName: string; handlerCount: number }>;
}
```

**Пример:**
```typescript
const stats = this.eventBus.getStats();
console.log(`Total handlers: ${stats.totalHandlers}`);
console.log('Events:', stats.eventCounts);
```

---

## EventHandler Interface

```typescript
interface EventHandler {
  (payload: EventPayload, context: EventContext): Promise<void> | void;
}

interface EventPayload {
  [key: string]: any;
}

interface EventContext {
  eventName: string;
  payload: EventPayload;
  timestamp: Date;
  pluginId?: string;
  correlationId?: string;
}
```

---

## Decorators

### @OnEvent()

Декоратор для автоматической регистрации обработчика события.

```typescript
@OnEvent(eventName: string, priority?: number)
```

**Параметры:**
- `eventName` - название события или wildcard
- `priority` - приоритет обработчика (default: 100)

**Пример:**
```typescript
@OnEvent('user.after_login', 10)
async handleLogin(payload: any, context: EventContext) {
  // Высокоприоритетная обработка
}

@OnEvent('user.*', 150)
async logAllUserEvents(payload: any, context: EventContext) {
  // Низкоприоритетное логирование
}
```

---

### @EmitsEvent()

Декоратор для документирования генерируемых событий (используется для статического анализа).

```typescript
@EmitsEvent(eventName: string)
```

**Пример:**
```typescript
@EmitsEvent('my-plugin.notification-sent')
async sendNotification(userId: string) {
  await this.emit('my-plugin.notification-sent', { userId });
}
```

---

## Event Logging

Все события автоматически логируются в таблицу `event_logs`:

```sql
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventName" VARCHAR(255) NOT NULL,
  payload JSONB,
  "pluginId" UUID,
  status VARCHAR(50) NOT NULL,
  error TEXT,
  "executionTime" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Просмотр логов:**
```sql
-- Последние 10 событий
SELECT "eventName", status, "executionTime", "createdAt" 
FROM event_logs 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Ошибки
SELECT "eventName", error, "createdAt" 
FROM event_logs 
WHERE status = 'error' 
ORDER BY "createdAt" DESC;

-- Статистика по событиям
SELECT "eventName", COUNT(*) as count, AVG("executionTime") as avg_time
FROM event_logs
GROUP BY "eventName"
ORDER BY count DESC;

-- События конкретного плагина
SELECT "eventName", status, "executionTime"
FROM event_logs
WHERE "pluginId" = 'your-plugin-id'
ORDER BY "createdAt" DESC;
```

---

## Примеры использования

### Пример 1: Аудит действий пользователя

```typescript
export default class AuditPlugin extends BasePlugin {
  
  @OnEvent('user.*', 120)
  async auditUserAction(payload: any, context: EventContext) {
    await this.saveToAuditLog({
      event: context.eventName,
      userId: payload.userId,
      timestamp: context.timestamp,
      details: payload
    });
  }

  private async saveToAuditLog(data: any) {
    // Сохранение в отдельную таблицу аудита
  }
}
```

### Пример 2: Интеграция с CRM

```typescript
export default class CRMIntegrationPlugin extends BasePlugin {
  
  @OnEvent('user.after_create', 50)
  async syncUserToCRM(payload: any) {
    const { userId, email, firstName, lastName } = payload;
    
    try {
      await this.crmApi.createContact({
        externalId: userId,
        email,
        firstName,
        lastName,
        source: 'Loginus'
      });
      
      this.log(`User ${email} synced to CRM`);
    } catch (error) {
      this.error('Failed to sync user to CRM', error.stack);
    }
  }

  @OnEvent('user.after_update', 50)
  async updateCRMContact(payload: any) {
    // Обновление контакта в CRM
  }
}
```

### Пример 3: Уведомления в Telegram

```typescript
export default class TelegramNotificationPlugin extends BasePlugin {
  private bot: TelegramBot;

  async onEnable() {
    this.bot = new TelegramBot(this.config.botToken);
    this.log('Telegram bot initialized');
  }

  @OnEvent('payment.success', 100)
  async notifyPaymentSuccess(payload: any) {
    const { userId, amount, currency } = payload;
    
    // Получаем telegram ID пользователя
    const telegramId = await this.getUserTelegramId(userId);
    if (telegramId) {
      await this.bot.sendMessage(
        telegramId,
        `✅ Платеж успешен! Сумма: ${amount} ${currency}`
      );
    }
  }

  @OnEvent('system.error', 10)
  async notifyAdminAboutError(payload: any) {
    const adminTelegramId = this.config.adminTelegramId;
    await this.bot.sendMessage(
      adminTelegramId,
      `🚨 System Error: ${payload.error}`
    );
  }
}
```

---

## Ограничения и рекомендации

### Ограничения

1. **Нет блокировки событий** - события асинхронные, результат не возвращается
2. **Нет гарантии порядка** - обработчики с одинаковым приоритетом могут выполняться в любом порядке
3. **Изоляция** - плагины не имеют прямого доступа друг к другу
4. **Время выполнения** - обработчики не должны выполняться > 5 секунд

### Рекомендации

1. **Используйте wildcard подписки** для группировки логики
2. **Устанавливайте правильные приоритеты** (0-10 для критических операций)
3. **Не блокируйте события** - тяжёлые операции выполняйте асинхронно
4. **Логируйте ошибки** - используйте `this.error()` для отладки
5. **Очищайте ресурсы** - всегда реализуйте `onDisable()`

---

## Дополнительные ресурсы

- [Developer Guide](./PLUGIN_DEVELOPER_GUIDE.md)
- [Event System README](../backend/src/core/events/README.md)
- [Extension Roadmap](./extension-system-final-roadmap.md)
- [Example Plugins](./examples/)

---

**Версия:** 1.0.0  
**Дата обновления:** 29 ноября 2025  
**© Loginus Platform**

