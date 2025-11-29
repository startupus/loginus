# Loginus Extension System - Полный Roadmap

## 🎯 Общая концепция

Создать систему расширений (плагинов и виджетов) с event-driven архитектурой, где:
- **Плагины** = бизнес-логика + UI (отображаются как пункты меню)
- **Виджеты** = iframe карточки в профиле (без бизнес-логики)
- **Event System** = хуки для кастомизации любой функциональности
- **Загрузка** = .zip файлы через админ-панель

---

## 📊 Структура системы

```
Админ-панель → Расширения
├── Менеджер расширений    (все плагины + виджеты)
├── Плагины               (загрузка, управление плагинами)
└── Виджеты               (загрузка, управление виджетами)

Админ-панель → Настройка меню
├── Добавить пункт        (выбор плагина, автопути)
├── Drag & Drop           (горизонтальный + вертикальный)
└── Вложенность           (1 уровень: родитель/ребенок)

Профиль пользователя
└── Виджеты               (iframe карточки, управление админом)
```

---

## 🗂️ Типы расширений

### Встроенные типы:
1. **Виджеты** - iframe карточки в профиле
2. **Пункты меню** - UI плагины с бизнес-логикой
3. **Оплата** - платежные системы
4. **Аутентификация** - способы входа
5. **Контент** - обработка контента
6. **Система** - системные расширения
7. **Пользователь** - работа с пользователями
8. **API** - внешние интеграции

### Типы UI для плагинов:
- **iframe** - внешний сайт в iframe
- **embedded** - встроенное SPA приложение
- **external** - внешняя ссылка (открывается в новой вкладке или текущей)

---

## 📅 ROADMAP (16-20 недель)

### **ФАЗА 1: Backend - Event System & Plugin Infrastructure (4-5 недель)**

#### Неделя 1-2: Event Bus & Core Events
**Цель:** Создать систему событий и базовую инфраструктуру плагинов

**Задачи:**
- [ ] Создать EventBusService с приоритетами выполнения
- [ ] Определить 50+ базовых событий системы
- [ ] Создать базовый класс Plugin для расширений
- [ ] Реализовать систему регистрации обработчиков событий
- [ ] Добавить логирование всех событий

**События (примеры):**
```typescript
// Пользователи
user.before_create
user.after_create
user.before_update
user.after_update
user.before_delete
user.after_delete
user.login
user.logout
user.password_changed

// Меню
menu.before_render
menu.after_render
menu.item.before_click
menu.item.after_click
menu.item.created
menu.item.updated
menu.item.deleted
menu.structure_changed

// Виджеты
widget.before_load
widget.after_load
widget.before_render
widget.after_render
widget.data_received
widget.error

// Данные
data.before_create
data.after_create
data.before_update
data.after_update
data.before_delete
data.after_delete
data.validated

// Система
system.startup
system.shutdown
system.config_changed
plugin.installed
plugin.enabled
plugin.disabled
plugin.uninstalled

// Контент
content.before_render
content.after_render
content.before_save
content.after_save

// Оплата
payment.before_process
payment.after_process
payment.success
payment.failed
payment.refund

// Аутентификация
auth.before_login
auth.after_login
auth.login_failed
auth.token_refresh
auth.session_expired
```

**Файлы:**
```
backend/src/core/events/
├── event-bus.service.ts
├── event-emitter.interface.ts
├── event-handler.interface.ts
├── event-logger.service.ts
└── events/
    ├── user.events.ts
    ├── menu.events.ts
    ├── widget.events.ts
    ├── data.events.ts
    ├── system.events.ts
    ├── content.events.ts
    ├── payment.events.ts
    └── auth.events.ts
```

#### Неделя 3: Plugin Registry & Loader
**Цель:** Система регистрации и загрузки плагинов

**Задачи:**
- [ ] Создать таблицы БД для плагинов и виджетов
- [ ] Реализовать PluginRegistryService
- [ ] Реализовать PluginLoaderService (загрузка из plugins/)
- [ ] Добавить версионирование плагинов
- [ ] Реализовать lifecycle hooks (onInstall, onEnable, onDisable)

