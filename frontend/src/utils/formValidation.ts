/**
 * Утилиты для валидации форм модалок
 */

/**
 * Валидация серии документа (для паспорта, загранпаспорта, ВУ)
 */
export const validateDocumentSeries = (series: string): { isValid: boolean; error?: string } => {
  if (!series || series.trim() === '') {
    return { isValid: false, error: 'Серия обязательна для заполнения' };
  }

  const cleaned = series.replace(/\s/g, '');
  
  // Серия должна быть 4 цифры
  if (!/^\d{4}$/.test(cleaned)) {
    return { isValid: false, error: 'Серия должна состоять из 4 цифр' };
  }

  return { isValid: true };
};

/**
 * Валидация номера документа
 */
export const validateDocumentNumber = (number: string, minLength: number = 6, maxLength: number = 10): { isValid: boolean; error?: string } => {
  if (!number || number.trim() === '') {
    return { isValid: false, error: 'Номер обязателен для заполнения' };
  }

  const cleaned = number.replace(/\s/g, '');
  
  if (cleaned.length < minLength || cleaned.length > maxLength) {
    return { isValid: false, error: `Номер должен содержать от ${minLength} до ${maxLength} символов` };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Номер должен содержать только цифры' };
  }

  return { isValid: true };
};

/**
 * Валидация даты
 */
export const validateDate = (date: string, options?: {
  minDate?: Date;
  maxDate?: Date;
  allowFuture?: boolean;
  allowPast?: boolean;
}): { isValid: boolean; error?: string } => {
  if (!date || date.trim() === '') {
    return { isValid: false, error: 'Дата обязательна для заполнения' };
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Некорректная дата' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (options?.allowFuture === false && dateObj > today) {
    return { isValid: false, error: 'Дата не может быть в будущем' };
  }

  if (options?.allowPast === false && dateObj < today) {
    return { isValid: false, error: 'Дата не может быть в прошлом' };
  }

  if (options?.minDate && dateObj < options.minDate) {
    return { isValid: false, error: `Дата не может быть раньше ${options.minDate.toLocaleDateString('ru-RU')}` };
  }

  if (options?.maxDate && dateObj > options.maxDate) {
    return { isValid: false, error: `Дата не может быть позже ${options.maxDate.toLocaleDateString('ru-RU')}` };
  }

  return { isValid: true };
};

/**
 * Валидация даты рождения
 */
export const validateBirthDate = (date: string): { isValid: boolean; error?: string } => {
  const result = validateDate(date, { allowFuture: false });
  if (!result.isValid) return result;

  const dateObj = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate()) 
    ? age - 1 
    : age;

  if (actualAge < 0) {
    return { isValid: false, error: 'Дата рождения не может быть в будущем' };
  }

  if (actualAge > 150) {
    return { isValid: false, error: 'Некорректная дата рождения' };
  }

  return { isValid: true };
};

/**
 * Валидация адреса
 */
export const validateAddress = (address: {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  house?: string;
  apartment?: string;
  postalCode?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!address.country || address.country.trim() === '') {
    errors.country = 'Страна обязательна для заполнения';
  }

  if (!address.city || address.city.trim() === '') {
    errors.city = 'Город обязателен для заполнения';
  }

  if (!address.street || address.street.trim() === '') {
    errors.street = 'Улица обязательна для заполнения';
  }

  if (!address.house || address.house.trim() === '') {
    errors.house = 'Дом обязателен для заполнения';
  }

  // Валидация почтового индекса (если указан)
  if (address.postalCode && address.postalCode.trim() !== '') {
    const postalCode = address.postalCode.replace(/\s/g, '');
    if (!/^\d{6}$/.test(postalCode)) {
      errors.postalCode = 'Почтовый индекс должен состоять из 6 цифр';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Валидация госномера автомобиля (российский формат)
 */
export const validateLicensePlate = (plate: string): { isValid: boolean; error?: string } => {
  if (!plate || plate.trim() === '') {
    return { isValid: false, error: 'Госномер обязателен для заполнения' };
  }

  // Удаляем пробелы и приводим к верхнему регистру
  const cleaned = plate.replace(/\s/g, '').toUpperCase();

  // Российский формат: А123БВ77 или А123БВ777
  // Буквы: А, В, Е, К, М, Н, О, Р, С, Т, У, Х (кириллица)
  const russianPlateRegex = /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/;

  if (!russianPlateRegex.test(cleaned)) {
    return { isValid: false, error: 'Некорректный формат госномера. Пример: А123БВ77' };
  }

  return { isValid: true };
};

/**
 * Валидация года выпуска автомобиля
 */
export const validateVehicleYear = (year: string): { isValid: boolean; error?: string } => {
  if (!year || year.trim() === '') {
    return { isValid: false, error: 'Год выпуска обязателен для заполнения' };
  }

  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(yearNum)) {
    return { isValid: false, error: 'Год должен быть числом' };
  }

  if (yearNum < 1900 || yearNum > currentYear + 1) {
    return { isValid: false, error: `Год должен быть от 1900 до ${currentYear + 1}` };
  }

  return { isValid: true };
};

/**
 * Валидация обязательного поля
 */
export const validateRequired = (value: string | number | null | undefined, fieldName: string = 'Поле'): { isValid: boolean; error?: string } => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} обязательно для заполнения` };
  }

  return { isValid: true };
};

/**
 * Валидация длины строки
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Поле'
): { isValid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} обязательно для заполнения` };
  }

  const length = value.trim().length;

  if (length < min) {
    return { isValid: false, error: `${fieldName} должно содержать минимум ${min} символов` };
  }

  if (length > max) {
    return { isValid: false, error: `${fieldName} должно содержать максимум ${max} символов` };
  }

  return { isValid: true };
};

/**
 * Валидация email
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email обязателен для заполнения' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Некорректный формат email' };
  }

  return { isValid: true };
};

/**
 * Валидация пароля (для удаления профиля)
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Пароль обязателен для заполнения' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' };
  }

  return { isValid: true };
};

