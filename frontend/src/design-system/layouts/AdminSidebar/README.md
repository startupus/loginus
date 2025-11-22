# Admin Sidebar - Отдельный сайдбар для админ-панели

## Описание

`AdminSidebar` - это специализированный боковой навигационный компонент для административной консоли Loginus. Он имеет собственную визуальную идентичность, отличающуюся от стандартного `Sidebar`, используемого в пользовательском профиле.

## Основные отличия от Sidebar

### Визуальные отличия

1. **Цветовая схема**
   - Фон: `bg-slate-900 dark:bg-slate-950` (темно-серый)
   - Текст: `text-slate-200 dark:text-slate-300` (светло-серый)
   - Вторичный текст: `text-slate-400 dark:text-slate-500` (серый)
   - Акцентный цвет: **фиолетовый (purple)** вместо синего (blue)

2. **Уникальные элементы**
   - Надпись "АДМИН-ПАНЕЛЬ" фиолетового цвета под логотипом
   - Фиолетовая полоска слева от активного пункта (`border-purple-500`)
   - Кнопка "Вернуться в профиль" в нижней части

3. **Оверлей (backdrop)**
   - Более темный: `bg-slate-900/80 dark:bg-slate-950/80`

### Функциональные отличия

- Специализированные пункты меню для администрирования
- Особая навигация с редиректом на `/admin` при клике на логотип
- Дополнительная кнопка быстрого возврата в пользовательский профиль

## Использование

```typescript
import { AdminSidebar } from '@/design-system/layouts/AdminSidebar';
import type { SidebarItem } from '@/design-system/layouts/Sidebar/Sidebar';

const adminItems: SidebarItem[] = [
  { 
    label: 'Дашборд', 
    path: '/admin', 
    icon: 'chartBar', 
    active: true 
  },
  { 
    label: 'Пользователи', 
    path: '/admin/users', 
    icon: 'users', 
    active: false 
  },
  // ...
];

<AdminSidebar 
  items={adminItems}
  onNavigate={(path) => navigate(path)}
  showLogo={true}
  showThemeSwitcher={true}
  showLanguageSwitcher={true}
/>
```

## Props

Интерфейс `AdminSidebarProps` идентичен `SidebarProps`:

```typescript
interface AdminSidebarProps {
  /** Пункты меню */
  items: SidebarItem[];
  
  /** Callback клика на пункт */
  onNavigate?: (path: string) => void;
  
  /** Дополнительные классы */
  className?: string;
  
  /** Показывать логотип (по умолчанию true) */
  showLogo?: boolean;
  
  /** Показывать переключатель темы (по умолчанию true) */
  showThemeSwitcher?: boolean;
  
  /** Показывать переключатель языка (по умолчанию true) */
  showLanguageSwitcher?: boolean;
}
```

## Цвета и стили

### Основные цвета

```typescript
// Фон сайдбара
bg-slate-900 dark:bg-slate-950

// Текст
text-slate-200 dark:text-slate-300

// Вторичный текст
text-slate-400 dark:text-slate-500

// Hover эффекты
hover:bg-slate-800 dark:hover:bg-slate-900

// Активный пункт
bg-slate-800 dark:bg-slate-900 border-l-4 border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 text-purple-400 dark:text-purple-300

// Акцентный цвет (фиолетовый)
text-purple-400 dark:text-purple-300

// Граница
border-slate-700 dark:border-slate-800
```

### Пример активного пункта

Активный пункт меню получает:
- Фиолетовую полоску слева (`border-l-4 border-purple-500`)
- Фиолетовый цвет текста (`text-purple-400 dark:text-purple-300`)
- Легкий фиолетовый фон (`bg-purple-500/10 dark:bg-purple-500/20`)

### Пример hover эффекта

При наведении пункт получает:
- Темно-серый фон (`hover:bg-slate-800 dark:hover:bg-slate-900`)
- Сдвиг вправо (`hover:translate-x-1`)

## Интеграция с AdminPageTemplate

`AdminSidebar` автоматически используется в `AdminPageTemplate`:

```typescript
import { AdminPageTemplate } from '@/design-system/layouts/AdminPageTemplate';

const MyAdminPage = () => {
  return (
    <AdminPageTemplate 
      title="Моя админ-страница"
      showSidebar={true}
    >
      {/* Контент страницы */}
    </AdminPageTemplate>
  );
};
```

`AdminPageTemplate` автоматически создаст `AdminSidebar` с правильными пунктами меню.

## Пункты меню по умолчанию

В `AdminPageTemplate` определены следующие пункты меню:

1. **Дашборд** - `/admin`
2. **Пользователи** - `/admin/users`
3. **Компании** - `/admin/companies` (только для super_admin)
4. **Алгоритм авторизации** - `/admin/auth-flow`
5. **Бекапы и синхронизация** - `/admin/backup`

## Навигация

### Клик на логотип
Переход на `/admin` (главная страница админки)

### Кнопка "Вернуться в профиль"
Переход на `/dashboard` (пользовательский профиль)

### Кнопка "Справка"
Переход на `/support`

## Адаптивность

`AdminSidebar` полностью адаптивен:

- **Desktop (xl и выше)**: Всегда видим слева
- **Tablet/Mobile (< xl)**: Скрывается, появляется по клику на мобильное меню
- **Backdrop overlay**: Появляется на мобильных устройствах для закрытия сайдбара

## Состояния

### Открыт/Закрыт
Управляется через `useSidebar` hook:

```typescript
const { isOpen, toggleSidebar } = useSidebar();
```

### Активный пункт
Определяется через `active: true` в `SidebarItem`

### Раскрытый dropdown
Для пунктов с `children` - управляется через `openDropdown` в `useSidebar`

## Отличия в реализации

### Статические классы вместо переменных

В отличие от попытки использовать переменные для Tailwind классов, все классы прописаны статически для корректной работы JIT компилятора:

```typescript
// ❌ Не работает с Tailwind JIT
const color = 'purple-400';
className={`text-${color}`}

// ✅ Работает
className="text-purple-400 dark:text-purple-300"
```

## Файлы

```
frontend/src/design-system/layouts/AdminSidebar/
├── AdminSidebar.tsx  # Основной компонент
└── index.ts          # Экспорты
```

## См. также

- `AdminPageTemplate` - шаблон страницы, использующий AdminSidebar
- `Sidebar` - стандартный сайдбар для пользовательского профиля
- `useSidebar` - hook для управления состоянием сайдбара

