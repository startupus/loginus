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

/**
 * Генерирует хеш из строки для детерминированного выбора цвета
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Красивые градиенты для аватаров
 * Каждый градиент - это массив из двух цветов для линейного градиента
 */
const avatarGradients = [
  // Синие градиенты
  ['#3B82F6', '#8B5CF6'], // Синий -> Фиолетовый
  ['#2563EB', '#6366F1'], // Темно-синий -> Индиго
  ['#1E40AF', '#4F46E5'], // Синий -> Индиго
  
  // Фиолетовые градиенты
  ['#8B5CF6', '#EC4899'], // Фиолетовый -> Розовый
  ['#7C3AED', '#A855F7'], // Фиолетовый -> Светло-фиолетовый
  ['#6366F1', '#8B5CF6'], // Индиго -> Фиолетовый
  
  // Розовые градиенты
  ['#EC4899', '#F43F5E'], // Розовый -> Красный
  ['#DB2777', '#EC4899'], // Розовый -> Светло-розовый
  ['#BE185D', '#EC4899'], // Темно-розовый -> Розовый
  
  // Оранжевые градиенты
  ['#F59E0B', '#EF4444'], // Оранжевый -> Красный
  ['#F97316', '#F59E0B'], // Оранжевый -> Желтый
  ['#EA580C', '#F97316'], // Темно-оранжевый -> Оранжевый
  
  // Зеленые градиенты
  ['#10B981', '#3B82F6'], // Зеленый -> Синий
  ['#059669', '#10B981'], // Темно-зеленый -> Зеленый
  ['#047857', '#10B981'], // Зеленый -> Светло-зеленый
  
  // Красные градиенты
  ['#EF4444', '#F97316'], // Красный -> Оранжевый
  ['#DC2626', '#EF4444'], // Темно-красный -> Красный
  ['#B91C1C', '#EF4444'], // Красный -> Светло-красный
  
  // Голубые градиенты
  ['#06B6D4', '#3B82F6'], // Голубой -> Синий
  ['#0891B2', '#06B6D4'], // Темно-голубой -> Голубой
  ['#0E7490', '#06B6D4'], // Голубой -> Светло-голубой
  
  // Желтые градиенты
  ['#EAB308', '#F59E0B'], // Желтый -> Оранжевый
  ['#CA8A04', '#EAB308'], // Темно-желтый -> Желтый
  
  // Специальные комбинации
  ['#6366F1', '#EC4899'], // Индиго -> Розовый
  ['#8B5CF6', '#F59E0B'], // Фиолетовый -> Оранжевый
  ['#10B981', '#F59E0B'], // Зеленый -> Оранжевый
  ['#3B82F6', '#EC4899'], // Синий -> Розовый
];

/**
 * Генерирует градиентный фон для аватара на основе имени пользователя
 * Один и тот же пользователь всегда получает один и тот же градиент
 * 
 * @param name - имя пользователя (или любая строка для генерации цвета)
 * @returns объект со стилями для применения градиента
 * 
 * @example
 * const gradientStyle = getAvatarGradient('Дмитрий Лукьян');
 * <div style={gradientStyle}>...</div>
 */
export const getAvatarGradient = (name: string): React.CSSProperties => {
  if (!name || name.trim() === '') {
    // Fallback градиент для пустого имени
    return {
      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    };
  }
  
  // Генерируем индекс градиента на основе хеша имени
  const hash = hashString(name.trim());
  const gradientIndex = hash % avatarGradients.length;
  const [color1, color2] = avatarGradients[gradientIndex];
  
  // Возвращаем стили с градиентом
  return {
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
  };
};

/**
 * Генерирует градиентный фон для аватара и возвращает CSS классы (альтернативный вариант)
 * Используется когда нужны Tailwind классы вместо inline стилей
 * 
 * @param name - имя пользователя
 * @returns строка с CSS классами для градиента (если нужно использовать классы)
 */
export const getAvatarGradientClass = (_name: string): string => {
  // Для градиентов лучше использовать inline стили через getAvatarGradient
  // Эта функция оставлена для совместимости, но возвращает базовый класс
  return 'bg-primary';
};