**База данных:**
```sql
-- Расширения (плагины + виджеты)
CREATE TABLE extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author VARCHAR(255),
  author_email VARCHAR(255),
  author_url VARCHAR(500),
  
  -- Тип расширения
  extension_type VARCHAR(50) NOT NULL, -- 'widget', 'menu_item', 'payment', 'auth', etc.
  
  -- Тип UI (для плагинов с UI)
  ui_type VARCHAR(50), -- 'iframe', 'embedded', 'external', null
  
  -- Метаданные
  icon VARCHAR(100),
  path_on_disk VARCHAR(500), -- Путь к файлам плагина
  manifest JSONB, -- Полный manifest.json
  config JSONB, -- Конфигурация плагина
  
  -- События
  subscribed_events JSONB, -- События, на которые подписан
  
  -- Статус
  enabled BOOLEAN DEFAULT false,
  installed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_extensions_slug ON extensions(slug);
CREATE INDEX idx_extensions_enabled ON extensions(enabled);
CREATE INDEX idx_extensions_type ON extensions(extension_type);

-- Привязка плагинов к пунктам меню
CREATE TABLE menu_item_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id VARCHAR(255) NOT NULL,
  plugin_id UUID REFERENCES extensions(id),
  config JSONB, -- Конфигурация для конкретного пункта
  created_at TIMESTAMP DEFAULT NOW()
);

-- Виджеты в профиле пользователя
CREATE TABLE profile_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID REFERENCES extensions(id),
  position INTEGER, -- Порядок отображения
  width INTEGER DEFAULT 1, -- Ширина в grid units
  height INTEGER DEFAULT 1, -- Высота в grid units
  config JSONB, -- Настройки виджета
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Логи событий (для отладки)
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(255) NOT NULL,
  payload JSONB,
  plugin_id UUID REFERENCES extensions(id),
  status VARCHAR(50), -- 'success', 'error'
  error TEXT,
  execution_time INTEGER, -- Миллисекунды
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_logs_name ON event_logs(event_name);
CREATE INDEX idx_event_logs_plugin ON event_logs(plugin_id);
CREATE INDEX idx_event_logs_created ON event_logs(created_at);
```

#### Неделя 4-5: Plugin Upload & Installation
**Цель:** Загрузка .zip файлов и установка плагинов

**Задачи:**
- [ ] API endpoint для загрузки .zip
- [ ] Распаковка и валидация .zip файлов
- [ ] Парсинг manifest.json
- [ ] Установка npm зависимостей плагина
- [ ] Компиляция TypeScript плагина
- [ ] Безопасность (проверка файлов, размера, и т.д.)

**API Endpoints:**
```typescript
POST   /api/admin/extensions/upload        # Загрузка .zip
GET    /api/admin/extensions                # Список всех расширений
GET    /api/admin/extensions/:id           # Детали расширения
POST   /api/admin/extensions/:id/enable    # Включить
POST   /api/admin/extensions/:id/disable   # Выключить
DELETE /api/admin/extensions/:id           # Удалить
PUT    /api/admin/extensions/:id/config    # Обновить конфиг
```

---

### **ФАЗА 2: Frontend - Раздел "Расширения" (3-4 недели)**

#### Неделя 6-7: Менеджер расширений
**Цель:** Страница со списком всех расширений

**Задачи:**
- [ ] Создать страницу ExtensionsManagerPage
- [ ] Список расширений с карточками
- [ ] Фильтры по типу (Виджеты, Пункты меню, Оплата, и т.д.)
- [ ] Сортировка (по имени, дате, статусу)
- [ ] Поиск по имени/описанию
- [ ] Действия: Включить/Выключить/Удалить/Настроить

