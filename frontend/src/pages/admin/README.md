# Административная консоль Loginus

## Описание

Административная консоль — это специализированный интерфейс для управления системой Loginus. Она имеет собственную визуальную идентичность, отличающуюся от пользовательского профиля.

## Отличия от пользовательского профиля

### Визуальные отличия

1. **Сайдбар**
   - Более темный фон: `slate-900` вместо стандартного светлого
   - Акцентный цвет: **фиолетовый (purple)** вместо синего (blue)
   - Надпись "АДМИН-ПАНЕЛЬ" вверху сайдбара
   - Кнопка "Вернуться в профиль" для быстрого переключения

2. **Цветовая схема**
   - Фон сайдбара: `bg-slate-900 dark:bg-slate-950`
   - Текст: `text-slate-200 dark:text-slate-300`
   - Вторичный текст: `text-slate-400 dark:text-slate-500`
   - Активный пункт: фиолетовая полоска слева `border-purple-500`
   - Hover эффекты: `hover:bg-slate-800 dark:hover:bg-slate-900`

3. **Фон контента**
   - `bg-slate-50 dark:bg-slate-900` (более холодный оттенок)

### Функциональные отличия

- **Специализированный сайдбар** с пунктами меню для администрирования
- **Отдельный компонент** `AdminPageTemplate` вместо `PageTemplate`
- **Отдельный сайдбар** `AdminSidebar` вместо `Sidebar`

## Структура файлов

```
frontend/src/
├── design-system/
│   └── layouts/
│       ├── AdminSidebar/           # Сайдбар для админки
│       │   ├── AdminSidebar.tsx
│       │   └── index.ts
│       └── AdminPageTemplate/      # Шаблон страницы для админки
│           ├── AdminPageTemplate.tsx
│           └── index.ts
├── pages/
│   └── admin/
│       ├── AdminDashboardPage.tsx       # Главная страница админки
│       ├── UsersManagementPage.tsx      # Управление пользователями
│       ├── CompaniesManagementPage.tsx  # Управление компаниями
│       ├── AuthFlowBuilderPage.tsx      # Конструктор алгоритма авторизации
│       └── BackupSettingsPage.tsx       # Настройки бекапов
├── components/
│   └── Admin/
│       └── AdminWidgets/           # Виджеты для админ-дашборда
│           ├── OverviewMetricsWidget.tsx
│           ├── RecentActivitiesWidget.tsx
│           └── index.ts
└── hooks/
    ├── useAdminPermissions.ts      # Хук для проверки прав админа
    └── useAdminWidgets.ts          # Хук для управления виджетами админки
```

## Роли и права доступа

### Роли

1. **super_admin** - Супер-администратор SaaS сервиса
   - Полный доступ ко всем функциям
   - Управление компаниями
   - Настройка тарифов

2. **super_admin_staff** - Сотрудники супер-админа
   - Ограниченные права
   - Без доступа к управлению компаниями

3. **company_admin** - Администратор компании
   - Управление пользователями своей компании
   - Настройка алгоритма авторизации
   - Настройки бекапов

4. **company_admin_staff** - Сотрудники админа компании
   - Ограниченные права
   - Просмотр данных

### Проверка прав

Используйте хук `useAdminPermissions`:

```typescript
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

const MyComponent = () => {
  const {
    isSuperAdmin,        // Проверка super_admin
    isCompanyAdmin,      // Проверка company_admin
    isAdmin,             // Проверка любого админа
    hasRole,             // Проверка конкретной роли
    hasPermission,       // Проверка конкретного права
    canAccessCompany,    // Проверка доступа к компании
  } = useAdminPermissions();

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {isSuperAdmin && <CompanyManagement />}
      <UserManagement />
    </div>
  );
};
```

## Пункты меню админ-панели

1. **Дашборд** (`/admin`)
   - Обзорные метрики (Revenue, Active Users, CLV, CAC)
   - Последние активности
   - Доступен всем админам

