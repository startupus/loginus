# ТЗ: Главная страница (Dashboard) Яндекс ID

## URL
https://id.yandex.ru/

## Статус в Loginus
❌ **Не реализовано**

## Визуальный референс
Скриншот: `.playwright-mcp/yandex-id-audit/01-dashboard-without-auth.png`

## Описание
Главная страница Яндекс ID — это центральный дашборд пользователя, объединяющий все ключевые сервисы и функции в едином интерфейсе. Страница демонстрирует отличную информационную архитектуру и визуальную иерархию.

## Актуальные секции (из визуального аудита)

1. **Профиль** - Dmitriy Lukyan, +7 905 730-81-81, dmitriy-ldm, кнопка "Объединить аккаунты"
2. **Промо-блок** - "Этот номер ещё актуален?" с кнопками Да/Нет  
3. **Яндекс Пэй** - 90₽ Карта Пэй, 120,000₽ на сплиты, виджеты (Копите с Сейвами, Кредит, Кешбэк, Семейная карта, Карты, История)
4. **Яндекс Плюс** - 0 баллов, 12 заданий, Близкие в Плюсе, Управление подпиской
5. **Документы** - Паспорт, Загран, ВУ, ОМС, СНИЛС (с иконкой +)
6. **Адреса** - Дом, Работа, Другие (с картами)
7. **Семья** - 5 членов (Вы, Артемий Л., Оксана Л., Настя Лукьян, Аня) + Добавить, Дети, Питомцы
8. **Подписки** - Тариф Яндекс 360, Помощь рядом

## Анализ лучших практик UI/UX Яндекс ID

### Информационная архитектура
- **Модульная структура**: Страница разделена на логические секции (Профиль, Яндекс Пэй, Яндекс Плюс, Документы, Адреса, Семья, Подписки)
- **Приоритизация**: Профиль пользователя вверху, затем финансовые сервисы, затем вспомогательные функции
- **Быстрый доступ**: Все ключевые действия доступны с главной страницы без глубокой навигации

### Визуальная иерархия
- **Карточный дизайн**: Каждая секция оформлена как отдельная карточка с четкими границами
- **Типографика**: Заголовки секций (h2), подзаголовки, четкая иерархия текста
- **Иконография**: Каждая функция имеет уникальную иконку для быстрого распознавания
- **Цветовая кодировка**: Разные цвета для разных типов действий (финансы, документы, семья)

### Интерактивность
- **Микро-анимации**: Плавные переходы при наведении на карточки
- **Feedback**: Визуальная обратная связь при клике на элементы
- **Контекстные действия**: Кнопки "+" на карточках для быстрого добавления

### UX паттерны
- **Progressive Disclosure**: Основная информация видна сразу, детали доступны по клику
- **Quick Actions**: Быстрые действия прямо на карточках (Добавить, Открыть)
- **Contextual Navigation**: Ссылки ведут к соответствующим разделам

### Адаптивность
- **Двухколоночный layout**: Sidebar слева, контент справа
- **Responsive карточки**: Карточки адаптируются под размер экрана
- **Sticky navigation**: Sidebar остается видимым при прокрутке

### Accessibility
- **Семантическая разметка**: Использование правильных HTML тегов (nav, main, header)
- **ARIA labels**: Поддержка screen readers
- **Keyboard navigation**: Все элементы доступны с клавиатуры

## Структура страницы

### Header (Banner)
```jsx
<header className="banner">
  <Link to="/">
    <img src="logo.svg" alt="Яндекс ID" />
    <span>Яндекс ID</span>
  </Link>
  <div className="header-actions">
    <Combobox placeholder="Найти разделы ID" />
    <Button onClick={openProfilePopup}>
      <Avatar src={user.avatar} />
      <Badge count={48} />
    </Button>
  </div>
</header>
```

**Элементы:**
- Logo с ссылкой на главную
- Поиск по разделам (Combobox)
- Кнопка профиля с аватаром и badge уведомлений (48)