**UI структура:**
```tsx
// frontend/src/pages/admin/ExtensionsManagerPage.tsx
<PageTemplate title="Менеджер расширений">
  <div className="extensions-manager">
    {/* Фильтры и поиск */}
    <div className="filters">
      <Input
        placeholder="Поиск расширений..."
        icon="search"
      />
      <Select
        label="Тип"
        options={[
          { value: 'all', label: 'Все' },
          { value: 'widget', label: 'Виджеты' },
          { value: 'menu_item', label: 'Пункты меню' },
          { value: 'payment', label: 'Оплата' },
          // ...
        ]}
      />
      <Select
        label="Статус"
        options={[
          { value: 'all', label: 'Все' },
          { value: 'enabled', label: 'Включено' },
          { value: 'disabled', label: 'Выключено' },
        ]}
      />
    </div>
    
    {/* Список расширений */}
    <div className="extensions-grid">
      {extensions.map(ext => (
        <ExtensionCard
          extension={ext}
          onEnable={() => enable(ext.id)}
          onDisable={() => disable(ext.id)}
          onConfigure={() => configure(ext.id)}
          onDelete={() => deleteExt(ext.id)}
        />
      ))}
    </div>
  </div>
</PageTemplate>
```

#### Неделя 8: Страница "Плагины"
**Цель:** Загрузка плагинов через .zip

**Задачи:**
- [ ] Создать страницу PluginsPage
- [ ] Форма загрузки .zip файла (drag & drop)
- [ ] Поля: Название, Тип (выбор из списка)
- [ ] Прогресс загрузки
- [ ] Валидация на фронте (размер, формат)
- [ ] Список загруженных плагинов

**UI:**
```tsx
// frontend/src/pages/admin/PluginsPage.tsx
<PageTemplate title="Плагины">
  <Card>
    <h2>Загрузить плагин</h2>
    
    <Form onSubmit={handleUpload}>
      <Input
        label="Название плагина"
        required
        value={name}
        onChange={setName}
      />
      
      <Select
        label="Тип расширения"
        required
        options={[
          { value: 'menu_item', label: 'Пункт меню' },
          { value: 'payment', label: 'Оплата' },
          { value: 'auth', label: 'Аутентификация' },
          { value: 'content', label: 'Контент' },
          { value: 'system', label: 'Система' },
          { value: 'user', label: 'Пользователь' },
          { value: 'api', label: 'API' },
        ]}
      />
      
      <DropZone
        accept=".zip"
        maxSize={50 * 1024 * 1024} // 50MB
        onDrop={setFile}
      >
        {file ? (
          <FilePreview file={file} onRemove={() => setFile(null)} />
        ) : (
          <DropZonePlaceholder />
        )}
      </DropZone>
      
      <Button type="submit" loading={uploading}>
        Загрузить плагин
      </Button>
    </Form>
  </Card>
  
  {/* Список загруженных плагинов */}
  <Card className="mt-6">
    <h2>Загруженные плагины</h2>
    <DataTable
      data={plugins}
      columns={[
        { key: 'name', label: 'Название' },
        { key: 'version', label: 'Версия' },
        { key: 'extensionType', label: 'Тип' },
        { key: 'enabled', label: 'Статус' },
        { key: 'actions', label: 'Действия' },
      ]}
    />
  </Card>
</PageTemplate>
```

#### Неделя 9: Страница "Виджеты"
**Цель:** Загрузка виджетов через .zip

**Задачи:**
- [ ] Создать страницу WidgetsPage
- [ ] Форма загрузки .zip файла
- [ ] Поле: Название виджета
- [ ] Автоматическая установка типа "Виджет"
- [ ] Список загруженных виджетов
- [ ] Preview виджета

**UI:** (аналогично PluginsPage, но без выбора типа)

---

### **ФАЗА 3: Frontend - Настройка меню (3-4 недели)**

#### Неделя 10-11: Обновление MenuSettingsPage
**Цель:** Добавить выбор плагина и автопути

**Задачи:**
- [ ] Добавить поле "Плагин" (выбор из установленных)
- [ ] Изменить поле "URL" → показывать путь раздела
- [ ] Автовычисление "Путь" на основе названия и родителя
- [ ] Отображение типа UI плагина (iframe/embedded/external)
- [ ] Сохранение связи menu_item ↔ plugin

