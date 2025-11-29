# Loginus Plugin System - Roadmap

## Видение
Создать гибридную систему плагинов, объединяющую:
- **UI-ориентированный подход Loginus** (визуальные элементы меню, встраивание приложений)
- **Event-driven архитектуру Joomla** (обработчики событий, серверная логика)

## Ключевые принципы

1. **Обратная совместимость** - существующие плагины продолжают работать
2. **Постепенное внедрение** - фазовый подход, каждая фаза приносит ценность
3. **Developer Experience** - простота разработки плагинов
4. **Security First** - безопасность и изоляция плагинов
5. **TypeScript-first** - строгая типизация на всех уровнях

---

## ФАЗА 1: Event System Foundation (4-6 недель)

### 1.1 Базовая инфраструктура событий

**Задачи:**
- [ ] Создать EventBus для глобальных событий
- [ ] Определить стандартный набор событий (20-30 базовых)
- [ ] Реализовать систему подписки/отписки от событий
- [ ] Добавить приоритеты выполнения обработчиков
- [ ] Создать middleware для обработки событий

**Файлы для создания:**
```
backend/src/core/events/
├── event-bus.service.ts
├── event-emitter.interface.ts
├── event-handler.interface.ts
├── event-priority.enum.ts
└── events/
    ├── user.events.ts
    ├── auth.events.ts
    ├── content.events.ts
    └── system.events.ts
```

**Примеры событий:**
```typescript
// user.events.ts
export enum UserEvents {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
}

// auth.events.ts
export enum AuthEvents {
  BEFORE_LOGIN = 'auth.before_login',
  AFTER_LOGIN = 'auth.after_login',
  LOGIN_FAILED = 'auth.login_failed',
  TOKEN_REFRESH = 'auth.token_refresh',
}
```

**Архитектура:**
```typescript
// EventBus Service
@Injectable()
export class EventBusService {
  private handlers = new Map<string, EventHandler[]>();
  
  on(event: string, handler: EventHandler, priority = 0): void;
  emit(event: string, payload: any): Promise<void>;
  off(event: string, handler: EventHandler): void;
}

// EventHandler Interface
interface EventHandler {
  handle(event: EventPayload): Promise<void | boolean>;
  priority?: number;
}

// EventPayload
interface EventPayload {
  name: string;
  data: any;
  timestamp: Date;
  source: string;
}
```

---

## ФАЗА 2: Plugin Registry & Lifecycle (4-6 недель)

### 2.1 Plugin Registry

**Задачи:**
- [ ] Создать таблицу БД для метаданных плагинов
- [ ] Реализовать Plugin Registry Service
- [ ] Добавить версионирование плагинов
- [ ] Создать систему активации/деактивации
- [ ] Реализовать проверку зависимостей

**База данных:**
```sql
CREATE TABLE plugin_registry (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author VARCHAR(255),
  author_url VARCHAR(500),
  type VARCHAR(50) NOT NULL, -- 'ui', 'event', 'hybrid'
  category VARCHAR(50), -- 'authentication', 'content', 'system', etc.
  entry_point VARCHAR(500), -- URL или путь к коду
  manifest JSONB, -- Полный манифест плагина
  dependencies JSONB, -- Зависимости от других плагинов
  permissions JSONB, -- Требуемые разрешения
  config JSONB, -- Конфигурация плагина
  enabled BOOLEAN DEFAULT false,
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plugin_slug ON plugin_registry(slug);
CREATE INDEX idx_plugin_enabled ON plugin_registry(enabled);
CREATE INDEX idx_plugin_type ON plugin_registry(type);
```

### 2.2 Plugin Manifest

