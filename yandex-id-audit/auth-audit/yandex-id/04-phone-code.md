# Яндекс ID - Экран ввода кода подтверждения (звонок)

**URL:** `https://passport.yandex.ru/auth/reg/portal`  
**Заголовок:** Авторизация  
**Скриншот:** `04-phone-code.png`

## Структура страницы

### Header
- **Кнопка "Назад"** (слева)
- **Логотип Яндекс ID** (по центру)

### Основной контент

#### Заголовок
- **H1:** "Введите последние 6 цифр входящего номера"
- **Подзаголовок:** "Звоним на +7 912 345-67-89 — отвечать не нужно"

#### Поле ввода кода
```tsx
<div className="code-input-section">
  <label>Введите код</label>
  <div className="code-input-grid">
    <input type="text" maxLength="1" />
    <input type="text" maxLength="1" />
    <input type="text" maxLength="1" />
    <input type="text" maxLength="1" />
    <input type="text" maxLength="1" />
    <input type="text" maxLength="1" />
  </div>
</div>
```

#### Кнопки действий
```tsx
<div className="action-buttons">
  <Button variant="primary" disabled>
    Продолжить
  </Button>
  
  <Button variant="text" disabled>
    Звонка не было
    <span className="timer">Повторно код можно будет отправить через 00:01:00</span>
  </Button>
</div>
```

## Ключевые особенности

1. **Автоматический звонок** — система звонит на номер, пользователь не отвечает
2. **6 цифр** — нужно ввести последние 6 цифр входящего номера
3. **Таймер** — кнопка "Звонка не было" заблокирована на 1 минуту
4. **Grid input** — 6 отдельных полей для каждой цифры
5. **Auto-focus** — первое поле автоматически получает фокус

## UX паттерны

- **Progressive Disclosure** — код вводится по одной цифре
- **Visual Feedback** — таймер показывает время до повтора
- **Error Prevention** — кнопка "Продолжить" активна только после ввода всех 6 цифр
- **Alternative Path** — возможность запросить повторный звонок

