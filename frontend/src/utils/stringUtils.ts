/**
 * String utilities для Loginus ID
 */

/**
 * Получить инициалы из имени
 * @param name - полное имя пользователя
 * @returns инициалы (максимум 2 символа) или пустая строка
 */
export const getInitials = (name?: string): string => {
  if (!name || name.trim() === '') return '';
  
  // Разбиваем имя на части и фильтруем пустые элементы
  const parts = name
    .trim()
    .split(/\s+/) // Разбиваем по любому количеству пробелов
    .filter(part => part.length > 0); // Убираем пустые элементы
  
  if (parts.length === 0) return '';
  
  // Берем первые буквы каждой части, максимум 2
  const initials = parts
    .map(p => p[0])
    .filter(char => char && /[a-zA-Zа-яА-ЯёЁ]/.test(char)) // Только буквы
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return initials;
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