**Формат манифеста (JSON/YAML):**
```typescript
interface PluginManifest {
  // Базовая информация
  slug: string;
  name: string;
  description: string;
  version: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  
  // Тип и категория
  type: 'ui' | 'event' | 'hybrid';
  category?: string;
  
  // Точка входа
  entryPoint: {
    backend?: string; // URL для серверной части
    frontend?: string; // URL для UI части
  };
  
  // Зависимости
  dependencies?: {
    plugins?: string[]; // Slugs других плагинов
    minSystemVersion?: string;
  };
  
  // События
  events?: {
    subscribes: string[]; // События, на которые подписывается
    emits?: string[]; // События, которые генерирует
  };
  
  // Разрешения
  permissions?: string[];
  
  // UI конфигурация (для UI/hybrid плагинов)
  ui?: {
    menuItems?: MenuItemConfig[];
    icon?: string;
    routes?: RouteConfig[];
  };
  
  // Конфигурация
  config?: {
    fields: ConfigField[];
    defaults?: Record<string, any>;
  };
}
```

**Пример манифеста:**
```json
{
  "slug": "analytics-dashboard",
  "name": "Analytics Dashboard",
  "description": "Comprehensive analytics and reporting dashboard",
  "version": "1.0.0",
  "author": {
    "name": "Loginus Team",
    "email": "dev@loginus.ru"
  },
  "type": "hybrid",
  "category": "reporting",
  "entryPoint": {
    "backend": "https://analytics.example.com/api",
    "frontend": "https://analytics.example.com/app"
  },
  "dependencies": {
    "plugins": ["data-export"],
    "minSystemVersion": "2.0.0"
  },
  "events": {
    "subscribes": [
      "user.login",
      "data.created",
      "data.updated"
    ],
    "emits": [
      "analytics.report_generated",
      "analytics.export_completed"
    ]
  },
  "permissions": [
    "analytics.read",
    "analytics.write",
    "analytics.export"
  ],
  "ui": {
    "menuItems": [
      {
        "id": "analytics",
        "path": "/analytics",
        "label": "Аналитика",
        "icon": "chart-bar",
        "children": [
          {
            "id": "analytics-dashboard",
            "path": "/analytics/dashboard",
            "label": "Дашборд"
          },
          {
            "id": "analytics-reports",
            "path": "/analytics/reports",
            "label": "Отчеты"
          }
        ]
      }
    ]
  },
  "config": {
    "fields": [
      {
        "name": "update_interval",
        "type": "number",
        "label": "Интервал обновления (сек)",
        "default": 60
      },
      {
        "name": "enable_notifications",
        "type": "boolean",
        "label": "Включить уведомления",
        "default": true
      }
    ]
  }
}
```

---

## ФАЗА 3: Plugin SDK & Developer Tools (3-4 недели)

### 3.1 SDK для разработчиков

**Задачи:**
- [ ] Создать @loginus/plugin-sdk пакет
- [ ] Реализовать базовые классы для плагинов
- [ ] Добавить утилиты для работы с событиями
- [ ] Создать CLI для генерации шаблонов плагинов
- [ ] Написать документацию для разработчиков

**Структура SDK:**
```
packages/plugin-sdk/
├── src/
│   ├── core/
│   │   ├── Plugin.ts
│   │   ├── EventPlugin.ts
│   │   ├── UIPlugin.ts
│   │   └── HybridPlugin.ts
│   ├── events/
│   │   ├── EventEmitter.ts
│   │   └── EventHandler.ts
│   ├── api/
│   │   ├── PluginAPI.ts
│   │   └── HttpClient.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── storage.ts
│   │   └── crypto.ts
│   └── types/
│       ├── manifest.ts
│       ├── events.ts
│       └── config.ts
└── cli/
    └── plugin-generator.ts
```

**Пример базового класса:**
```typescript
// Plugin.ts
export abstract class Plugin {
  protected manifest: PluginManifest;
  protected config: Record<string, any>;
  protected api: PluginAPI;
  
  constructor(manifest: PluginManifest, config: Record<string, any>) {
    this.manifest = manifest;
    this.config = config;
    this.api = new PluginAPI(manifest.slug);
  }
  
  abstract async onInstall(): Promise<void>;
  abstract async onEnable(): Promise<void>;
  abstract async onDisable(): Promise<void>;
  abstract async onUninstall(): Promise<void>;
  abstract async onConfigUpdate(config: Record<string, any>): Promise<void>;
}

// EventPlugin.ts
export abstract class EventPlugin extends Plugin {
  protected eventBus: EventEmitter;
  
  constructor(manifest: PluginManifest, config: Record<string, any>) {
    super(manifest, config);
    this.eventBus = new EventEmitter();
  }
  
  protected on(event: string, handler: EventHandler): void {
    this.api.subscribeToEvent(event, handler);
  }
  
  protected emit(event: string, data: any): void {
    this.api.emitEvent(event, data);
  }
  
  abstract registerEventHandlers(): void;
}
```

