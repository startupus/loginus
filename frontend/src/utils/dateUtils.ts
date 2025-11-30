/**
 * Форматирование относительного времени ("5 минут назад")
 */
export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean; locale?: any }): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const locale = options?.locale?.code || 'en';
  const isRussian = locale === 'ru';

  let result = '';

  if (diffYear > 0) {
    result = isRussian 
      ? `${diffYear} ${pluralize(diffYear, 'год', 'года', 'лет')}`
      : `${diffYear} ${pluralize(diffYear, 'year', 'years', 'years')}`;
  } else if (diffMonth > 0) {
    result = isRussian
      ? `${diffMonth} ${pluralize(diffMonth, 'месяц', 'месяца', 'месяцев')}`
      : `${diffMonth} ${pluralize(diffMonth, 'month', 'months', 'months')}`;
  } else if (diffDay > 0) {
    result = isRussian
      ? `${diffDay} ${pluralize(diffDay, 'день', 'дня', 'дней')}`
      : `${diffDay} ${pluralize(diffDay, 'day', 'days', 'days')}`;
  } else if (diffHour > 0) {
    result = isRussian
      ? `${diffHour} ${pluralize(diffHour, 'час', 'часа', 'часов')}`
      : `${diffHour} ${pluralize(diffHour, 'hour', 'hours', 'hours')}`;
  } else if (diffMin > 0) {
    result = isRussian
      ? `${diffMin} ${pluralize(diffMin, 'минуту', 'минуты', 'минут')}`
      : `${diffMin} ${pluralize(diffMin, 'minute', 'minutes', 'minutes')}`;
  } else {
    result = isRussian ? 'только что' : 'just now';
  }

  if (options?.addSuffix && result !== 'только что' && result !== 'just now') {
    result = isRussian ? `${result} назад` : `${result} ago`;
  }

  return result;
}

/**
 * Pluralize helper (русский/английский)
 */
function pluralize(count: number, one: string, few: string, many: string): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return one;
  } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
    return few;
  } else {
    return many;
  }
}

/**
 * Locale stubs for compatibility
 */
export const ru = { code: 'ru' };
export const enUS = { code: 'en' };

