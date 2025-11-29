import { BasePlugin } from '../../../backend/src/core/extensions/base/base-plugin';
import { OnEvent, EmitsEvent } from '../../../backend/src/core/extensions/decorators/event.decorators';
import { EventPayload, EventContext } from '../../../backend/src/core/events/interfaces/event.interface';
import * as nodemailer from 'nodemailer';

/**
 * Email Notification Plugin
 * 
 * Автоматически отправляет email уведомления при различных событиях:
 * - Регистрация нового пользователя
 * - Успешный вход в систему
 * - Смена пароля
 * - Успешная оплата
 * - Неудачная оплата
 */
export default class EmailNotificationPlugin extends BasePlugin {
  private transporter: nodemailer.Transporter;
  private config: any;

  constructor(pluginId: string) {
    super(pluginId);
  }

  /**
   * Инициализация плагина
   * Настройка SMTP транспорта для отправки email
   */
  async onEnable(): Promise<void> {
    await super.onEnable();
    
    this.log('Email Notification Plugin starting...');
    
    // Загружаем конфигурацию из манифеста
    this.config = this.getConfig();
    
    // Создаём SMTP транспорт
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpPort === 465,
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPassword,
      },
    });

    // Проверяем подключение
    try {
      await this.transporter.verify();
      this.log('✅ SMTP connection verified');
    } catch (error: any) {
      this.error('❌ SMTP connection failed', error.stack);
      throw new Error('Failed to initialize email service');
    }

    this.log('Email Notification Plugin enabled successfully');
  }

  /**
   * Очистка при отключении плагина
   */
  async onDisable(): Promise<void> {
    await super.onDisable();
    
    if (this.transporter) {
      this.transporter.close();
      this.log('SMTP connection closed');
    }
  }

  /**
   * Обработчик события регистрации нового пользователя
   * Отправляет приветственное письмо
   */
  @OnEvent('auth.after_register', 100)
  @EmitsEvent('email-notification.sent')
  async sendWelcomeEmail(payload: EventPayload, context: EventContext): Promise<void> {
    const { userId, email, firstName, lastName } = payload;
    
    if (!this.config.templates.welcome.enabled) {
      this.log('Welcome email disabled in config');
      return;
    }

    this.log(`Sending welcome email to ${email}`);

    const html = this.generateWelcomeEmailHtml(firstName, lastName);

    try {
      await this.sendEmail({
        to: email,
        subject: this.config.templates.welcome.subject,
        html,
      });

      await this.emit('email-notification.sent', {
        type: 'welcome',
        userId,
        email,
        timestamp: new Date(),
      });

      this.log(`✅ Welcome email sent to ${email}`);
    } catch (error: any) {
      this.error(`❌ Failed to send welcome email to ${email}`, error.stack);
      await this.emit('email-notification.failed', {
        type: 'welcome',
        userId,
        email,
        error: error.message,
      });
    }
  }

  /**
   * Обработчик события входа в систему
   * Отправляет уведомление о входе (опционально)
   */
  @OnEvent('auth.after_login', 150)
  async sendLoginNotification(payload: EventPayload): Promise<void> {
    const { userId, email, ipAddress, userAgent } = payload;

    // Проверяем настройку в конфиге
    if (!this.config.templates.loginNotification?.enabled) {
      return;
    }

    this.log(`Sending login notification to ${email}`);

    const html = this.generateLoginNotificationHtml(ipAddress, userAgent);

    try {
      await this.sendEmail({
        to: email,
        subject: 'Новый вход в ваш аккаунт Loginus',
        html,
      });

      this.log(`✅ Login notification sent to ${email}`);
    } catch (error: any) {
      this.error(`❌ Failed to send login notification to ${email}`, error.stack);
    }
  }

  /**
   * Обработчик события смены пароля
   * Отправляет уведомление о смене пароля
   */
  @OnEvent('user.password_changed', 100)
  @EmitsEvent('email-notification.sent')
  async sendPasswordChangedEmail(payload: EventPayload): Promise<void> {
    const { userId, email } = payload;

    if (!this.config.templates.passwordChanged.enabled) {
      return;
    }

    this.log(`Sending password changed email to ${email}`);

    const html = this.generatePasswordChangedHtml();

    try {
      await this.sendEmail({
        to: email,
        subject: this.config.templates.passwordChanged.subject,
        html,
      });

      await this.emit('email-notification.sent', {
        type: 'password_changed',
        userId,
        email,
        timestamp: new Date(),
      });

      this.log(`✅ Password changed email sent to ${email}`);
    } catch (error: any) {
      this.error(`❌ Failed to send password changed email to ${email}`, error.stack);
    }
  }

  /**
   * Обработчик успешного платежа
   * Отправляет подтверждение оплаты
   */
  @OnEvent('payment.success', 100)
  async sendPaymentSuccessEmail(payload: EventPayload): Promise<void> {
    const { userId, email, amount, currency, orderId } = payload;

    if (!this.config.templates.paymentSuccess.enabled) {
      return;
    }

    this.log(`Sending payment success email to ${email}`);

    const html = this.generatePaymentSuccessHtml(amount, currency, orderId);

    try {
      await this.sendEmail({
        to: email,
        subject: this.config.templates.paymentSuccess.subject,
        html,
      });

      this.log(`✅ Payment success email sent to ${email}`);
    } catch (error: any) {
      this.error(`❌ Failed to send payment success email to ${email}`, error.stack);
    }
  }

  /**
   * Обработчик неудачного платежа
   * Отправляет уведомление об ошибке
   */
  @OnEvent('payment.failed', 100)
  async sendPaymentFailedEmail(payload: EventPayload): Promise<void> {
    const { userId, email, amount, currency, reason } = payload;

    if (!this.config.templates.paymentFailed?.enabled) {
      return;
    }

    this.log(`Sending payment failed email to ${email}`);

    const html = this.generatePaymentFailedHtml(amount, currency, reason);

    try {
      await this.sendEmail({
        to: email,
        subject: 'Ошибка при проведении платежа',
        html,
      });

      this.log(`✅ Payment failed email sent to ${email}`);
    } catch (error: any) {
      this.error(`❌ Failed to send payment failed email to ${email}`, error.stack);
    }
  }

  /**
   * Вспомогательный метод для отправки email
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
    });
  }

  /**
   * Генерация HTML приветственного письма
   */
  private generateWelcomeEmailHtml(firstName: string, lastName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Добро пожаловать в Loginus!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Добро пожаловать в Loginus ID!</h1>
          <p>Здравствуйте, ${firstName} ${lastName}!</p>
          <p>Спасибо за регистрацию в Loginus ID. Ваш аккаунт успешно создан и готов к использованию.</p>
          
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Что вы можете делать с Loginus ID:</h3>
            <ul>
              <li>Управлять персональными данными</li>
              <li>Безопасно хранить платёжную информацию</li>
              <li>Создать семейную группу</li>
              <li>Управлять доступом к сервисам</li>
            </ul>
          </div>

          <p>Если у вас возникнут вопросы, не стесняйтесь обращаться в нашу службу поддержки.</p>
          
          <p style="margin-top: 30px;">
            С уважением,<br>
            Команда Loginus
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML уведомления о входе
   */
  private generateLoginNotificationHtml(ipAddress?: string, userAgent?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Новый вход в ваш аккаунт</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Новый вход в ваш аккаунт</h2>
          <p>Мы зафиксировали новый вход в ваш аккаунт Loginus ID.</p>
          
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>IP-адрес:</strong> ${ipAddress || 'Неизвестен'}</p>
            <p><strong>Устройство:</strong> ${userAgent || 'Неизвестно'}</p>
            <p><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          </div>

          <p>Если это были не вы, немедленно смените пароль и свяжитесь с поддержкой.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML уведомления о смене пароля
   */
  private generatePasswordChangedHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Пароль изменён</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">Пароль успешно изменён</h2>
          <p>Ваш пароль был успешно изменён ${new Date().toLocaleString('ru-RU')}.</p>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 0;"><strong>⚠️ Внимание!</strong> Если вы не меняли пароль, немедленно свяжитесь с нами.</p>
          </div>

          <p>Для безопасности рекомендуем:</p>
          <ul>
            <li>Использовать уникальный пароль</li>
            <li>Включить двухфакторную аутентификацию</li>
            <li>Не передавать пароль третьим лицам</li>
          </ul>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML подтверждения оплаты
   */
  private generatePaymentSuccessHtml(amount: number, currency: string, orderId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Платёж успешно выполнен</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10B981;">✅ Платёж успешно выполнен</h2>
          <p>Ваш платёж был успешно обработан.</p>
          
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Сумма:</strong> ${amount} ${currency}</p>
            <p><strong>Номер заказа:</strong> ${orderId}</p>
            <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          </div>

          <p>Спасибо за использование наших услуг!</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Генерация HTML уведомления об ошибке платежа
   */
  private generatePaymentFailedHtml(amount: number, currency: string, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ошибка при проведении платежа</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #EF4444;">❌ Ошибка при проведении платежа</h2>
          <p>К сожалению, не удалось провести ваш платёж.</p>
          
          <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p><strong>Сумма:</strong> ${amount} ${currency}</p>
            <p><strong>Причина:</strong> ${reason}</p>
            <p><strong>Дата попытки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
          </div>

          <p>Пожалуйста, проверьте данные вашей карты и попробуйте снова.</p>
          <p>Если проблема сохраняется, обратитесь в службу поддержки.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Удаление HTML тегов для текстовой версии письма
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Получение конфигурации плагина
   */
  private getConfig(): any {
    // В реальном плагине конфигурация будет загружаться из базы данных
    // Здесь используем значения по умолчанию из манифеста
    return {
      smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || 'noreply@loginus.ru',
      smtpPassword: process.env.SMTP_PASSWORD || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@loginus.ru',
      fromName: process.env.FROM_NAME || 'Loginus ID',
      templates: {
        welcome: { enabled: true, subject: 'Добро пожаловать в Loginus!' },
        passwordChanged: { enabled: true, subject: 'Пароль изменён' },
        paymentSuccess: { enabled: true, subject: 'Платёж успешно выполнен' },
        loginNotification: { enabled: false, subject: 'Новый вход в ваш аккаунт' },
        paymentFailed: { enabled: true, subject: 'Ошибка при проведении платежа' },
      },
    };
  }
}