**Форма добавления пункта:**
```tsx
<Modal title="Добавить пункт меню">
  <Form>
    <Input
      label="Название"
      value={item.label}
      onChange={(e) => setItem({ ...item, label: e.target.value })}
    />
    
    {/* НОВОЕ: Выбор плагина */}
    <Select
      label="Плагин"
      options={availablePlugins.map(p => ({
        value: p.id,
        label: `${p.name} (${p.extensionType})`
      }))}
      value={item.pluginId}
      onChange={(pluginId) => {
        const plugin = availablePlugins.find(p => p.id === pluginId);
        setItem({
          ...item,
          pluginId,
          type: plugin.uiType, // iframe, embedded, external
          // URL автоматически заполняется
        });
      }}
    />
    
    {/* Показываем URL раздела (не редактируется) */}
    <Input
      label="URL раздела"
      value={generatePath(item.label, item.parent)}
      disabled
      hint="Автоматически вычисляется из названия"
    />
    
    {/* Автовычисленный путь */}
    <Input
      label="Путь"
      value={item.path}
      disabled
      hint="Автоматически: /родитель/дочерний"
    />
    
    <Select
      label="Иконка"
      options={iconOptions}
    />
    
    <Button type="submit">Сохранить</Button>
  </Form>
</Modal>
```

**Логика автопутей:**
```typescript
// Функция генерации пути
function generatePath(label: string, parentId?: string): string {
  // Транслитерация и замена пробелов на дефисы
  const slug = transliterate(label)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
  
  if (parentId) {
    const parent = menuItems.find(m => m.id === parentId);
    if (parent) {
      return `${parent.path}/${slug}`;
    }
  }
  
  return `/${slug}`;
}

// При изменении родителя - пересчитываем пути детей
function onParentChange(itemId: string, newParentId: string | null) {
  const item = menuItems.find(m => m.id === itemId);
  item.parent = newParentId;
  item.path = generatePath(item.label, newParentId);
  
  // Пересчитываем пути всех детей рекурсивно
  updateChildrenPaths(itemId);
}

function updateChildrenPaths(parentId: string) {
  const children = menuItems.filter(m => m.parent === parentId);
  
  for (const child of children) {
    child.path = generatePath(child.label, parentId);
    updateChildrenPaths(child.id); // Рекурсия
  }
}
```

#### Неделя 12: Вертикальный Drag & Drop
**Цель:** Перетаскивание пунктов друг в друга (вложенность)

**Задачи:**
- [ ] Обновить DndContext для вложенности
- [ ] Визуальная индикация при наведении (можно вложить)
- [ ] Ограничение глубины (1 уровень)
- [ ] Автопересчет путей при изменении структуры
- [ ] Анимация раскрытия/закрытия детей

**Реализация:**
```tsx
// Используем @dnd-kit с поддержкой вложенности
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const activeItem = items.find(i => i.id === active.id);
  const overItem = items.find(i => i.id === over.id);
  
  // Проверяем, можно ли вложить
  if (canBeNested(activeItem, overItem)) {
    // Делаем activeItem дочерним для overItem
    activeItem.parent = overItem.id;
    activeItem.path = generatePath(activeItem.label, overItem.id);
    
    // Пересчитываем пути детей
    updateChildrenPaths(activeItem.id);
  } else {
    // Обычное перемещение (горизонтальное)
    // ...
  }
};

function canBeNested(item, target) {
  // Нельзя вложить в себя
  if (item.id === target.id) return false;
  
  // Нельзя вложить родителя в ребенка
  if (target.parent === item.id) return false;
  
  // Нельзя вложить, если target уже имеет родителя (глубина = 1)
  if (target.parent) return false;
  
  return true;
}
```

---

### **ФАЗА 4: Frontend - Виджеты в профиле (2-3 недели)**

#### Неделя 13-14: Управление виджетами в профиле
**Цель:** Админ может добавлять виджеты в профиль пользователя

**Задачи:**
- [ ] Страница настройки виджетов профиля (админка)
- [ ] Кнопка "Добавить виджет"
- [ ] Модальное окно выбора виджетов
- [ ] Настройка размера виджета (ширина/высота)
- [ ] Drag & Drop для изменения порядка

