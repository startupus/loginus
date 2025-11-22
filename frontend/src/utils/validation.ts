/**
 * Утилиты для валидации ввода
 * Поддержка универсального ввода (телефон/email)
 */

/**
 * Определяет тип ввода: телефон или email
 */
export function detectInputType(value: string): 'phone' | 'email' | null {
  if (!value || value.trim().length === 0) {
    return null;
  }
  
  // Удаляем все пробелы, дефисы, скобки
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  
  // Проверка на email (приоритет, если есть @)
  if (value.includes('@')) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'email';
    }
    return 'email'; // Если есть @, считаем email даже если невалидный
  }
  
  // Проверка на наличие букв (латиница или кириллица) - если есть буквы и нет @, это не телефон
  if (/[a-zA-Zа-яА-ЯёЁ]/.test(value)) {
    return null; // Если есть буквы, это не телефон (и не email, так как нет @)
  }
  
  // Проверка на телефон (начинается с + или цифры, содержит только цифры и +)
  if (/^\+?\d+$/.test(cleaned)) {
    // Если начинается с +7 или 7 или 8, или просто цифры - это телефон
    if (cleaned.startsWith('+7') || cleaned.startsWith('7') || cleaned.startsWith('8') || /^\d+$/.test(cleaned)) {
      return 'phone';
    }
  }
  
  return null;
}

/**
 * Нормализует номер телефона (удаляет все кроме цифр и +)
 */
export function normalizePhone(value: string): string {
  // Удаляем все кроме цифр и +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Если начинается с 8, заменяем на +7
  if (cleaned.startsWith('8')) {
    return '+7' + cleaned.slice(1);
  }
  
  // Если начинается с 7, добавляем +
  if (cleaned.startsWith('7') && !cleaned.startsWith('+7')) {
    return '+' + cleaned;
  }
  
  // Если не начинается с +, добавляем +7
  if (!cleaned.startsWith('+')) {
    return '+7' + cleaned;
  }
  
  return cleaned;
}

/**
 * Проверяет валидность номера телефона
 */
export function isValidPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  // Российский номер: +7 и 10 цифр после
  return /^\+7\d{10}$/.test(normalized);
}

/**
 * Проверяет валидность email
 */
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

/**
 * Валидирует универсальный ввод (телефон или email)
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: string;
  type?: 'phone' | 'email';
}

export function validateInput(value: string): ValidationResult {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Введите телефон или email'
    };
  }
  
  const type = detectInputType(trimmed);
  
  if (!type) {
    return {
      isValid: false,
      error: 'Введите корректный телефон или email'
    };
  }
  
  if (type === 'phone') {
    const normalized = normalizePhone(trimmed);
    if (!isValidPhone(normalized)) {
      return {
        isValid: false,
        error: 'Некорректный номер телефона'
      };
    }
    return {
      isValid: true,
      normalizedValue: normalized,
      type: 'phone'
    };
  }
  
  if (type === 'email') {
    if (!isValidEmail(trimmed)) {
      return {
        isValid: false,
        error: 'Некорректный email'
      };
    }
    return {
      isValid: true,
      normalizedValue: trimmed.toLowerCase().trim(),
      type: 'email'
    };
  }
  
  return {
    isValid: false,
    error: 'Введите корректный телефон или email'
  };
}