2. **Пользователи** (`/admin/users`)
   - Список пользователей с фильтрацией
   - Создание/редактирование/удаление пользователей
   - Для `company_admin` - только пользователи своей компании
   - Для `super_admin` - пользователи всех компаний
   - **Оптимизации производительности**
     - Поиск в таблице использует `useDebounce` (400 мс), чтобы не перегружать API при наборе текста
     - `React Query` сохраняет предыдущую страницу (`keepPreviousData`) и показывает фоновый индикатор загрузки вместо полной перерисовки
     - Данные компаний кешируются в `Map`, а даты формируются заранее через `formatDate`, что уменьшает вычисления при рендере строк таблицы

3. **Компании** (`/admin/companies`)
   - Список компаний
   - Управление компаниями
   - **Только для super_admin**

4. **Алгоритм авторизации** (`/admin/auth-flow`)
   - Drag & Drop конструктор шагов авторизации
   - Настройка обязательных шагов
   - Доступен всем админам

5. **Бекапы и синхронизация** (`/admin/backup`)
   - Настройки бекапов
   - Расписание синхронизации
   - История бекапов
   - Доступен всем админам

## Использование AdminPageTemplate

Все страницы админ-панели используют `AdminPageTemplate` вместо `PageTemplate`:

```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminPageTemplate } from '@/design-system/layouts/AdminPageTemplate';

const MyAdminPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminPageTemplate 
      title={t('admin.mypage.title', 'Моя админ-страница')}
      showSidebar={true}
    >
      <div className="p-4">
        {/* Контент страницы */}
      </div>
    </AdminPageTemplate>
  );
};

export default MyAdminPage;
```

## Виджеты админ-дашборда

Виджеты работают аналогично виджетам в пользовательском профиле, но с собственными данными:

1. **OverviewMetricsWidget** - Обзорные метрики
   - Total Revenue
   - Active Users
   - Customer Lifetime Value
   - Customer Acquisition Cost

2. **RecentActivitiesWidget** - Последние активности
   - Действия пользователей
   - Системные события

### Управление виджетами

Используется хук `useAdminWidgets` (аналогично `useWidgetPreferences`):

```typescript
import { useAdminWidgets } from '@/hooks/useAdminWidgets';

const availableWidgets = [
  {
    id: 'overview-metrics',
    title: 'Overview Metrics',
    description: 'Key performance indicators',
    icon: 'bar-chart-2',
    enabled: true,
  },
  // ...
];

const {
  enabledWidgets,
  orderedWidgets,
  toggleWidget,
  removeWidget,
  reorderWidgets,
} = useAdminWidgets(availableWidgets);
```

## Навигация между профилем и админкой

### Из профиля в админку

В Header пользовательского профиля для админов отображается кнопка "Админ-панель".

### Из админки в профиль

В нижней части AdminSidebar есть кнопка "Вернуться в профиль".

## API endpoints (Mock)

Все API endpoints для админки реализованы как моки:

- `GET /admin/stats` - Статистика для дашборда
- `GET /admin/users` - Список пользователей
- `POST /admin/users` - Создание пользователя
- `PUT /admin/users/:id` - Обновление пользователя
- `DELETE /admin/users/:id` - Удаление пользователя
- `GET /admin/companies` - Список компаний (только super_admin)
- `POST /admin/companies` - Создание компании
- `GET /admin/auth-flow` - Получение алгоритма авторизации
- `PUT /admin/auth-flow` - Обновление алгоритма авторизации
- `GET /admin/backup/settings` - Настройки бекапов
- `PUT /admin/backup/settings` - Обновление настроек бекапов

## Отладка

Для отладки ролей в development режиме доступны консольные утилиты:

```javascript
// В консоли браузера
window.adminDebug.checkRole();  // Проверить текущую роль
window.adminDebug.setRole('super_admin');  // Установить роль super_admin
window.adminDebug.setRole('company_admin', 'company-1');  // Установить роль company_admin с companyId
```

## Тестирование доступа

1. Авторизуйтесь в системе
2. Установите роль через консоль: `window.adminDebug.setRole('super_admin')`
3. Перейдите на `/ru/admin`
4. Проверьте доступ к разным разделам

Подробнее см. `ADMIN_CONSOLE_SETUP.md` в корне проекта.
