# ТЗ: Попап профиля

## Триггер
Клик на кнопку "Ваш профиль" (с аватаром и badge уведомлений) в header

## URL источник
https://id.yandex.ru/ (любая страница)

## Описание
Модальное окно с информацией о профиле пользователя и быстрым доступом к ключевым функциям. Открывается поверх текущей страницы справа от кнопки триггера.

## Визуальный референс
Скриншот: `.playwright-mcp/yandex-id-audit/popup-profile.png`

## Структура попапа

### Header попапа

```tsx
<div className="popup-header">
  <Link to="/" className="logo">
    <Icon name="yandex-id" />
    <span>Яндекс ID</span>
  </Link>
  <Button variant="icon" onClick={closePopup}>
    <Icon name="close" />
  </Button>
</div>
```

**Элементы:**
- Логотип "Яндекс ID" (ссылка на главную)
- Кнопка "Закрыть" (X)

### Информация о пользователе

```tsx
<div className="user-info">
  <Link to="/" className="account-link">
    <Icon name="settings" />
    <span>Управление аккаунтом</span>
  </Link>
  <div className="user-details">
    <p className="user-name">Дмитрий Лукьян</p>
    <p className="user-contacts">+7 905 ***‒**‒81 • dmitriy-ldm</p>
  </div>
</div>
```

**Тексты:**
- "Управление аккаунтом"
- Имя пользователя
- Телефон (частично скрыт) и логин

### Промо-блок актуальности номера

```tsx
<div className="phone-verification-card">
  <div className="card-content">
    <p className="question">Этот номер ещё актуален?</p>
    <p className="phone">+7 905 730‒81‒81</p>
  </div>
  <div className="card-actions">
    <Button variant="secondary">Да</Button>
    <Button variant="secondary">Нет</Button>
  </div>
  <img src="/phone-illustration.svg" alt="" className="illustration" />
</div>
```

**Тексты:**
- "Этот номер ещё актуален?"
- Полный номер телефона
- Кнопки: "Да", "Нет"

### Кнопка выбора организации

```tsx
<Button variant="card" className="organization-selector">
  <Icon name="briefcase" />
  <span>Выбрать организацию</span>
  <Icon name="chevron-right" />
</Button>
```

**Текст:** "Выбрать организацию"

### Быстрые ссылки на сервисы

```tsx
<div className="service-links">
  <Link to="https://mail.yandex.ru" className="service-link">
    <Icon name="mail" />
    <div className="service-info">
      <span className="service-name">Почта</span>
      <span className="service-status">
        <Badge count={1420} />
        <span>непрочитанных писем</span>
      </span>
    </div>
  </Link>
  
  <Separator />
  
  <Link to="https://plus.yandex.ru" className="service-link">
    <Icon name="plus" />
    <div className="service-info">
      <div className="service-title">
        <span className="service-name">Плюс</span>
        <span className="service-status">Подписка активна</span>
      </div>
      <div className="service-balance">
        <Icon name="plus-coin" size="sm" />
        <span>нет баллов</span>
      </div>
    </div>
  </Link>
  
  <Separator />
  
  <Link to="/personal?dialog=personal-data" className="service-link">
    <Icon name="user" />
    <div className="service-info">
      <span className="service-name">Личные данные</span>
      <span className="service-desc">ФИО, день рождения, пол</span>
    </div>
  </Link>
  
  <Separator />
  
  <Link to="/security/phones" className="service-link">
    <Icon name="phone" />
    <div className="service-info">
      <span className="service-name">Телефон</span>
      <span className="service-desc">+7 905 ***‒**‒81</span>
    </div>
  </Link>
</div>
```

**Сервисы:**
1. **Почта**: 1,420 непрочитанных писем
2. **Плюс**: Подписка активна, нет баллов
3. **Личные данные**: ФИО, день рождения, пол
4. **Телефон**: +7 905 ***‒**‒81

### Нижние ссылки

```tsx
<div className="bottom-links">
  <Button variant="card">
    <Icon name="theme" />
    <span>Внешний вид</span>
  </Button>
  
  <Link to="https://yandex.ru/tune" className="link-item">
    <Icon name="settings" />
    <span>Настройки</span>
  </Link>
  
  <Link to="https://yandex.ru/support/id/" className="link-item">
    <Icon name="help" />
    <span>Справка</span>
  </Link>
</div>
```

**Ссылки:**
- Внешний вид
- Настройки
- Справка

### Кнопка смены аккаунта

