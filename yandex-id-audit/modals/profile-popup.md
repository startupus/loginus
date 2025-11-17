# ТЗ: Попап профиля (Profile Popup)

## Триггер
Кнопка "Ваш профиль" в header (правый верхний угол)

## Описание
Выпадающий попап с быстрым доступом к ключевым функциям и настройкам аккаунта. Открывается как модальное окно в iframe для изоляции контента.

## Структура попапа

### Header попапа
```jsx
<div className="popup-header">
  <Link to="/">
    <img src="logo.svg" alt="Яндекс ID" />
    <span>Яндекс ID</span>
  </Link>
  <Button onClick={closePopup} variant="ghost" size="sm">
    <Icon name="close" />
  </Button>
</div>
```

### Основная информация
```jsx
<div className="profile-info">
  <Link to="/">Управление аккаунтом</Link>
  <h3>{user.name}</h3>
  <p>{user.phone} • {user.email}</p>
</div>
```

### Промо-блок дня рождения
```jsx
<Button 
  variant="promo" 
  onClick={openBirthdayModal}
  className="birthday-promo"
>
  <div className="content">
    <h4>Добавьте день рождения</h4>
    <p>Подготовим для вас сюрпризы</p>
  </div>
  <Button size="sm" variant="primary">Добавить</Button>
  <img src="gift-icon.svg" alt="" />
</Button>
```

### Быстрые ссылки
```jsx
<nav className="quick-links">
  <Link to="/mail" className="quick-link">
    <Icon name="mail" />
    <div>
      <span>Почта</span>
      <Badge count={48}>непрочитанных писем</Badge>
    </div>
  </Link>
  
  <Link to="/plus" className="quick-link">
    <Icon name="star" />
    <div>
      <span>Подключить Плюс</span>
      <p>Все развлечения и выгода в одной подписке</p>
    </div>
  </Link>
  
  <Link to="/personal?dialog=personal-data" className="quick-link">
    <Icon name="user" />
    <div>
      <span>Личные данные</span>
      <p>ФИО, день рождения, пол</p>
    </div>
  </Link>
  
  <Link to="/security/phones" className="quick-link">
    <Icon name="phone" />
    <div>
      <span>Телефон</span>
      <p>{user.phone}</p>
    </div>
  </Link>
</nav>
```

### Настройки
```jsx
<div className="settings-links">
  <Button onClick={openAppearance} variant="ghost">
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
```

### Смена аккаунта
```jsx
<Button variant="ghost" onClick={switchAccount} className="switch-account">
  <Icon name="switch" />
  <span>Сменить аккаунт</span>
</Button>
```

## План модернизации для Loginus

### Реализация через Modal компонент
```tsx
import { Modal } from '@/design-system/composites';
import { Avatar, Badge, Button, Icon } from '@/design-system';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dropdown"
      anchor="header-right"
      className="profile-popup"
    >
      <Modal.Header>
        <Link to="/" onClick={onClose}>
          <Icon name="logo" />
          <span>{t('app.name')}</span>
        </Link>
        <Button onClick={onClose} variant="ghost" size="sm">
          <Icon name="close" />
        </Button>
      </Modal.Header>
      
      <Modal.Body>
        <ProfileInfo user={user} />
        <BirthdayPromo onAdd={openBirthdayModal} />
        <QuickLinks user={user} />
        <SettingsLinks />
        <SwitchAccountButton />
      </Modal.Body>
    </Modal>
  );
};
```

### Особенности реализации
- Использовать Modal компонент из design-system
- Поддержка темной темы
- i18n для всех текстов
- Keyboard navigation (ESC для закрытия)
- Focus trap внутри модального окна

---

**Дата создания:** 2025-01-17  
**Статус:** Готово к реализации

