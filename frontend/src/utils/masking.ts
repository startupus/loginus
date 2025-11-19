/**
 * Утилиты для маскирования контактов
 */

/**
 * Маскирует номер телефона
 * +7 905 730-81-81 -> +7 905 ***-**-81
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+7') && cleaned.length === 12) {
    const code = cleaned.slice(2, 5);
    const lastTwo = cleaned.slice(10, 12);
    return `+7 ${code} ***-**-${lastTwo}`;
  }
  
  // Если не удалось распарсить, маскируем последние 4 цифры
  if (cleaned.length >= 4) {
    const visible = cleaned.slice(0, -4);
    const masked = '***-' + cleaned.slice(-2);
    return visible + masked;
  }
  
  return value;
}

/**
 * Маскирует email
 * dmitriy-ldm@ya.ru -> d***@ya.ru
 */
export function maskEmail(value: string): string {
  const [local, domain] = value.split('@');
  
  if (!local || !domain) {
    return value;
  }
  
  if (local.length <= 1) {
    return `${local[0]}***@${domain}`;
  }
  
  return `${local[0]}***@${domain}`;
}

/**
 * Получает последние N цифр номера
 */
export function getLastDigits(value: string, count: number = 4): string {
  const digits = value.replace(/\D/g, '');
  return digits.slice(-count);
}