### Sidebar (Navigation)
```jsx
<nav className="sidebar">
  <ul>
    <li>
      <Link to="/" active>
        <Icon name="home" />
        <span>Главная</span>
      </Link>
    </li>
    <li>
      <Link to="/personal">
        <Icon name="document" />
        <span>Данные</span>
      </Link>
    </li>
    <li>
      <Link to="/pay">
        <Icon name="credit-card" />
        <span>Пэй</span>
      </Link>
    </li>
    <li>
      <Link to="/family">
        <Icon name="users" />
        <span>Семья</span>
      </Link>
    </li>
    <li>
      <Link to="/security">
        <Icon name="shield" />
        <span>Безопасность</span>
      </Link>
    </li>
    <li>
      <Link to="/helpdesk">
        <Icon name="help" />
        <span>Поддержка</span>
      </Link>
    </li>
    <li>
      <Button onClick={openMoreMenu}>
        <Icon name="grid" />
        <span>Ещё</span>
      </Button>
    </li>
  </ul>
  <footer>
    <LanguageSelector />
    <Link to="/support">Справка</Link>
    <Link to="/oauth">Яндекс ID для сайта</Link>
    <p>© 2001–2025 Яндекс</p>
  </footer>
</nav>
```

**Особенности:**
- Фиксированная навигация слева
- Активное состояние текущей страницы
- Иконки для каждого пункта
- Footer с языковым селектором и ссылками

### Main Content

#### 1. Секция Профиля
```jsx
<section className="profile-section">
  <div className="profile-card">
    <Avatar src={user.avatar} size="2xl" />
    <div className="profile-info">
      <h2>
        {user.name}
        <Button variant="ghost" size="sm">
          <Icon name="edit" />
        </Button>
      </h2>
      <ul>
        <li>{user.phone}</li>
        <li>{user.email}</li>
      </ul>
    </div>
    <Link to="/promo/profiles">
      <Button variant="primary">Объединить аккаунты</Button>
    </Link>
  </div>
  
  <div className="birthday-card">
    <div className="content">
      <h3>Когда вас поздравить?</h3>
      <p>Добавьте день рождения — подготовим сюрпризы</p>
    </div>
    <Button onClick={openBirthdayModal}>
      Добавить
    </Button>
    <img src="gift-illustration.svg" alt="Подарок" />
  </div>
</section>
```

**Элементы:**
- Карточка профиля с аватаром, именем, контактами
- Кнопка редактирования профиля
- Кнопка "Объединить аккаунты"
- Карточка дня рождения с CTA

#### 2. Секция Яндекс Пэй
```jsx
<section className="pay-section">
  <header>
    <h2>
      <Link to="/pay">Яндекс Пэй</Link>
    </h2>
  </header>
  
  <div className="pay-cards-grid">
    <Card variant="primary" onClick={openPayCard}>
      <Icon name="credit-card" size="lg" />
      <span>Открыть карту Пэй</span>
      <Button variant="ghost" size="sm">+</Button>
    </Card>
    
    <Card variant="feature" onClick={openLimit}>
      <Icon name="leaf" size="lg" />
      <div>
        <span>Тратьте до</span>
        <strong>200 000 ₽</strong>
      </div>
      <Button variant="ghost" size="sm">+</Button>
    </Card>
    
    <div className="pay-features-grid">
      {payFeatures.map(feature => (
        <Card key={feature.id} variant="compact" onClick={feature.action}>
          <Icon name={feature.icon} />
          <span>{feature.label}</span>
          <Button variant="ghost" size="xs">+</Button>
        </Card>
      ))}
    </div>
  </div>
</section>
```

**Функции:**
- Открыть карту Пэй
- Тратьте до 200 000 ₽
- Копите с Сейвами
- Кредит
- Кешбэк на месяц
- Семейная карта
- Карты
- История платежей

#### 3. Секция Яндекс Плюс
```jsx
<section className="plus-section">
  <header>
    <h2>
      <Link to="/plus">Яндекс Плюс</Link>
    </h2>
  </header>
  
  <Card variant="promo" onClick={subscribePlus}>
    <img src="plus-illustration.svg" alt="Плюс" />
    <div>
      <h3>Подключите Плюс</h3>
      <p>Кино, музыка, книги в одной мультиподписке для всей семьи</p>
    </div>
    <Icon name="chevron-right" />
  </Card>
</section>
```

