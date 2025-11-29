# Backend-Only Event System - Детальный план

## 🎯 Цель
Внедрить event-driven систему плагинов **без изменения фронтенда**.

---

## 📐 Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  Event Bus   │◄───────►│   Plugin     │                │
│  │  Service     │         │   Registry   │                │
│  └──────┬───────┘         └──────────────┘                │
│         │                                                   │
│         │ События                                          │
│         │                                                   │
│  ┌──────┴──────────────────────────────────────┐          │
│  │                                               │          │
│  ▼                  ▼                  ▼        ▼          │
│  Backend Event    Content            System    Custom      │
│  Plugins          Plugins            Plugins   Plugins     │
│  ─────────────────────────────────────────────────────     │
│  • Email          • Data transform   • Logging  • Analytics│
│  • Webhooks       • Validation       • Audit    • Reports  │
│  • Sync           • Enrichment       • Backup   • Custom   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ REST API (без изменений)
                          │ GET /profile/menu
                          │ GET /admin/menu-settings
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (БЕЗ ИЗМЕНЕНИЙ)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PageTemplate ◄── Menu Config (JSON)                       │
│      │                                                      │
│      └──► Sidebar                                          │
│             ├── UI Plugin 1 (iframe)                       │
│             ├── UI Plugin 2 (embedded)                     │
│             └── UI Plugin 3 (external)                     │
│                                                             │
│  Backend Event Plugins НЕ отображаются в меню              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Типы плагинов

### 1. Backend Event Plugin (новый тип)
**Назначение:** Обработка событий на бэкенде  
**Отображается в меню:** ❌ Нет  
**Файлы:** Только бэкенд код

**Пример:**
```typescript
// plugins/email-notifications/index.ts
export class EmailNotificationPlugin extends EventPlugin {
  constructor() {
    super({
      slug: 'email-notifications',
      name: 'Email Notifications',
      type: 'backend-event', // Новый тип
      version: '1.0.0',
      events: {
        subscribes: ['user.created', 'user.login', 'data.updated']
      }
    });
  }
  
  registerEventHandlers() {
    this.on('user.created', async (event) => {
      await this.sendEmail({
        to: event.data.user.email,
        template: 'welcome',
        data: event.data.user
      });
    });
    
    this.on('user.login', async (event) => {
      if (event.data.isFirstLogin) {
        await this.sendEmail({
          to: event.data.user.email,
          template: 'first-login',
          data: event.data.user
        });
      }
    });
  }
}
```

### 2. UI Plugin (существующий тип)
**Назначение:** Отображение в меню  
**Отображается в меню:** ✅ Да  
**Файлы:** Фронтенд (iframe/embedded)

**Без изменений! Работает как сейчас.**

### 3. Hybrid Plugin (новый тип)
**Назначение:** UI + Backend логика  
**Отображается в меню:** ✅ Да  
**Файлы:** Бэкенд + Фронтенд

**Пример:**
```typescript
// plugins/analytics-dashboard/backend/index.ts
export class AnalyticsPlugin extends EventPlugin {
  constructor() {
    super({
      slug: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      type: 'hybrid',
      version: '1.0.0',
      ui: {
        menuItem: {
          path: '/analytics',
          label: 'Аналитика',
          icon: 'chart-bar',
          type: 'embedded',
          embeddedAppUrl: 'http://analytics.example.com/app'
        }
      },
      events: {
        subscribes: ['user.login', 'data.created', 'data.updated']
      }
    });
  }
  
  registerEventHandlers() {
    // Собираем статистику при событиях
    this.on('user.login', async (event) => {
      await this.analytics.trackEvent('login', event.data);
    });
    
    this.on('data.created', async (event) => {
      await this.analytics.trackEvent('data_create', event.data);
    });
  }
  
  // API endpoints для фронтенда
  @Get('/analytics/stats')
  async getStats() {
    return this.analytics.getAggregatedStats();
  }
}

// Frontend плагин получает данные через API
// analytics.example.com/app
fetch('/api/plugins/analytics-dashboard/analytics/stats')
  .then(r => r.json())
  .then(stats => {
    // Отображаем статистику в UI
  });
```

---

## 🗄️ База данных (расширение существующей)

