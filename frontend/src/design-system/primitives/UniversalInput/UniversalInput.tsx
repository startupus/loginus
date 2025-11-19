import React, { useState, useMemo } from 'react';
import { Input } from '../Input';
import { detectInputType, normalizePhone } from '../../../utils/validation';
import { formatPhone } from '../../../utils/formatting';

export interface UniversalInputProps {
  /**
   * Значение поля (нормализованное, без форматирования)
   */
  value: string;
  
  /**
   * Callback при изменении значения (возвращает нормализованное значение)
   */
  onChange: (value: string) => void;
  
  /**
   * Callback при потере фокуса
   */
  onBlur?: () => void;
  
  /**
   * Callback при нажатии клавиши
   */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /**
   * Placeholder
   */
  placeholder?: string;
  
  /**
   * Сообщение об ошибке
   */
  error?: string;
  
  /**
   * Автофокус
   */
  autoFocus?: boolean;
  
  /**
   * Отключено
   */
  disabled?: boolean;
  
  /**
   * Label
   */
  label?: string;
}

/**
 * UniversalInput - универсальное поле ввода для телефона или email
 * Автоматически определяет тип ввода и применяет соответствующее форматирование
 */
export const UniversalInput: React.FC<UniversalInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = 'Телефон или email',
  error,
  autoFocus = false,
  disabled = false,
  label,
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  // Определяем тип ввода на основе текущего значения
  const inputType = useMemo(() => {
    if (!value || value.trim().length === 0) {
      return null;
    }
    return detectInputType(value);
  }, [value]);
  
  const isPhone = inputType === 'phone';

  // Нормализуем значение для хранения
  const normalizedValue = useMemo(() => {
    if (isPhone && value) {
      return normalizePhone(value);
    }
    return value;
  }, [value, isPhone]);

  // Форматируем значение для отображения
  // Во время ввода показываем нормализованное БЕЗ +7 (так как +7 в leftIcon), при blur - отформатированное
  const displayValue = useMemo(() => {
    if (isPhone && normalizedValue) {
      // Если только +7 без цифр, не показываем (показываем placeholder)
      if (normalizedValue === '+7' || normalizedValue.length <= 2) {
        return '';
      }
      
      // Убираем +7 из начала, так как он отображается в leftIcon
      const withoutPrefix = normalizedValue.startsWith('+7') 
        ? normalizedValue.slice(2) 
        : normalizedValue;
      
      if (focused) {
        // Во время ввода показываем только цифры (без +7)
        return withoutPrefix;
      } else {
        // При blur форматируем (XXX XXX-XX-XX)
        if (normalizedValue.startsWith('+7') && normalizedValue.length === 12) {
          const formatted = formatPhone(normalizedValue);
          // Убираем +7 из начала отформатированного номера
          return formatted.replace(/^\+7\s/, '');
        }
        return withoutPrefix;
      }
    }
    return value || '';
  }, [normalizedValue, value, isPhone, focused]);

  // Определяем, есть ли введенные цифры (для телефона)
  const hasPhoneDigits = useMemo(() => {
    if (!isPhone || !normalizedValue) return false;
    return normalizedValue.length > 2; // Больше чем просто +7
  }, [isPhone, normalizedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHasValue(newValue.length > 0);
    
    // Определяем тип ввода на основе нового значения
    const newInputType = detectInputType(newValue);
    const isNewPhone = newInputType === 'phone';
    
    if (isNewPhone) {
      // Удаляем все форматирование (пробелы, дефисы)
      const cleaned = newValue.replace(/[^\d+]/g, '');
      
      // Если поле пустое
      if (cleaned.length === 0) {
        onChange('');
        return;
      }
      
      // Обрабатываем начало номера
      let processed = cleaned;
      if (!cleaned.startsWith('+7')) {
        if (cleaned.startsWith('7')) {
          processed = '+7' + cleaned.slice(1);
        } else if (cleaned.startsWith('8')) {
          processed = '+7' + cleaned.slice(1);
        } else if (!cleaned.startsWith('+')) {
          // Если начинается с цифры, добавляем +7
          processed = '+7' + cleaned;
        }
      }
      
      // Ограничиваем длину (максимум 12 символов: +7XXXXXXXXXX)
      if (processed.length > 12) {
        processed = processed.slice(0, 12);
      }
      
      // Отправляем нормализованное значение
      onChange(processed);
    } else {
      // Для email или неизвестного типа просто передаем значение
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const handleFocus = () => {
    setFocused(true);
  };

  // Определяем inputMode для мобильных устройств
  const inputMode = isPhone ? 'tel' : 'email';
  const type = inputType === 'email' ? 'email' : 'tel';

  return (
    <div className="universal-input">
      <Input
        type={type}
        inputMode={inputMode}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        error={error}
        autoFocus={autoFocus}
        disabled={disabled}
        label={label}
        leftIcon={
          (isPhone || hasValue) ? (
            <span className={`flex items-center gap-1 ${hasPhoneDigits ? 'text-dark dark:text-white' : 'text-body-color dark:text-dark-6'}`}>
              <span className="text-base">🇷🇺</span>
              <span className="text-sm font-medium">+7</span>
            </span>
          ) : undefined
        }
      />
    </div>
  );
};

