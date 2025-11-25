# MobileBottomNav

Компонент мобильной нижней навигации для дашборда. Отображается только на мобильных устройствах (экраны меньше `xl` breakpoint, т.е. < 1280px).

## Особенности

- Отображается только на мобильных устройствах (`xl:hidden`)
- Закреплен внизу экрана (`fixed bottom-0`)
- Поддерживает безопасную зону для устройств с вырезом (notch)
- Автоматически фильтрует пункты меню (без children)
- Если пунктов больше 5, показывает первые 4 + пункт "Еще"
- При нажатии на "Еще" открывается выпадающее меню с остальными пунктами
- Подсвечивает активный пункт на основе текущего пути
- Поддерживает все типы навигации (default, external, iframe, embedded)
- Выпадающее меню закрывается при клике вне его или при переходе на другую страницу

## Использование

Компонент автоматически интегрирован в `PageTemplate` и отображается на всех страницах с сайдбаром (`showSidebar={true}`).

### Ручное использование

```tsx
import { MobileBottomNav } from '@/design-system/layouts';
import type { SidebarItem } from '@/design-system/layouts';

const items: SidebarItem[] = [
  { label: 'Профиль', path: '/dashboard', icon: 'home' },
  { label: 'Безопасность', path: '/security', icon: 'shield' },
  { label: 'Семья', path: '/family', icon: 'users' },
  { label: 'Платежи', path: '/pay', icon: 'credit-card' },
  { label: 'Поддержка', path: '/support', icon: 'help-circle' },
];

<MobileBottomNav
  items={items}
  onNavigate={(path) => navigate(path)}
/>
```

## Стилизация

Компонент использует `themeClasses` для единообразия с остальной дизайн-системой:
- Фон: `themeClasses.background.surfaceElevated`
- Граница: `themeClasses.border.default`
- Текст: `themeClasses.text.secondary` (неактивный), `text-primary` (активный)

## Адаптивность

- **Мобильные устройства (< 1280px)**: Компонент виден и закреплен внизу экрана
- **Десктоп (≥ 1280px)**: Компонент скрыт (`xl:hidden`)

## Отступы контента

На страницах с мобильной навигацией автоматически добавляется отступ снизу (`pb-20`) для мобильных устройств, чтобы контент не перекрывался навигацией.