```sql
-- Добавляем новый тип плагина в существующую таблицу plugins
ALTER TYPE plugin_type ADD VALUE 'backend-event';
ALTER TYPE plugin_type ADD VALUE 'hybrid';

-- Таблица для event_log (опционально, для debugging)
CREATE TABLE plugin_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(255) NOT NULL,
  plugin_id UUID REFERENCES plugins(id),
  payload JSONB,
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE INDEX idx_event_log_name ON plugin_event_log(event_name);
CREATE INDEX idx_event_log_plugin ON plugin_event_log(plugin_id);
CREATE INDEX idx_event_log_created ON plugin_event_log(created_at);
```

---

## 📝 Изменения в манифесте плагина

```typescript
interface PluginManifest {
  slug: string;
  name: string;
  version: string;
  type: 'backend-event' | 'ui' | 'hybrid'; // Расширяем типы
  
  // Для backend-event и hybrid
  events?: {
    subscribes: string[]; // События, на которые подписывается
    emits?: string[]; // События, которые генерирует
  };
  
  // Для ui и hybrid
  ui?: {
    menuItem?: {
      path: string;
      label: string;
      icon?: string;
      type: 'iframe' | 'embedded' | 'external';
      iframeUrl?: string;
      embeddedAppUrl?: string;
      externalUrl?: string;
    };
  };
  
  // Для hybrid - API endpoints
  endpoints?: {
    basePath: string; // Например: /plugins/my-plugin
    routes: RouteDefinition[];
  };
}
```

---

## 🔧 Реализация Event Bus

```typescript
// backend/src/core/events/event-bus.service.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface EventPayload {
  name: string;
  data: any;
  timestamp: Date;
  source: string; // Откуда пришло событие
  metadata?: Record<string, any>;
}

export interface EventHandler {
  handle(payload: EventPayload): Promise<void | boolean>;
  priority?: number; // 0-100, чем больше, тем раньше выполнится
}

@Injectable()
export class EventBusService {
  private handlers = new Map<string, EventHandler[]>();
  
  constructor(
    private eventEmitter: EventEmitter2,
    private eventLog: EventLogService // Для логирования
  ) {}
  
  /**
   * Подписаться на событие
   */
  on(event: string, handler: EventHandler, priority = 50): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    
    const handlers = this.handlers.get(event)!;
    handlers.push({ ...handler, priority });
    
    // Сортируем по приоритету
    handlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  /**
   * Отписаться от события
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
  
  /**
   * Генерировать событие
   */
  async emit(event: string, data: any, source = 'system'): Promise<void> {
    const payload: EventPayload = {
      name: event,
      data,
      timestamp: new Date(),
      source
    };
    
    // Логируем событие
    await this.eventLog.log(payload);
    
    // Получаем обработчики
    const handlers = this.handlers.get(event) || [];
    
    // Выполняем обработчики последовательно (по приоритету)
    for (const handler of handlers) {
      try {
        const result = await handler.handle(payload);
        
        // Если обработчик вернул false, останавливаем цепочку
        if (result === false) {
          break;
        }
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
        await this.eventLog.logError(payload, error);
      }
    }
    
    // Также используем встроенный EventEmitter для внутренних нужд
    this.eventEmitter.emit(event, payload);
  }
  
  /**
   * Получить список всех событий
   */
  getAllEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
  
  /**
   * Получить обработчики для события
   */
  getHandlers(event: string): EventHandler[] {
    return this.handlers.get(event) || [];
  }
}
```

---

## 📋 Стандартные события системы

```typescript
// backend/src/core/events/system-events.ts
export enum UserEvents {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_PASSWORD_CHANGED = 'user.password_changed',
  USER_EMAIL_VERIFIED = 'user.email_verified',
}

export enum AuthEvents {
  BEFORE_LOGIN = 'auth.before_login',
  AFTER_LOGIN = 'auth.after_login',
  LOGIN_FAILED = 'auth.login_failed',
  TOKEN_REFRESH = 'auth.token_refresh',
  SESSION_EXPIRED = 'auth.session_expired',
}

export enum DataEvents {
  DATA_CREATED = 'data.created',
  DATA_UPDATED = 'data.updated',
  DATA_DELETED = 'data.deleted',
  DATA_VALIDATED = 'data.validated',
  DATA_EXPORTED = 'data.exported',
}

export enum SystemEvents {
  SYSTEM_STARTED = 'system.started',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  PLUGIN_INSTALLED = 'system.plugin.installed',
  PLUGIN_ENABLED = 'system.plugin.enabled',
  PLUGIN_DISABLED = 'system.plugin.disabled',
  CONFIG_CHANGED = 'system.config.changed',
}
```

---

## 🔌 Как плагины регистрируются