**Админка:**
```tsx
// frontend/src/pages/admin/ProfileWidgetsPage.tsx
<PageTemplate title="Виджеты профиля">
  <Card>
    <div className="flex justify-between items-center mb-4">
      <h2>Активные виджеты</h2>
      <Button onClick={() => setShowModal(true)}>
        Добавить виджет
      </Button>
    </div>
    
    {/* Список виджетов с drag & drop */}
    <DndContext onDragEnd={handleReorder}>
      <SortableContext items={profileWidgets}>
        {profileWidgets.map(widget => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={() => removeWidget(widget.id)}
            onConfigure={() => configureWidget(widget.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  </Card>
  
  {/* Модальное окно выбора виджета */}
  <Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title="Выбрать виджет"
  >
    <div className="widgets-grid">
      {availableWidgets.map(widget => (
        <WidgetPreviewCard
          widget={widget}
          onSelect={() => addWidget(widget.id)}
        />
      ))}
    </div>
  </Modal>
</PageTemplate>
```

#### Неделя 15: Отображение виджетов в профиле
**Цель:** Пользователь видит виджеты как iframe карточки

**Задачи:**
- [ ] Обновить DashboardPage (профиль)
- [ ] Grid layout для виджетов
- [ ] Адаптивные iframe карточки
- [ ] Ограничения по размеру (мин/макс высота/ширина)
- [ ] Загрузка виджетов через API

**UI профиля:**
```tsx
// frontend/src/pages/DashboardPage.tsx
<PageTemplate>
  {/* Существующий контент профиля */}
  <ProfileContent />
  
  {/* НОВОЕ: Виджеты */}
  <div className="profile-widgets">
    <h2>Виджеты</h2>
    
    <div className="widgets-grid">
      {widgets.map(widget => (
        <WidgetIframeCard
          key={widget.id}
          widget={widget}
          width={widget.width} // Grid units
          height={widget.height}
        />
      ))}
    </div>
  </div>
</PageTemplate>

// Компонент виджета
const WidgetIframeCard = ({ widget, width, height }) => {
  return (
    <Card
      className="widget-card"
      style={{
        gridColumn: `span ${width}`,
        gridRow: `span ${height}`,
        minHeight: '200px',
        maxHeight: '600px',
        minWidth: '300px',
        maxWidth: '800px',
      }}
    >
      <div className="widget-header">
        <Icon name={widget.icon} />
        <h3>{widget.name}</h3>
      </div>
      
      <div className="widget-content">
        <iframe
          src={widget.url}
          title={widget.name}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </Card>
  );
};
```

---

### **ФАЗА 5: Backend - Интеграция с событиями (2-3 недели)**

#### Неделя 16-17: Генерация событий в коде
**Цель:** Раскидать хуки по всей системе

**Задачи:**
- [ ] Добавить генерацию событий в контроллеры
- [ ] Добавить события в сервисы
- [ ] Хуки в меню (render, click, create, update)
- [ ] Хуки в виджеты (load, render, data)
- [ ] Хуки в аутентификацию
- [ ] Хуки в оплату
- [ ] Middleware для событий

**Примеры интеграции:**

```typescript
// В AuthController
@Post('login')
async login(@Body() dto: LoginDto) {
  // Событие ПЕРЕД логином
  const beforeResult = await this.eventBus.emit('auth.before_login', {
    email: dto.email,
    ip: req.ip
  });
  
  // Если какой-то плагин вернул false - блокируем
  if (beforeResult === false) {
    throw new UnauthorizedException('Login blocked by plugin');
  }
  
  // Основная логика
  const user = await this.authService.login(dto);
  
  // Событие ПОСЛЕ логина
  await this.eventBus.emit('auth.after_login', {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    ip: req.ip,
    timestamp: new Date()
  });
  
  return user;
}

// В MenuController
@Get('menu-settings')
async getMenuSettings() {
  const menu = await this.menuService.getSettings();
  
  // Событие перед рендером меню
  await this.eventBus.emit('menu.before_render', { menu });
  
  return menu;
}

// В ProfileController
@Get('widgets')
async getProfileWidgets(@CurrentUser() user) {
  const widgets = await this.widgetService.getForUser(user.id);
  
  // Событие перед загрузкой виджетов
  await this.eventBus.emit('widget.before_load', { 
    userId: user.id,
    widgets 
  });
  
  return widgets;
}
```

#### Неделя 18: Загрузка и активация плагинов
**Цель:** Плагины автоматически регистрируют свои хуки

