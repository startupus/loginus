/**
 * Утилиты для форматирования чисел и дат с учетом текущего языка
 * Используются вместо хардкодных локалей ('ru-RU') для поддержки мультиязычности
 */

type Locale = 'ru' | 'en';

/**
 * Форматирует число с учетом текущего языка
 * @param value - Число для форматирования
 * @param locale - Локаль ('ru' | 'en')
 * @returns Отформатированное число как строка
 */
export function formatNumber(value: number, locale: Locale = 'ru'): string {
  const localeString = locale === 'en' ? 'en-US' : 'ru-RU';
  return value.toLocaleString(localeString);
}

/**
 * Форматирует число с валютой
 * @param value - Число для форматирования
 * @param currency - Код валюты (по умолчанию 'RUB')
 * @param locale - Локаль ('ru' | 'en')
 * @returns Отформатированное число с валютой
 */
export function formatCurrency(
  value: number,
  currency: string = 'RUB',
  locale: Locale = 'ru',
): string {
  const localeString = locale === 'en' ? 'en-US' : 'ru-RU';
  return new Intl.NumberFormat(localeString, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Форматирует дату с учетом текущего языка
 * @param date - Дата (строка, число или объект Date)
 * @param locale - Локаль ('ru' | 'en')
 * @param options - Опции форматирования Intl.DateTimeFormat
 * @returns Отформатированная дата
 */
export function formatDate(
  date: string | number | Date,
  locale: Locale = 'ru',
  options?: Intl.DateTimeFormatOptions,
): string {
  const localeString = locale === 'en' ? 'en-US' : 'ru-RU';
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  };
  
  return dateObj.toLocaleDateString(localeString, options || defaultOptions);
}

/**
 * Форматирует относительное время (сегодня, вчера, N дней назад)
 * ВАЖНО: Эта функция требует передачи функции перевода t() из useTranslation,
 * так как использует ключи i18n. Используйте formatRelativeTimeWithT вместо этого.
 * @deprecated Используйте formatRelativeTimeWithT
 */
export function formatRelativeTime(
  date: string | number | Date,
  locale: Locale = 'ru',
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Fallback на форматирование даты, если нет доступа к переводам
  if (days < 7) {
    return formatDate(dateObj, locale, { day: 'numeric', month: 'short' });
  } else {
    return formatDate(dateObj, locale);
  }
}

/**
 * Форматирует относительное время с использованием переводов i18n
 * @param date - Дата
 * @param t - Функция перевода из useTranslation()
 * @param locale - Локаль ('ru' | 'en')
 * @returns Отформатированное относительное время
 */
export function formatRelativeTimeWithT(
  date: string | number | Date,
  t: (key: string, defaultValue?: string, options?: any) => string,
  locale: Locale = 'ru',
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return t('common.today', 'Сегодня');
  } else if (days === 1) {
    return t('common.yesterday', 'Вчера');
  } else if (days < 7) {
    return t('common.daysAgo', `${days} дн. назад`, { count: days });
  } else {
    return formatDate(dateObj, locale, { day: 'numeric', month: 'short' });
  }
}