#### 4. Секция Документы
```jsx
<section className="documents-section">
  <header>
    <h2>
      <Link to="/personal/documents">Документы</Link>
    </h2>
  </header>
  
  <div className="documents-grid">
    <Button variant="outline" onClick={showAllDocuments}>
      <Icon name="grid" />
      <span>Все</span>
    </Button>
    
    {documentTypes.map(doc => (
      <Button 
        key={doc.type} 
        variant="card" 
        onClick={() => openAddDocumentModal(doc.type)}
      >
        <Icon name={doc.icon} />
        <span>{doc.label}</span>
      </Button>
    ))}
  </div>
</section>
```

**Типы документов:**
- Паспорт
- Загранпаспорт
- ВУ (Водительское удостоверение)
- ОМС (Полис медицинского страхования)
- СНИЛС

#### 5. Секция Адреса
```jsx
<section className="addresses-section">
  <header>
    <h2>
      <Link to="/personal/addresses">Адреса</Link>
    </h2>
  </header>
  
  <div className="addresses-grid">
    <Button 
      variant="card" 
      onClick={() => openAddAddressModal('home')}
    >
      <Icon name="home" />
      <span>Дом</span>
    </Button>
    
    <Button 
      variant="card" 
      onClick={() => openAddAddressModal('work')}
    >
      <Icon name="briefcase" />
      <span>Работа</span>
    </Button>
    
    <Button 
      variant="card" 
      onClick={() => openAddAddressModal('other')}
    >
      <Icon name="map-pin" />
      <span>Другие</span>
    </Button>
  </div>
</section>
```

#### 6. Секция Семья
```jsx
<section className="family-section">
  <header>
    <h2>
      <Link to="/family">Семья</Link>
    </h2>
  </header>
  
  <div className="family-members">
    {familyMembers.map(member => (
      <Card key={member.id} variant="avatar" onClick={openMemberProfile}>
        <Avatar src={member.avatar} />
        <span>{member.name}</span>
      </Card>
    ))}
    
    <Button variant="card" onClick={openAddMemberModal}>
      <Icon name="plus" />
      <span>Добавить</span>
    </Button>
    
    <Button variant="card" onClick={openChildrenModal}>
      <Icon name="child" />
      <span>Дети</span>
    </Button>
    
    <Button variant="card" onClick={openPetsModal}>
      <Icon name="paw" />
      <span>Питомцы</span>
    </Button>
  </div>
</section>
```

#### 7. Секция Подписки
```jsx
<section className="subscriptions-section">
  <header>
    <h2>Подписки</h2>
  </header>
  
  <div className="subscriptions-list">
    {subscriptions.map(sub => (
      <Card key={sub.id} variant="subscription" onClick={openSubscription}>
        <Icon name={sub.icon} />
        <span>{sub.name}</span>
        <Icon name="chevron-right" />
      </Card>
    ))}
  </div>
</section>
```

## Попапы и модальные окна

### Попап профиля (Profile Popup)
**Триггер:** Кнопка "Ваш профиль" в header

**Структура:**
```jsx
<Modal variant="dropdown" anchor="header-right">
  <ModalHeader>
    <Link to="/">Яндекс ID</Link>
    <Button onClick={closeModal}>
      <Icon name="close" />
    </Button>
  </ModalHeader>
  
  <ModalBody>
    <div className="profile-info">
      <Link to="/">Управление аккаунтом</Link>
      <h3>{user.name}</h3>
      <p>{user.phone} • {user.email}</p>
    </div>
    
    <Button variant="promo" onClick={openBirthdayModal}>
      <div>
        <h4>Добавьте день рождения</h4>
        <p>Подготовим для вас сюрпризы</p>
      </div>
      <Button size="sm">Добавить</Button>
      <img src="gift-icon.svg" alt="" />
    </Button>
    
    <nav className="quick-links">
      <Link to="/mail">
        <Icon name="mail" />
        <div>
          <span>Почта</span>
          <Badge count={48}>непрочитанных писем</Badge>
        </div>
      </Link>
      
      <Link to="/plus">
        <Icon name="star" />
        <div>
          <span>Подключить Плюс</span>
          <p>Все развлечения и выгода в одной подписке</p>
        </div>
      </Link>
      
      <Link to="/personal?dialog=personal-data">
        <Icon name="user" />
        <div>
          <span>Личные данные</span>
          <p>ФИО, день рождения, пол</p>
        </div>
      </Link>
      
      <Link to="/security/phones">
        <Icon name="phone" />
        <div>
          <span>Телефон</span>
          <p>{user.phone}</p>
        </div>
      </Link>
    </nav>
    
    <div className="settings-links">
      <Button onClick={openAppearance}>
        <Icon name="palette" />
        <span>Внешний вид</span>
      </Button>
      
      <Link to="/tune">
        <Icon name="settings" />
        <span>Настройки</span>
      </Link>
      
      <Link to="/support">
        <Icon name="help" />
        <span>Справка</span>
      </Link>
    </div>
    
    <Button variant="ghost" onClick={switchAccount}>
      <Icon name="switch" />
      <span>Сменить аккаунт</span>
    </Button>
  </ModalBody>
</Modal>
```

