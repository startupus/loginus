# Loginus Plugin Development - Best Practices & FAQ

> Лучшие практики и часто задаваемые вопросы по разработке плагинов

## Содержание

1. [Best Practices](#best-practices)
2. [Безопасность](#безопасность)
3. [Производительность](#производительность)
4. [Тестирование](#тестирование)
5. [FAQ](#faq)
6. [Распространённые ошибки](#распространённые-ошибки)

---

## Best Practices

### 1. Структура кода

#### ✅ ПРАВИЛЬНО

```typescript
export default class MyPlugin extends BasePlugin {
  private db: Database;
  private cache: Cache;

  async onEnable(): Promise<void> {
    await super.onEnable();
    this.db = await this.initDatabase();
    this.cache = new Cache();
    this.log('Plugin initialized successfully');
  }

  async onDisable(): Promise<void> {
    await this.cache.clear();
    await this.db.close();
    await super.onDisable();
  }

  @OnEvent('user.after_create', 50)
  async handleUserCreate(payload: any): Promise<void> {
    try {
      await this.processUser(payload);
    } catch (error: any) {
      this.error('Failed to process user', error.stack);
      // НЕ пробрасываем ошибку дальше
    }
  }
}
```

#### ❌ НЕПРАВИЛЬНО

```typescript
export default class BadPlugin extends BasePlugin {
  // Нет cleanup в onDisable
  async onDisable(): Promise<void> {
    // Ресурсы не освобождены!
  }

  // Синхронный обработчик для async операций
  @OnEvent('user.create')
  handleUserCreate(payload: any): void {
    this.sendEmail(payload.email); // await забыт!
  }

  // Пробрасывание ошибок
  @OnEvent('user.update')
  async handleUpdate(payload: any): Promise<void> {
    await this.heavyOperation(); // Может сломать другие плагины
  }
}
```

---

### 2. Обработка ошибок

#### Graceful error handling

```typescript
@OnEvent('payment.process', 50)
async handlePayment(payload: any): Promise<void> {
  try {
    const result = await this.processPayment(payload);
    
    if (!result.success) {
      this.warn(`Payment processing failed: ${result.error}`);
      return;
    }

    await this.emit('my-plugin.payment-processed', {
      paymentId: payload.id,
      status: 'success'
    });

  } catch (error: any) {
    this.error('Payment processing error', error.stack);
    
    // Отправляем событие об ошибке
    await this.emit('my-plugin.payment-error', {
      paymentId: payload.id,
      error: error.message
    });

    // НЕ пробрасываем ошибку дальше
  }
}
```

#### Retry logic для сетевых операций

```typescript
private async fetchWithRetry(
  url: string,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      
      this.warn(`Fetch attempt ${i + 1} failed: ${response.status}`);
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      this.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

### 3. Асинхронные операции

#### Используйте Promise.all для параллельных операций

```typescript
@OnEvent('user.batch_create', 100)
async handleBatchCreate(payload: { users: any[] }): Promise<void> {
  // ✅ Параллельная обработка
  await Promise.all(
    payload.users.map(user => this.processUser(user))
  );
}
```

#### Избегайте блокировки события

```typescript
// ❌ НЕПРАВИЛЬНО: блокирует событие
@OnEvent('user.login')
async handleLogin(payload: any): Promise<void> {
  await this.sendMultipleEmails(payload.userId); // 10 секунд!
  await this.updateAnalytics(payload.userId);     // 5 секунд!
}

// ✅ ПРАВИЛЬНО: быстрая обработка + фоновые задачи
@OnEvent('user.login')
async handleLogin(payload: any): Promise<void> {
  this.log(`User ${payload.userId} logged in`);
  
  // Тяжёлые операции в фоне
  setImmediate(async () => {
    await this.sendMultipleEmails(payload.userId);
    await this.updateAnalytics(payload.userId);
  });
}
```

---

### 4. Управление ресурсами

#### Правильная инициализация и очистка

```typescript
export default class ResourcePlugin extends BasePlugin {
  private connection: Connection;
  private scheduler: NodeJS.Timer;

  async onEnable(): Promise<void> {
    await super.onEnable();
    
    // Инициализация ресурсов
    this.connection = await this.createConnection();
    this.scheduler = setInterval(() => this.syncData(), 60000);
    
    this.log('Resources initialized');
  }

  async onDisable(): Promise<void> {
    // Очистка в обратном порядке
    if (this.scheduler) {
      clearInterval(this.scheduler);
    }
    
    if (this.connection) {
      await this.connection.close();
    }
    
    await super.onDisable();
    this.log('Resources cleaned up');
  }
}
```

#### Кеширование

```typescript
export default class CachingPlugin extends BasePlugin {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 минут

  private async getCachedData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const data = await this.fetchData(key);
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async onDisable(): Promise<void> {
    this.cache.clear();
    await super.onDisable();
  }
}
```

---

### 5. Конфигурация

#### Валидация конфигурации

```typescript
interface PluginConfig {
  apiKey: string;
  apiUrl: string;
  timeout: number;
  retries: number;
}

export default class ConfigurablePlugin extends BasePlugin {
  private config: PluginConfig;

  async onEnable(): Promise<void> {
    await super.onEnable();
    
    const rawConfig = await this.loadConfig();
    this.config = this.validateConfig(rawConfig);
    
    this.log('Configuration loaded and validated');
  }

  private validateConfig(config: any): PluginConfig {
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }

    if (!config.apiUrl || !this.isValidUrl(config.apiUrl)) {
      throw new Error('Invalid apiUrl');
    }

    return {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl,
      timeout: config.timeout || 5000,
      retries: config.retries || 3,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
```

#### Переменные окружения

```typescript
private loadConfig(): PluginConfig {
  return {
    apiKey: process.env.MY_PLUGIN_API_KEY || '',
    apiUrl: process.env.MY_PLUGIN_API_URL || 'https://api.example.com',
    timeout: parseInt(process.env.MY_PLUGIN_TIMEOUT || '5000'),
    retries: parseInt(process.env.MY_PLUGIN_RETRIES || '3'),
  };
}
```

---

### 6. Логирование

#### Правильные уровни логирования

```typescript
// INFO - обычные операции
this.log('User notification sent');

// WARNING - нештатные ситуации, но не критичные
this.warn('API rate limit approaching: 90/100');

// ERROR - ошибки, требующие внимания
this.error('Failed to connect to external service', error.stack);
```

#### Структурированное логирование

```typescript
@OnEvent('payment.process')
async handlePayment(payload: any): Promise<void> {
  const startTime = Date.now();
  
  this.log(`Processing payment ${payload.id}`);
  
  try {
    await this.processPayment(payload);
    
    const duration = Date.now() - startTime;
    this.log(`Payment ${payload.id} processed in ${duration}ms`);
    
  } catch (error: any) {
    this.error(
      `Payment ${payload.id} failed after ${Date.now() - startTime}ms`,
      error.stack
    );
  }
}
```

---

## Безопасность

### 1. Валидация входных данных

```typescript
@OnEvent('user.update')
async handleUserUpdate(payload: any): Promise<void> {
  // Валидация payload
  if (!payload.userId || typeof payload.userId !== 'string') {
    this.warn('Invalid userId in payload');
    return;
  }

  if (payload.email && !this.isValidEmail(payload.email)) {
    this.warn(`Invalid email format: ${payload.email}`);
    return;
  }

  // Безопасная обработка
  await this.updateUser(payload);
}

private isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 2. Защита API ключей

```typescript
// ❌ НЕПРАВИЛЬНО
const API_KEY = 'hardcoded-api-key-12345';

// ✅ ПРАВИЛЬНО
const API_KEY = process.env.MY_PLUGIN_API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

### 3. Безопасность SQL запросов

```typescript
// ❌ НЕПРАВИЛЬНО: SQL injection
async findUser(userId: string): Promise<User> {
  const query = `SELECT * FROM users WHERE id = '${userId}'`;
  return await this.db.query(query);
}

// ✅ ПРАВИЛЬНО: параметризованные запросы
async findUser(userId: string): Promise<User> {
  const query = 'SELECT * FROM users WHERE id = $1';
  return await this.db.query(query, [userId]);
}
```

### 4. Rate Limiting

```typescript
export default class RateLimitedPlugin extends BasePlugin {
  private requestCounts = new Map<string, number>();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;

  @OnEvent('api.request')
  async handleApiRequest(payload: any): Promise<void> {
    const userId = payload.userId;
    const count = this.requestCounts.get(userId) || 0;

    if (count >= this.MAX_REQUESTS_PER_MINUTE) {
      this.warn(`Rate limit exceeded for user ${userId}`);
      return;
    }

    this.requestCounts.set(userId, count + 1);
    
    // Сброс счётчика через минуту
    setTimeout(() => {
      this.requestCounts.delete(userId);
    }, 60000);

    await this.processRequest(payload);
  }
}
```

---

## Производительность

### 1. Debouncing

```typescript
export default class DebouncedPlugin extends BasePlugin {
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  @OnEvent('user.typing')
  async handleTyping(payload: any): Promise<void> {
    const userId = payload.userId;
    const timer = this.debounceTimers.get(userId);

    if (timer) {
      clearTimeout(timer);
    }

    this.debounceTimers.set(
      userId,
      setTimeout(async () => {
        await this.saveTypingStatus(userId);
        this.debounceTimers.delete(userId);
      }, 1000)
    );
  }
}
```

### 2. Batch Processing

```typescript
export default class BatchPlugin extends BasePlugin {
  private queue: any[] = [];
  private batchTimer?: NodeJS.Timeout;

  @OnEvent('data.create', 100)
  async handleDataCreate(payload: any): Promise<void> {
    this.queue.push(payload);

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.processBatch(), 5000);
    }

    // Если накопилось 100 элементов, обрабатываем сразу
    if (this.queue.length >= 100) {
      clearTimeout(this.batchTimer);
      await this.processBatch();
    }
  }

  private async processBatch(): Promise<void> {
    const batch = [...this.queue];
    this.queue = [];
    this.batchTimer = undefined;

    this.log(`Processing batch of ${batch.length} items`);
    await this.saveBatch(batch);
  }
}
```

### 3. Lazy Loading

```typescript
export default class LazyPlugin extends BasePlugin {
  private heavyResource?: HeavyResource;

  @OnEvent('feature.use')
  async handleFeatureUse(payload: any): Promise<void> {
    // Загружаем тяжёлый ресурс только когда он нужен
    if (!this.heavyResource) {
      this.log('Loading heavy resource...');
      this.heavyResource = await this.loadHeavyResource();
    }

    await this.heavyResource.process(payload);
  }
}
```

---

## Тестирование

### 1. Unit Tests

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import MyPlugin from './plugin';
import { EventBusService } from '@loginus/core';

describe('MyPlugin', () => {
  let plugin: MyPlugin;
  let mockEventBus: jest.Mocked<EventBusService>;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    } as any;

    plugin = new MyPlugin('test-plugin-id');
    plugin.setDependencies(mockEventBus);
  });

  describe('onEnable', () => {
    it('should initialize successfully', async () => {
      await expect(plugin.onEnable()).resolves.not.toThrow();
    });
  });

  describe('handleUserCreate', () => {
    it('should process user creation event', async () => {
      const payload = {
        userId: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      await plugin.handleUserCreate(payload, {} as any);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'my-plugin.user-processed',
        expect.objectContaining({ userId: '123' })
      );
    });

    it('should handle errors gracefully', async () => {
      const payload = { userId: null }; // Invalid

      await expect(
        plugin.handleUserCreate(payload, {} as any)
      ).resolves.not.toThrow();
    });
  });
});
```

### 2. Integration Tests

```typescript
describe('MyPlugin Integration', () => {
  let app: NestApplication;
  let eventBus: EventBusService;
  let plugin: MyPlugin;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    eventBus = app.get(EventBusService);
    plugin = await loadPlugin('my-plugin');
  });

  it('should respond to system events', async () => {
    const spy = jest.spyOn(plugin, 'handleUserCreate');

    await eventBus.emit('user.after_create', {
      userId: '123',
      email: 'test@example.com'
    });

    expect(spy).toHaveBeenCalled();
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## FAQ

### Q: Как хранить данные плагина?

**A:** Есть несколько вариантов:

1. **Использовать config плагина** (для настроек):
   ```typescript
   const config = await this.getPluginConfig();
   ```

2. **Создать собственную таблицу** (для данных):
   ```typescript
   // В миграции
   CREATE TABLE my_plugin_data (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     data JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Использовать JSONB в таблице extensions**:
   ```typescript
   // Данные хранятся в поле config
   ```

---

### Q: Можно ли плагину обращаться к другим плагинам?

**A:** Напрямую нет, но можно через события:

```typescript
// Плагин A генерирует событие
await this.emit('plugin-a.data-ready', { data: '...' });

// Плагин B подписывается
@OnEvent('plugin-a.data-ready')
async handleDataFromPluginA(payload: any) {
  // Обработка
}
```

---

### Q: Как обновить плагин?

**A:** 
1. Увеличьте версию в `manifest.json`
2. Упакуйте новый .zip
3. Загрузите через админку
4. Система автоматически перезагрузит плагин

---

### Q: Как отлаживать плагин?

**A:**

1. **Логи в консоли**:
   ```bash
   docker logs -f loginus-backend-new | grep "MyPlugin"
   ```

2. **Event logs в БД**:
   ```sql
   SELECT * FROM event_logs 
   WHERE "pluginId" = 'your-plugin-id' 
   ORDER BY "createdAt" DESC;
   ```

3. **Debugger**:
   - Добавьте `debugger;` в код
   - Запустите backend в dev режиме
   - Подключите Chrome DevTools

---

### Q: Как сделать плагин многоязычным?

**A:**

```typescript
private getLocalizedMessage(lang: string, key: string): string {
  const messages = {
    en: {
      welcome: 'Welcome!',
      goodbye: 'Goodbye!'
    },
    ru: {
      welcome: 'Добро пожаловать!',
      goodbye: 'До свидания!'
    }
  };

  return messages[lang]?.[key] || messages.en[key];
}
```

---

### Q: Как работать с файлами?

**A:**

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';

export default class FilePlugin extends BasePlugin {
  private dataDir: string;

  async onEnable(): Promise<void> {
    await super.onEnable();
    
    // Путь к директории плагина
    this.dataDir = path.join(process.cwd(), 'plugins', this.pluginId, 'data');
    
    // Создаём директорию если не существует
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async saveFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async readFile(filename: string): Promise<string> {
    const filePath = path.join(this.dataDir, filename);
    return await fs.readFile(filePath, 'utf-8');
  }
}
```

---

### Q: Как создать webhook endpoint?

**A:** Используйте NestJS контроллер:

```typescript
// В plugin.ts регистрируем роуты
async onEnable(): Promise<void> {
  await super.onEnable();
  
  // Регистрируем webhook endpoint
  await this.registerRoute({
    method: 'POST',
    path: '/webhook/my-plugin',
    handler: this.handleWebhook.bind(this)
  });
}

async handleWebhook(req: Request, res: Response): Promise<void> {
  const payload = req.body;
  
  // Валидация подписи
  if (!this.validateSignature(req)) {
    res.status(401).send('Invalid signature');
    return;
  }

  // Обработка webhook
  await this.processWebhook(payload);
  res.status(200).send('OK');
}
```

---

## Распространённые ошибки

### 1. Забыли await

```typescript
// ❌ НЕПРАВИЛЬНО
@OnEvent('user.create')
async handleCreate(payload: any) {
  this.sendEmail(payload.email); // Забыли await!
}

// ✅ ПРАВИЛЬНО
@OnEvent('user.create')
async handleCreate(payload: any) {
  await this.sendEmail(payload.email);
}
```

### 2. Не очищают ресурсы

```typescript
// ❌ НЕПРАВИЛЬНО
async onDisable(): Promise<void> {
  // Ничего не делаем
}

// ✅ ПРАВИЛЬНО
async onDisable(): Promise<void> {
  clearInterval(this.timer);
  await this.connection.close();
  this.cache.clear();
  await super.onDisable();
}
```

### 3. Блокируют события

```typescript
// ❌ НЕПРАВИЛЬНО: долгая операция
@OnEvent('user.login')
async handleLogin(payload: any) {
  await this.generateReport(); // 30 секунд!
}

// ✅ ПРАВИЛЬНО: быстро + фон
@OnEvent('user.login')
async handleLogin(payload: any) {
  setImmediate(() => this.generateReport());
}
```

### 4. Неправильный приоритет

```typescript
// ❌ НЕПРАВИЛЬНО: низкий приоритет для критической операции
@OnEvent('payment.process', 150)
async validatePayment(payload: any) {
  // Должно быть раньше других обработчиков!
}

// ✅ ПРАВИЛЬНО
@OnEvent('payment.process', 10) // Высокий приоритет
async validatePayment(payload: any) {
  // Валидация перед обработкой
}
```

---

## Чеклист перед релизом

- [ ] Все ошибки обрабатываются gracefully
- [ ] Ресурсы корректно освобождаются в `onDisable`
- [ ] Конфигурация валидируется
- [ ] Секреты не захардкожены в коде
- [ ] Добавлены unit-тесты
- [ ] Логирование на правильных уровнях
- [ ] README.md содержит инструкции по установке
- [ ] manifest.json заполнен корректно
- [ ] package.json содержит все зависимости
- [ ] Версия обновлена
- [ ] Плагин протестирован локально

---

## Полезные ссылки

- [Developer Guide](./PLUGIN_DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Example Plugins](./examples/)
- [Event System](../backend/src/core/events/README.md)

---

**Версия:** 1.0.0  
**Дата обновления:** 29 ноября 2025  
**© Loginus Platform**

