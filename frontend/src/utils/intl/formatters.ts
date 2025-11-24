/**
 * Утилиты для форматирования чисел и дат с учетом текущего языка
 * Используются вместо хардкодных локалей ('ru-RU') для поддержки мультиязычности
 */

type Locale = 'ru' | 'en';

/**
 * Нормализует код валюты, преобразуя символы в ISO 4217 коды
 * @param currency - Код валюты или символ валюты
 * @returns Нормализованный код валюты ISO 4217
 */
function normalizeCurrencyCode(currency: string): string {
  // Маппинг символов валют на ISO 4217 коды
  const currencyMap: Record<string, string> = {
    '₽': 'RUB',
    '₴': 'UAH',
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    '₦': 'NGN',
    '₨': 'PKR',
    '₩': 'KRW',
    '₪': 'ILS',
    '₫': 'VND',
    '₭': 'LAK',
    '₮': 'MNT',
    '₯': 'GRD',
    '₰': 'DEM',
    '₱': 'PHP',
    '₲': 'PYG',
    '₳': 'AUD',
    '₵': 'GHS',
    '₶': 'CZK',
    '₷': 'EEK',
    '₸': 'KZT',
  };

  // Если это символ валюты, преобразуем в код
  if (currencyMap[currency]) {
    return currencyMap[currency];
  }

  // Если это уже код валюты (3 символа), возвращаем как есть
  if (currency.length === 3 && /^[A-Z]{3}$/.test(currency)) {
    return currency;
  }

  // По умолчанию возвращаем RUB для неизвестных значений
  return 'RUB';
}

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
 * @param currency - Код валюты или символ валюты (по умолчанию 'RUB')
 * @param locale - Локаль ('ru' | 'en')
 * @returns Отформатированное число с валютой
 */
export function formatCurrency(
  value: number,
  currency: string = 'RUB',
  locale: Locale = 'ru',
): string {
  const localeString = locale === 'en' ? 'en-US' : 'ru-RU';
  const normalizedCurrency = normalizeCurrencyCode(currency);
  
  try {
    return new Intl.NumberFormat(localeString, {
      style: 'currency',
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    // Fallback на форматирование числа с символом валюты, если код валюты не поддерживается
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[formatCurrency] Invalid currency code: ${currency}, normalized to: ${normalizedCurrency}`, error);
    }
    // Используем RUB как fallback
    return new Intl.NumberFormat(localeString, {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
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
 * @param namespace - Пространство имен для переводов (по умолчанию 'common')
 * @returns Отформатированное относительное время
 */
export function formatRelativeTimeWithT(
  date: string | number | Date,
  t: (key: string, defaultValue?: string, options?: any) => string,
  locale: Locale = 'ru',
  namespace?: string,
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const now = new Date();
  const diff = Math.abs(now.getTime() - dateObj.getTime());
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // Используем namespace для ключей перевода, если указан
  const getKey = (key: string) => namespace ? `${namespace}.${key}` : key;
  
  // Fallback значения для каждого языка
  const fallbacks = {
    ru: {
      justNow: 'Только что',
      minutesAgo: (count: number) => `${count} мин. назад`,
      hoursAgo: (count: number) => `${count} ч. назад`,
      yesterday: 'Вчера',
      daysAgo: (count: number) => `${count} дн. назад`,
      weeksAgo: (count: number) => `${count} нед. назад`,
      monthsAgo: (count: number) => `${count} мес. назад`,
      yearsAgo: (count: number) => `${count} г. назад`,
    },
    en: {
      justNow: 'Just Now',
      minutesAgo: (count: number) => `${count} min ago`,
      hoursAgo: (count: number) => `${count} h ago`,
      yesterday: 'Yesterday',
      daysAgo: (count: number) => `${count} days ago`,
      weeksAgo: (count: number) => `${count} weeks ago`,
      monthsAgo: (count: number) => `${count} months ago`,
      yearsAgo: (count: number) => `${count} years ago`,
    },
  };
  
  const fb = fallbacks[locale];
  
  if (minutes < 1) {
    return t(getKey('relativeTime.justNow'), fb.justNow);
  } else if (minutes < 60) {
    return t(getKey('relativeTime.minutesAgo'), fb.minutesAgo(minutes), { count: minutes });
  } else if (hours < 24) {
    return t(getKey('relativeTime.hoursAgo'), fb.hoursAgo(hours), { count: hours });
  } else if (days === 1) {
    return t(getKey('yesterday') || 'common.yesterday', fb.yesterday);
  } else if (days < 7) {
    return t(getKey('daysAgo') || 'common.daysAgo', fb.daysAgo(days), { count: days });
  } else if (weeks < 4) {
    return t(getKey('relativeTime.weeksAgo'), fb.weeksAgo(weeks), { count: weeks });
  } else if (months < 12) {
    return t(getKey('relativeTime.monthsAgo'), fb.monthsAgo(months), { count: months });
  } else {
    return t(getKey('relativeTime.yearsAgo'), fb.yearsAgo(years), { count: years });
  }
}

