# Яндекс ID - Экран ввода имени и фамилии

**URL:** `https://passport.yandex.ru/auth/reg`  
**Заголовок:** Авторизация  
**Скриншот:** `07-name-surname.png`

## Структура страницы

### Header
- **Кнопка "Назад"** (слева)
- **Логотип Яндекс ID** (по центру)

### Основной контент

#### Заголовок
- **H1:** "Введите имя и фамилию"
- **Подзаголовок:** "Те, что указали при регистрации"

#### Форма ввода
```tsx
<div className="name-input-section">
  <div className="input-field">
    <label>Имя</label>
    <input 
      type="text"
      value="Дмитрий"
      placeholder="Имя"
    />
  </div>
  
  <div className="input-field">
    <label>Фамилия</label>
    <input 
      type="text"
      value="Лукьян"
      placeholder="Фамилия"
      autoFocus
    />
  </div>
</div>
```

#### Кнопки действий
```tsx
<div className="action-buttons">
  <Button variant="primary">
    Далее
  </Button>
  
  <Link href="/support/id/new-phone-authorization.html">
    Не помню
  </Link>
</div>
```

## Ключевые особенности

1. **Восстановление доступа** — используется для подтверждения личности
2. **Предзаполнение** — поля могут быть предзаполнены данными из системы
3. **Альтернативный путь** — ссылка "Не помню" для тех, кто забыл данные
4. **Минималистичный дизайн** — только необходимые поля

## UX паттерны

- **Progressive Disclosure** — сбор данных пошагово
- **Error Recovery** — альтернативный путь через "Не помню"
- **Auto-fill** — предзаполнение для удобства
- **Clear Instructions** — понятное объяснение что нужно ввести

