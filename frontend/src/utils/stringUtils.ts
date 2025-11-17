/**
 * String utilities для Loginus ID
 */

/**
 * Получить инициалы из имени
 */
export const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Форматировать телефон (российский формат)
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned[0] === '7') {
    return `+7 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
};

/**
 * Обрезать текст с многоточием
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Capitalize первую букву
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

