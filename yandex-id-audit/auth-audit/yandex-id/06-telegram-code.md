# Яндекс ID - Экран подтверждения через Telegram

**URL:** `https://passport.yandex.ru/auth/reg`  
**Заголовок:** Авторизация  
**Скриншот:** `06-telegram-code.png`

## Структура страницы

### Header
- **Кнопка "Назад"** (слева)
- **Логотип Яндекс ID** (по центру)

### Основной контент

#### Заголовок
- **H1:** "Подтвердите кодом из сообщения в Telegram"
- **Подзаголовок:** "Отправили на +7 995 ***-**-44" (номер замаскирован)

#### Блок инструкций Telegram
```tsx
<div className="telegram-instruction-block">
  <Icon name="telegram" />
  <h4>Проверьте Telegram</h4>
  <p>Код — в чате «Verification Codes»</p>
</div>
```

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
  <Button variant="primary">
    Далее
  </Button>
  
  <Button variant="text" disabled>
    Получить новый код
    <span className="timer">Повторно код можно будет отправить через 00:00:10</span>
  </Button>
</div>
```

## Ключевые особенности

1. **Альтернативный метод** — подтверждение через Telegram вместо SMS/звонка
2. **Специальный чат** — код приходит в чат "Verification Codes" в Telegram
3. **Маскировка номера** — номер показывается частично (***-**-44)
4. **Таймер** — кнопка "Получить новый код" заблокирована на время
5. **Grid input** — 6 отдельных полей для каждой цифры

## Обработка ошибок

При неправильном коде отображается:
```tsx
<div className="error-message">
  Неправильный код, попробуйте ещё раз
</div>
```

## UX паттерны

- **Alternative Channel** — использование Telegram как альтернативного канала
- **Clear Instructions** — понятные инструкции где искать код
- **Visual Feedback** — таймер показывает время до повтора
- **Error Handling** — понятное сообщение об ошибке
- **Progressive Disclosure** — код вводится по одной цифре