### 3.2 CLI Generator

```bash
# Создание нового плагина
npx @loginus/plugin-sdk create my-plugin

# Выбор типа плагина
? Select plugin type: (Use arrow keys)
  ❯ Event Plugin (Backend logic only)
    UI Plugin (Frontend only)
    Hybrid Plugin (Backend + Frontend)

# Генерация структуры
✓ Creating plugin structure...
✓ Generating manifest.json...
✓ Creating entry point...
✓ Installing dependencies...

✓ Plugin created successfully!

Next steps:
  cd my-plugin
  npm install
  npm run dev
```

**Генерируемая структура:**
```
my-plugin/
├── manifest.json
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── events/
│   │   └── handlers.ts
│   └── config.ts
├── frontend/ (для hybrid/ui плагинов)
│   ├── src/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

---

## ФАЗА 4: Plugin Sandbox & Security (3-4 недели)

### 4.1 Изоляция плагинов

**Задачи:**
- [ ] Реализовать sandbox для выполнения кода плагинов
- [ ] Создать систему разрешений
- [ ] Добавить rate limiting для API вызовов
- [ ] Реализовать валидацию входных данных
- [ ] Создать систему аудита действий плагинов

**Безопасность:**
```typescript
// Plugin Sandbox
class PluginSandbox {
  private vm: VM; // Изолированная VM для плагина
  private permissions: Set<string>;
  private rateLimiter: RateLimiter;
  
  async execute(code: string, context: any): Promise<any> {
    // Проверка разрешений
    this.checkPermissions(context.action);
    
    // Rate limiting
    await this.rateLimiter.check();
    
    // Выполнение в изолированной среде
    return this.vm.run(code, this.sanitizeContext(context));
  }
}

// Permission System
enum PluginPermission {
  READ_USER_DATA = 'user.read',
  WRITE_USER_DATA = 'user.write',
  SEND_EMAIL = 'email.send',
  ACCESS_DATABASE = 'database.access',
  MAKE_HTTP_REQUEST = 'http.request',
}
```

---

## ФАЗА 5: Plugin Store & Marketplace (4-6 недель)

### 5.1 Plugin Repository

**Задачи:**
- [ ] Создать UI для маркетплейса плагинов
- [ ] Реализовать систему поиска и фильтрации
- [ ] Добавить рейтинги и отзывы
- [ ] Создать систему установки плагинов (один клик)
- [ ] Реализовать автоматические обновления
- [ ] Добавить систему проверки безопасности

**База данных:**
```sql
CREATE TABLE plugin_store (
  id UUID PRIMARY KEY,
  plugin_id UUID REFERENCES plugin_registry(id),
  category VARCHAR(50),
  price DECIMAL(10, 2) DEFAULT 0.00,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1),
  reviews_count INTEGER DEFAULT 0,
  screenshots JSONB,
  changelog JSONB,
  published_at TIMESTAMP,
  featured BOOLEAN DEFAULT false
);