```tsx
<Button variant="outline" className="switch-account">
  <Icon name="switch" />
  <span>Сменить аккаунт</span>
</Button>
```

**Текст:** "Сменить аккаунт"

## Состояния

### Открыто
- Попап видим
- Оверлей затемняет фон
- Кнопка триггера имеет состояние `expanded`

### Закрыто
- Попап скрыт
- Оверлей скрыт
- Кнопка триггера в обычном состоянии

## Взаимодействие

### Открытие
- Клик на кнопку "Ваш профиль" в header

### Закрытие
- Клик на кнопку "Закрыть"
- Клик на оверлей вне попапа
- Клавиша Escape

### Переходы
- Все ссылки закрывают попап и ведут на соответствующие страницы
- Кнопка "Выбрать организацию" - открывает модалку выбора
- Кнопка "Внешний вид" - открывает модалку смены темы

## Компоненты для создания

### Loginus компоненты (использовать существующие)
- `Modal` - базовое модальное окно
- `Button` - кнопки
- `Icon` - иконки
- `Badge` - бейдж с количеством
- `Separator` - разделители

### Новые композиты
- `ProfilePopup` - полный попап профиля
- `ServiceLink` - ссылка на сервис с иконкой и описанием
- `PhoneVerificationCard` - карточка проверки актуальности номера

## TailGrids источники

### Для референса
- `dashboard/Popover/Popover*.jsx` - структура popover
- `dashboard/Profile/Profile*.jsx` - карточки профиля
- `application/Modal/Modal*.jsx` - модальные окна

## Адаптация для Loginus

```tsx
// ProfilePopup.tsx
import React from 'react';
import { Modal, Button, Icon, Badge, Separator } from '@/design-system';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    phone: string;
    login: string;
    avatar: string;
    unreadMail: number;
    plusActive: boolean;
    plusPoints: number;
  };
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ 
  isOpen, 
  onClose, 
  user 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      position="top-right"
      className="profile-popup"
    >
      {/* Header */}
      <div className="popup-header">
        <Link to="/">
          <Icon name="yandex-id" />
          <span>Яндекс ID</span>
        </Link>
        <Button variant="icon" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>
      
      {/* User Info */}
      <div className="user-info">
        <Link to="/">
          <Icon name="settings" />
          <span>Управление аккаунтом</span>
        </Link>
        <div className="user-details">
          <p>{user.name}</p>
          <p>{user.phone} • {user.login}</p>
        </div>
      </div>
      
      {/* Phone Verification Card */}
      <PhoneVerificationCard phone={user.phone} />
      
      {/* Organization Selector */}
      <Button variant="card">
        <Icon name="briefcase" />
        <span>Выбрать организацию</span>
        <Icon name="chevron-right" />
      </Button>
      
      {/* Service Links */}
      <div className="service-links">
        <ServiceLink
          icon="mail"
          name="Почта"
          status={
            <>
              <Badge count={user.unreadMail} />
              <span>непрочитанных писем</span>
            </>
          }
          href="https://mail.yandex.ru"
        />
        
        <Separator />
        
        <ServiceLink
          icon="plus"
          name="Плюс"
          status="Подписка активна"
          extra={user.plusPoints > 0 ? `${user.plusPoints} баллов` : 'нет баллов'}
          href="https://plus.yandex.ru"
        />
        
        {/* ... другие ссылки */}
      </div>
      
      {/* Bottom Links */}
      <div className="bottom-links">
        <Button variant="card">
          <Icon name="theme" />
          <span>Внешний вид</span>
        </Button>
        
        <Link to="https://yandex.ru/tune">
          <Icon name="settings" />
          <span>Настройки</span>
        </Link>
        
        <Link to="https://yandex.ru/support/id/">
          <Icon name="help" />
          <span>Справка</span>
        </Link>
      </div>
      
      {/* Switch Account */}
      <Button variant="outline">
        <Icon name="switch" />
        <span>Сменить аккаунт</span>
      </Button>
    </Modal>
  );
};
```

## Приоритет
**Высокий** - попап профиля используется на всех страницах и является ключевым элементом навигации

## Зависимости
- Modal (✅ готов)
- Button (✅ готов)
- Icon (✅ готов)
- Badge (✅ готов)
- Separator (✅ готов)
- ServiceLink (❌ нужно создать)
- PhoneVerificationCard (❌ нужно создать)

---

**Дата создания:** 2025-01-17  
**Статус:** ТЗ готово
**Сложность:** Средняя
**Оценка:** 8 часов
