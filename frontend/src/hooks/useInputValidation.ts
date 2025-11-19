import { useState, useEffect } from 'react';
import { validateInput, ValidationResult, normalizePhone, isValidPhone, isValidEmail } from '../utils/validation';

export interface UseInputValidationOptions {
  /**
   * Тип ввода: 'phone', 'email' или 'universal' (автоопределение)
   */
  type?: 'phone' | 'email' | 'universal';
  
  /**
   * Валидация в реальном времени
   */
  validateOnChange?: boolean;
  
  /**
   * Валидация при потере фокуса
   */
  validateOnBlur?: boolean;
}

export interface UseInputValidationReturn {
  /**
   * Валидно ли значение
   */
  isValid: boolean;
  
  /**
   * Сообщение об ошибке
   */
  error: string | null;
  
  /**
   * Нормализованное значение
   */
  normalizedValue: string | null;
  
  /**
   * Тип ввода (определен автоматически)
   */
  type: 'phone' | 'email' | null;
  
  /**
   * Функция для ручной валидации
   */
  validate: () => ValidationResult;
}

/**
 * Хук для валидации универсального ввода (телефон/email)
 */
export function useInputValidation(
  value: string,
  options: UseInputValidationOptions = {}
): UseInputValidationReturn {
  const {
    type: inputType = 'universal',
    validateOnChange = true,
    // validateOnBlur = true, // TODO: реализовать валидацию при blur
  } = options;

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
  });

  const validate = (): ValidationResult => {
    if (inputType === 'universal') {
      return validateInput(value);
    }

    // Для конкретного типа используем соответствующую валидацию
    if (inputType === 'phone') {
      const normalized = normalizePhone(value);
      const isValid = isValidPhone(normalized);
      
      return {
        isValid,
        error: isValid ? undefined : 'Некорректный номер телефона',
        normalizedValue: isValid ? normalized : undefined,
        type: 'phone',
      };
    }

    if (inputType === 'email') {
      const trimmed = value.trim();
      const isValid = isValidEmail(trimmed);
      
      return {
        isValid,
        error: isValid ? undefined : 'Некорректный email',
        normalizedValue: isValid ? trimmed.toLowerCase() : undefined,
        type: 'email',
      };
    }

    return { isValid: false };
  };

  useEffect(() => {
    if (validateOnChange && value) {
      const result = validate();
      setValidationResult(result);
    } else if (!value) {
      setValidationResult({ isValid: false });
    }
  }, [value, validateOnChange]);

  return {
    isValid: validationResult.isValid ?? false,
    error: validationResult.error ?? null,
    normalizedValue: validationResult.normalizedValue ?? null,
    type: validationResult.type ?? null,
    validate,
  };
}

