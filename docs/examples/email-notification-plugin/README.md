# Email Notification Plugin

Плагин для автоматической отправки email уведомлений при различных событиях в системе Loginus.

## Возможности

- ✉️ Приветственное письмо при регистрации
- 🔐 Уведомление о смене пароля
- 💳 Подтверждение успешного платежа
- ❌ Уведомление об ошибке платежа
- 🔔 Опциональное уведомление о входе в систему

## Установка

### 1. Сборка плагина

```bash
# Компиляция TypeScript
tsc plugin.ts --target ES2020 --module commonjs --esModuleInterop

# Создание архива
zip -r email-notification-plugin.zip manifest.json plugin.js package.json README.md
```

### 2. Загрузка через админку

1. Откройте админ-панель Loginus
2. Перейдите в `/admin/extensions/plugins/upload`
3. Загрузите файл `email-notification-plugin.zip`
4. Включите плагин

## Конфигурация

### Переменные окружения

Создайте файл `.env` или настройте переменные окружения:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@loginus.ru
FROM_NAME=Loginus ID
```

### Настройка для Gmail

1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения: https://myaccount.google.com/apppasswords
3. Используйте пароль приложения в `SMTP_PASSWORD`

### Настройка для других провайдеров

**Yandex:**
```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
```

**Mail.ru:**
```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## Использование

После установки и включения плагин автоматически будет отправлять письма при следующих событиях:

### 1. Регистрация пользователя

**Событие:** `auth.after_register`  
**Приоритет:** 100  
**Шаблон:** welcome

Отправляется сразу после успешной регистрации нового пользователя.

### 2. Смена пароля

**Событие:** `user.password_changed`  
**Приоритет:** 100  
**Шаблон:** passwordChanged

Отправляется когда пользователь меняет свой пароль.

### 3. Успешный платёж

**Событие:** `payment.success`  
**Приоритет:** 100  
**Шаблон:** paymentSuccess

Отправляется после успешного проведения платежа.

### 4. Ошибка платежа

**Событие:** `payment.failed`  
**Приоритет:** 100  
**Шаблон:** paymentFailed

Отправляется когда платёж не удалось провести.

## Кастомизация шаблонов

Шаблоны писем можно кастомизировать, изменив методы генерации HTML в файле `plugin.ts`:

```typescript
private generateWelcomeEmailHtml(firstName: string, lastName: string): string {
  // Ваш кастомный HTML
}
```

### Использование внешних шаблонов

Вы можете использовать внешние сервисы шаблонов, например:

- **Handlebars** - для локальных шаблонов
- **SendGrid Templates** - для динамических шаблонов
- **Mailchimp** - для маркетинговых писем

## Мониторинг

Плагин логирует все действия:

```typescript
// Успешная отправка
this.log(`✅ Welcome email sent to ${email}`);

// Ошибка отправки
this.error(`❌ Failed to send email to ${email}`, error.stack);
```

Логи можно просмотреть:

```bash
docker logs loginus-backend-new | grep "EmailNotificationPlugin"
```

### Просмотр статистики отправок

```sql
-- Все отправленные письма
SELECT * FROM event_logs 
WHERE "eventName" = 'email-notification.sent' 
ORDER BY "createdAt" DESC;

-- Ошибки отправки
SELECT * FROM event_logs 
WHERE "eventName" = 'email-notification.failed' 
ORDER BY "createdAt" DESC;

-- Статистика по типам писем
SELECT 
  payload->>'type' as email_type, 
  COUNT(*) as count 
FROM event_logs 
WHERE "eventName" = 'email-notification.sent' 
GROUP BY email_type;
```

## Расширение функциональности

### Добавление нового типа уведомления

1. Добавьте событие в `manifest.json`:

```json
{
  "events": {
    "subscribes": [
      "user.profile_updated"
    ]
  }
}
```

2. Добавьте обработчик в `plugin.ts`:

```typescript
@OnEvent('user.profile_updated', 100)
async sendProfileUpdatedEmail(payload: EventPayload): Promise<void> {
  const { userId, email, fields } = payload;
  
  const html = this.generateProfileUpdatedHtml(fields);
  
  await this.sendEmail({
    to: email,
    subject: 'Профиль обновлён',
    html,
  });
}
```

3. Создайте метод генерации HTML:

```typescript
private generateProfileUpdatedHtml(fields: string[]): string {
  return `
    <h2>Профиль обновлён</h2>
    <p>Обновлённые поля: ${fields.join(', ')}</p>
  `;
}
```

## Тестирование

### Ручное тестирование

```typescript
// В консоли разработчика backend
const plugin = await pluginLoader.getPlugin('email-notification-plugin');
await plugin.sendWelcomeEmail({
  userId: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
}, eventContext);
```

### Unit-тесты

```typescript
describe('EmailNotificationPlugin', () => {
  let plugin: EmailNotificationPlugin;

  beforeEach(() => {
    plugin = new EmailNotificationPlugin('test-plugin-id');
  });

  it('should send welcome email', async () => {
    const payload = {
      userId: '123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    await plugin.sendWelcomeEmail(payload, mockContext);
    
    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Письма не отправляются

1. Проверьте логи:
   ```bash
   docker logs loginus-backend-new | grep "Email"
   ```

2. Проверьте SMTP соединение:
   ```bash
   telnet smtp.gmail.com 587
   ```

3. Убедитесь что firewall разрешает исходящие SMTP подключения

### Письма попадают в спам

1. Настройте SPF запись для вашего домена
2. Настройте DKIM подпись
3. Используйте проверенный SMTP сервис (SendGrid, Amazon SES)
4. Избегайте спам-слов в темах писем

### Ошибка аутентификации

1. Проверьте логин и пароль
2. Для Gmail используйте пароль приложения
3. Убедитесь что "Доступ ненадежных приложений" включён (если требуется)

## Лицензия

MIT

## Поддержка

- GitHub: https://github.com/loginus/plugins
- Email: support@loginus.ru
- Документация: https://docs.loginus.ru/plugins/email-notification

---

**Версия:** 1.0.0  
**Автор:** Loginus Team  
**Дата:** 29 ноября 2025