CREATE TABLE plugin_reviews (
  id UUID PRIMARY KEY,
  plugin_id UUID REFERENCES plugin_store(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 UI Маркетплейса

**Страницы:**
- Каталог плагинов с фильтрами
- Детальная страница плагина
- Мои установленные плагины
- Обновления плагинов

---

## ФАЗА 6: Advanced Features (4-6 недель)

### 6.1 Webhooks & External Events

**Задачи:**
- [ ] Реализовать систему webhooks
- [ ] Добавить поддержку внешних событий
- [ ] Создать UI для настройки webhooks
- [ ] Реализовать retry механизм

```typescript
// Webhook Configuration
interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
}
```

### 6.2 Plugin Analytics

**Задачи:**
- [ ] Сбор метрик использования плагинов
- [ ] Дашборд для разработчиков
- [ ] Отслеживание ошибок
- [ ] Performance monitoring

---

## ФАЗА 7: Migration & Compatibility (2-3 недели)

### 7.1 Миграция существующих плагинов

**Задачи:**
- [ ] Создать инструмент для автоматической миграции
- [ ] Обновить существующие плагины до новой архитектуры
- [ ] Тестирование обратной совместимости
- [ ] Документация по миграции

**Миграция:**
```typescript
// Old format (current)
interface OldPlugin {
  id: string;
  type: 'iframe' | 'embedded' | 'external';
  iframeUrl?: string;
  embeddedAppUrl?: string;
}

// Migration tool
class PluginMigrator {
  async migrate(oldPlugin: OldPlugin): Promise<PluginManifest> {
    return {
      slug: oldPlugin.id,
      type: 'ui',
      entryPoint: {
        frontend: oldPlugin.iframeUrl || oldPlugin.embeddedAppUrl
      },
      ui: {
        menuItems: [{
          id: oldPlugin.id,
          path: `/plugins/${oldPlugin.id}`,
          type: oldPlugin.type
        }]
      }
    };
  }
}
```

---

## Технологический стек

### Backend
- **Event System:** RxJS / EventEmitter3
- **Sandbox:** vm2 / isolated-vm
- **Validation:** joi / class-validator
- **Rate Limiting:** rate-limiter-flexible

### Frontend
- **Micro-frontends:** Module Federation / single-spa
- **State Management:** Zustand (current)
- **Plugin UI:** iframe / Web Components

### Storage
- **Metadata:** PostgreSQL
- **Files:** S3 / MinIO
- **Cache:** Redis

---

## Метрики успеха

### Для разработчиков
- Время создания плагина: < 30 минут
- Простота API: < 100 строк кода для базового плагина
- Документация: > 90% покрытие

### Для пользователей
- Установка плагина: < 1 минуты
- Производительность: < 5% overhead
- Стабильность: 99.9% uptime

### Для бизнеса
- Количество плагинов: 50+ в первый год
- Активные разработчики: 20+ в первый год
- Адаптация: 30% пользователей устанавливают плагины

---

## Риски и митигация

### Риск 1: Производительность
**Митигация:** 
- Lazy loading плагинов
- Кэширование
- Performance budget

### Риск 2: Безопасность
**Митигация:**
- Code review всех плагинов
- Автоматическое сканирование уязвимостей
- Sandbox изоляция

### Риск 3: Сложность для разработчиков
**Митигация:**
- Подробная документация
- Примеры и шаблоны
- SDK с TypeScript типами

---

## Timeline

**Общая длительность: 6-8 месяцев**

| Фаза | Длительность | Приоритет |
|------|-------------|-----------|
| 0. Анализ | 1-2 недели | Критический |
| 1. Event System | 4-6 недель | Критический |
| 2. Registry & Lifecycle | 4-6 недель | Критический |
| 3. SDK & Tools | 3-4 недели | Высокий |
| 4. Sandbox & Security | 3-4 недели | Критический |
| 5. Plugin Store | 4-6 недель | Средний |
| 6. Advanced Features | 4-6 недель | Низкий |
| 7. Migration | 2-3 недели | Средний |

---

## Ресурсы

### Команда
- 2 Backend разработчика (Event System, Registry, Security)
- 2 Frontend разработчика (UI, SDK, Marketplace)
- 1 DevOps (Инфраструктура, CI/CD)
- 1 Tech Writer (Документация)

### Бюджет (примерный)
- Разработка: 6-8 месяцев × команда
- Инфраструктура: $500-1000/месяц
- Сторонние сервисы: $200-500/месяц

---

## Следующие шаги

1. **Утвердить roadmap с командой**
2. **Создать техническое задание для Фазы 1**
3. **Прототипировать Event System (1-2 недели)**
4. **Провести технический spike для выбора технологий**
5. **Начать разработку Фазы 1**

---

Дата создания: 29 ноября 2024
Автор: AI Assistant
Версия: 1.0