**Задачи:**
- [ ] Динамическая загрузка плагинов при старте
- [ ] Регистрация обработчиков событий
- [ ] Lifecycle hooks (onInstall, onEnable, onDisable)
- [ ] Hot reload плагинов (для разработки)

**Loader:**
```typescript
// backend/src/plugins/plugin-loader.service.ts
@Injectable()
export class PluginLoaderService implements OnModuleInit {
  constructor(
    private eventBus: EventBusService,
    private registry: PluginRegistryService
  ) {}
  
  async onModuleInit() {
    await this.loadAllPlugins();
  }
  
  async loadAllPlugins() {
    const plugins = await this.registry.getEnabled();
    
    for (const pluginMeta of plugins) {
      try {
        await this.loadPlugin(pluginMeta);
      } catch (error) {
        console.error(`Failed to load plugin ${pluginMeta.slug}:`, error);
      }
    }
  }
  
  async loadPlugin(meta: ExtensionMetadata) {
    // 1. Динамически импортируем плагин
    const pluginPath = path.join(meta.pathOnDisk, 'plugin.js');
    const PluginClass = (await import(pluginPath)).default;
    
    // 2. Создаем экземпляр
    const plugin = new PluginClass(meta, this.eventBus);
    
    // 3. Вызываем onEnable
    if (plugin.onEnable) {
      await plugin.onEnable();
    }
    
    // 4. Регистрируем обработчики событий
    if (plugin.registerEventHandlers) {
      plugin.registerEventHandlers();
    }
    
    console.log(`✓ Plugin ${meta.slug} loaded successfully`);
  }
}
```

---

### **ФАЗА 6: Документация и примеры (1-2 недели)**

#### Неделя 19-20: Документация для разработчиков
**Цель:** Документация по созданию плагинов

**Задачи:**
- [ ] Написать Developer Guide
- [ ] Примеры плагинов (3-5 штук)
- [ ] API Reference
- [ ] Список всех событий
- [ ] Best practices
- [ ] FAQ

**Примеры плагинов:**
1. Email Notification Plugin (простой)
2. Analytics Dashboard (hybrid с UI)
3. Custom Authentication (auth)
4. Payment Gateway (payment)
5. Weather Widget (виджет)

---

## 📂 Структура файлов плагина

### manifest.json
```json
{
  "slug": "analytics-dashboard",
  "name": "Analytics Dashboard",
  "description": "Comprehensive analytics and reporting dashboard",
  "version": "1.0.0",
  "author": {
    "name": "Loginus Team",
    "email": "dev@loginus.ru",
    "url": "https://loginus.ru"
  },
  
  "extensionType": "menu_item",
  
  "ui": {
    "enabled": true,
    "type": "embedded",
    "icon": "chart-bar",
    "path": "/analytics",
    "label": "Аналитика",
    "labelRu": "Аналитика",
    "labelEn": "Analytics"
  },
  
  "events": {
    "subscribes": [
      "user.login",
      "data.created",
      "data.updated",
      "menu.before_render"
    ]
  },
  
  "api": {
    "endpoints": [
      {
        "method": "GET",
        "path": "/stats",
        "description": "Get aggregated statistics"
      },
      {
        "method": "GET",
        "path": "/reports/:id",
        "description": "Get specific report"
      }
    ]
  },
  
  "dependencies": {
    "axios": "^1.6.0",
    "date-fns": "^2.30.0"
  }
}
```