**Особенности:**
- Открывается как dropdown из header
- Использует iframe для изоляции
- Быстрые ссылки на ключевые разделы
- Badge с количеством непрочитанных писем
- Промо-блок для дня рождения

### Модальное окно добавления дня рождения
**Триггер:** Кнопка "Добавить" в карточке дня рождения или в попапе профиля

**Содержание:**
- Форма с полем даты рождения
- Календарь для выбора даты
- Кнопка "Сохранить"

### Модальное окно добавления документа
**Триггер:** Кнопка "Добавить [Тип документа]" в секции Документы

**Содержание:**
- Форма загрузки документа (фото/сканирование)
- Поля для ввода данных документа
- Валидация
- Кнопки "Сохранить" и "Отмена"

### Модальное окно добавления адреса
**Триггер:** Кнопки "Добавить [Тип адреса]" в секции Адреса

**Содержание:**
- Форма с полями адреса
- Интеграция с картами для автозаполнения
- Выбор типа адреса (Дом, Работа, Другие)
- Кнопки "Сохранить" и "Отмена"

## Навигация

### Основные переходы
- **Главная** → `/` (текущая страница)
- **Данные** → `/personal`
- **Пэй** → `/pay`
- **Семья** → `/family`
- **Безопасность** → `/security`
- **Поддержка** → `/helpdesk?chatId=id`

### Переходы из виджетов
- **Яндекс Пэй** → `/pay`
- **Документы** → `/personal/documents`
- **Адреса** → `/personal/addresses`
- **Семья** → `/family`
- **Объединить аккаунты** → `/promo/profiles`

### Внешние ссылки
- **Яндекс Плюс** → `https://plus.yandex.ru/`
- **Почта** → `https://mail.yandex.ru`
- **Настройки** → `https://yandex.ru/tune`
- **Справка** → `https://yandex.ru/support/id`

## План модернизации для Loginus

### Что добавить

#### 1. Улучшенная структура компонентов
```jsx
// Использование Atomic Design
import { PageTemplate } from '@/design-system/layouts';
import { Card, Button, Avatar, Badge, Icon } from '@/design-system';
import { useTheme } from '@/design-system/hooks';

const DashboardPage = () => {
  const { theme } = useTheme();
  
  return (
    <PageTemplate
      headerProps={{ ... }}
      sidebarItems={sidebarItems}
      showSidebar
    >
      <DashboardWidgets />
    </PageTemplate>
  );
};
```

#### 2. Виджеты как переиспользуемые компоненты
```jsx
// components/Dashboard/WidgetCard.tsx
interface WidgetCardProps {
  title: string;
  link?: string;
  icon: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  link,
  icon,
  children,
  actions
}) => {
  return (
    <section className="widget-section">
      <header>
        <h2>
          {link ? <Link to={link}>{title}</Link> : title}
        </h2>
      </header>
      <Card variant="widget">
        {children}
      </Card>
      {actions && <div className="widget-actions">{actions}</div>}
    </section>
  );
};
```

#### 3. Поддержка темной темы
```jsx
// Все компоненты должны поддерживать dark mode
<div className="bg-white dark:bg-dark-2 rounded-xl shadow-soft p-8">
  <h2 className="text-secondary-900 dark:text-white">
    {title}
  </h2>
</div>
```