```typescript
// backend/src/plugins/plugin-loader.service.ts
@Injectable()
export class PluginLoaderService {
  constructor(
    private eventBus: EventBusService,
    private pluginRegistry: PluginRegistryService
  ) {}
  
  async loadAllPlugins(): Promise<void> {
    // Получаем все включенные плагины из БД
    const plugins = await this.pluginRegistry.getEnabledPlugins();
    
    for (const pluginMeta of plugins) {
      await this.loadPlugin(pluginMeta);
    }
  }
  
  async loadPlugin(pluginMeta: PluginMetadata): Promise<void> {
    try {
      // Динамически загружаем плагин
      const PluginClass = await import(pluginMeta.entryPoint);
      const plugin = new PluginClass.default();
      
      // Если это event plugin, регистрируем обработчики
      if (plugin.registerEventHandlers) {
        plugin.registerEventHandlers();
      }
      
      // Вызываем lifecycle hook
      if (plugin.onEnable) {
        await plugin.onEnable();
      }
      
      console.log(`Plugin ${pluginMeta.slug} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load plugin ${pluginMeta.slug}:`, error);
    }
  }
}
```

---

## 🚀 Как использовать в существующем коде

### Генерируем события в контроллерах:

```typescript
// backend/src/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private eventBus: EventBusService // Добавляем
  ) {}
  
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // Существующая логика
    const user = await this.authService.login(dto);
    
    // НОВОЕ: Генерируем событие
    await this.eventBus.emit(UserEvents.USER_LOGIN, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      ip: req.ip,
      isFirstLogin: user.loginCount === 1
    });
    
    return user;
  }
}
```

### Backend плагины автоматически получают события:

```typescript
// plugins/email-notifications/index.ts
this.on(UserEvents.USER_LOGIN, async (event) => {
  // Автоматически вызывается при логине
  await sendEmail(event.data.user.email, 'login-notification');
});
```

---

## 📊 API для UI плагинов (опционально, Фаза 2)

Если UI плагин хочет получать события:

```typescript
// backend/src/plugins/plugins.controller.ts
@Controller('plugins/:slug')
export class PluginsController {
  /**
   * Получить события для конкретного плагина
   * UI плагин может делать polling этого endpoint
   */
  @Get('events')
  async getEvents(
    @Param('slug') slug: string,
    @Query('since') since?: Date,
    @Query('limit') limit = 100
  ) {
    return this.eventLog.getEventsForPlugin(slug, since, limit);
  }
}

// UI плагин (внутри iframe) делает polling:
setInterval(async () => {
  const events = await fetch(
    `/api/plugins/analytics-dashboard/events?since=${lastCheck}`
  ).then(r => r.json());
  
  events.forEach(handleEvent);
  lastCheck = new Date();
}, 5000);
```

---

## ✅ Преимущества этого подхода

1. **Фронтенд не трогаем** - 100% обратная совместимость
2. **Event System работает полноценно** - на бэкенде
3. **Backend плагины** - email, webhooks, sync, analytics
4. **Hybrid плагины** - UI в меню + backend логика
5. **Существующие UI плагины** - работают как раньше
6. **Быстрое внедрение** - 1-2 месяца

---

## 📅 План разработки (1-2 месяца)

### Неделя 1-2: Event Bus
- [ ] Создать EventBusService
- [ ] Определить стандартные события (30-40 базовых)
- [ ] Написать тесты

### Неделя 3-4: Plugin Registry
- [ ] Расширить таблицу plugins
- [ ] Добавить типы backend-event и hybrid
- [ ] Реализовать PluginLoaderService

### Неделя 5-6: Интеграция с существующим кодом
- [ ] Добавить генерацию событий в контроллеры
- [ ] Добавить события в сервисы
- [ ] Тестирование

### Неделя 7-8: Первые плагины + документация
- [ ] Создать Email Notification Plugin
- [ ] Создать Webhook Plugin
- [ ] Написать документацию для разработчиков
- [ ] Примеры плагинов

---

## 🎯 Результат

После внедрения:
- ✅ Event-driven архитектура работает на бэкенде
- ✅ Можно создавать backend плагины (email, webhooks и т.д.)
- ✅ Можно создавать hybrid плагины (UI + backend)
- ✅ Фронтенд **не изменился ни на строчку кода**
- ✅ Существующие плагины работают как раньше
- ✅ 80% функциональности Joomla без изменений фронта

---

**Дата создания:** 29 ноября 2024  
**Версия:** 1.0  
**Статус:** Ready for implementation