### plugin.ts
```typescript
import { Plugin, EventPayload } from '@loginus/plugin-sdk';

export default class AnalyticsDashboardPlugin extends Plugin {
  private stats: Map<string, number> = new Map();
  
  async onInstall(): Promise<void> {
    console.log('Analytics plugin installed');
    // Создаем таблицы в БД, если нужно
    await this.createTables();
  }
  
  async onEnable(): Promise<void> {
    console.log('Analytics plugin enabled');
    this.stats.clear();
  }
  
  async onDisable(): Promise<void> {
    console.log('Analytics plugin disabled');
  }
  
  registerEventHandlers(): void {
    // Отслеживаем логины
    this.on('user.login', async (event: EventPayload) => {
      const count = this.stats.get('logins') || 0;
      this.stats.set('logins', count + 1);
      
      console.log(`Total logins: ${count + 1}`);
    });
    
    // Отслеживаем создание данных
    this.on('data.created', async (event: EventPayload) => {
      const count = this.stats.get('data_created') || 0;
      this.stats.set('data_created', count + 1);
    });
    
    // Модифицируем меню перед рендером
    this.on('menu.before_render', async (event: EventPayload) => {
      // Добавляем бейдж с количеством новых данных
      const menu = event.data.menu;
      const analyticsItem = menu.items.find(i => i.id === 'analytics');
      
      if (analyticsItem) {
        analyticsItem.badge = this.stats.get('data_created') || 0;
      }
      
      return true; // Продолжаем цепочку
    });
  }
  
  // API endpoints
  @Get('/stats')
  async getStats() {
    return {
      logins: this.stats.get('logins') || 0,
      dataCreated: this.stats.get('data_created') || 0,
      dataUpdated: this.stats.get('data_updated') || 0
    };
  }
  
  @Get('/reports/:id')
  async getReport(@Param('id') id: string) {
    // Генерация отчета
    return {
      id,
      data: [],
      generatedAt: new Date()
    };
  }
  
  private async createTables() {
    // SQL для создания таблиц
  }
}
```

### package.json
```json
{
  "name": "analytics-dashboard",
  "version": "1.0.0",
  "main": "plugin.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### frontend/index.html (UI плагина)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .stat-card {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <h1>Analytics Dashboard</h1>
  
  <div id="stats"></div>
  
  <script>
    // Загружаем статистику через API плагина
    async function loadStats() {
      const response = await fetch('/api/plugins/analytics-dashboard/stats');
      const stats = await response.json();
      
      document.getElementById('stats').innerHTML = `
        <div class="stat-card">
          <h3>Логинов: ${stats.logins}</h3>
        </div>
        <div class="stat-card">
          <h3>Создано данных: ${stats.dataCreated}</h3>
        </div>
        <div class="stat-card">
          <h3>Обновлено данных: ${stats.dataUpdated}</h3>
        </div>
      `;
    }
    
    loadStats();
    setInterval(loadStats, 5000); // Обновляем каждые 5 секунд
  </script>
</body>
</html>
```

---

## 📊 Timeline сводка

| Фаза | Недели | Задачи |
|------|--------|--------|
| **1. Backend Event System** | 1-5 | Event Bus, Plugin Registry, Upload .zip |
| **2. Frontend Расширения** | 6-9 | Менеджер, Плагины, Виджеты |
| **3. Frontend Меню** | 10-12 | Выбор плагина, Автопути, Drag&Drop |
| **4. Frontend Профиль** | 13-15 | Управление виджетами, Отображение |
| **5. Backend Интеграция** | 16-18 | Хуки в код, Загрузка плагинов |
| **6. Документация** | 19-20 | Guide, Примеры, API Reference |

**Общее время: 16-20 недель (~4-5 месяцев)**

---

## 🎯 MVP (если нужно быстрее - 10-12 недель)

### MVP Scope:
- ✅ Фаза 1: Event System + Upload (недели 1-5)
- ✅ Фаза 2: Расширения UI (недели 6-9)
- ❌ Фаза 3: Меню - УПРОЩЕННАЯ (без drag&drop вложенности)
- ❌ Фаза 4: Виджеты - ОТЛОЖИТЬ
- ✅ Фаза 5: Базовая интеграция (недели 10-12)
- ❌ Фаза 6: Документация - МИНИМАЛЬНАЯ

---

## ✅ Результат

После внедрения получаем:
- ✅ Система расширений (плагины + виджеты)
- ✅ Event-driven архитектура (50+ событий)
- ✅ Загрузка .zip через админку
- ✅ Автоматическая установка и регистрация
- ✅ Плагины с UI в меню
- ✅ Виджеты в профиле (iframe карточки)
- ✅ Автопути для пунктов меню
- ✅ Вложенность (1 уровень)
- ✅ Drag & Drop (горизонтальный + вертикальный)
- ✅ API для плагинов
- ✅ Документация и примеры

---

**Дата создания:** 29 ноября 2024  
**Версия:** 2.0  
**Статус:** Утверждено к разработке