#### 4. i18n для всех текстов
```jsx
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { t } = useTranslation();
  
  return (
    <h2>{t('dashboard.sections.pay.title')}</h2>
  );
};
```

#### 5. Оптимизация производительности
- Lazy loading для виджетов
- Code splitting по секциям
- React.memo для карточек
- Виртуализация для длинных списков

### Что изменить

#### 1. Структура данных
- Использовать React Query для загрузки данных
- Кэширование виджетов
- Оптимистичные обновления

#### 2. Состояние
- Zustand store для dashboard state
- Локальное состояние только для UI

#### 3. Типизация
```typescript
interface DashboardWidget {
  id: string;
  type: 'profile' | 'pay' | 'documents' | 'addresses' | 'family' | 'subscriptions';
  title: string;
  link?: string;
  data: unknown;
  actions?: WidgetAction[];
}

interface WidgetAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}
```

#### 4. Accessibility
- ARIA labels для всех интерактивных элементов
- Keyboard navigation
- Focus management в модальных окнах

#### 5. Responsive дизайн
```jsx
// Адаптивная сетка виджетов
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {widgets.map(widget => (
    <WidgetCard key={widget.id} {...widget} />
  ))}
</div>
```

### Ссылка на существующую страницу Loginus
- Текущая реализация: `frontend/src/pages/DashboardPage.tsx`
- Нужно модернизировать с учетом лучших практик Яндекс ID

## Рекомендации по реализации

### Приоритет 1 (Критично)
1. Создать переиспользуемые компоненты виджетов
2. Реализовать попап профиля
3. Добавить поддержку темной темы
4. Интегрировать i18n

### Приоритет 2 (Важно)
1. Оптимизировать производительность
2. Улучшить accessibility
3. Добавить анимации и transitions
4. Реализовать все модальные окна

### Приоритет 3 (Желательно)
1. Добавить drag & drop для виджетов
2. Реализовать кастомизацию виджетов
3. Добавить аналитику взаимодействий
4. Создать мобильную версию

## Примеры кода для Loginus

### DashboardPage компонент
```tsx
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts';
import { WidgetCard } from '@/components/Dashboard';
import { useDashboardWidgets } from '@/hooks';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { widgets, isLoading } = useDashboardWidgets();
  
  const sidebarItems = [
    { label: t('sidebar.home'), path: '/', active: true },
    { label: t('sidebar.data'), path: '/personal' },
    { label: t('sidebar.pay'), path: '/pay' },
    { label: t('sidebar.family'), path: '/family' },
    { label: t('sidebar.security'), path: '/security' },
    { label: t('sidebar.support'), path: '/helpdesk' },
  ];
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <PageTemplate
      headerProps={{
        userName: user?.name,
        userAvatar: user?.avatar,
        onLogout: logout,
        onLanguageChange: handleLanguageChange,
        currentLanguage: language,
      }}
      sidebarItems={sidebarItems}
      showSidebar
    >
      <div className="dashboard-content">
        {widgets.map(widget => (
          <WidgetCard key={widget.id} {...widget} />
        ))}
      </div>
    </PageTemplate>
  );
};
```

### WidgetCard компонент
```tsx
import { Card, Button, Icon } from '@/design-system';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface WidgetCardProps {
  id: string;
  title: string;
  link?: string;
  icon?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  link,
  icon,
  children,
  actions,
}) => {
  const { t } = useTranslation();
  
  return (
    <section className="mb-8">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
          {link ? (
            <Link to={link} className="hover:text-primary-600 dark:hover:text-primary-400">
              {icon && <Icon name={icon} className="mr-2" />}
              {title}
            </Link>
          ) : (
            <>
              {icon && <Icon name={icon} className="mr-2" />}
              {title}
            </>
          )}
        </h2>
      </header>
      
      <Card variant="widget" className="p-6">
        {children}
      </Card>
      
      {actions && actions.length > 0 && (
        <div className="mt-4 flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
            >
              <Icon name={action.icon} size="sm" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </section>
  );
};
```

---

**Дата создания:** 2025-01-17  
**Статус:** Готово к реализации  
**Приоритет:** Высокий

