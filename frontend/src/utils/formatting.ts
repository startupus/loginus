/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирует номер телефона в читаемый вид
 * +79057308181 -> +7 905 730-81-81
 * Принимает нормализованный номер (с +7)
 */
export function formatPhone(value: string): string {
  // Убираем все кроме цифр и +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+7') && cleaned.length === 12) {
    // +7 905 730-81-81
    const code = cleaned.slice(2, 5);
    const part1 = cleaned.slice(5, 8);
    const part2 = cleaned.slice(8, 10);
    const part3 = cleaned.slice(10, 12);
    return `+7 ${code} ${part1}-${part2}-${part3}`;
  }
  
  // Если номер неполный, возвращаем как есть
  return value;
}

/**
 * Форматирует код подтверждения (добавляет пробелы для читаемости)
 */
export function formatCode(value: string): string {
  // Удаляем все кроме цифр
  const digits = value.replace(/\D/g, '');
  
  // Группируем по 3 цифры
  return digits.match(/.{1,3}/g)?.join(' ') || digits;
}

