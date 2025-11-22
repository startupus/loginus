import React, { useState, useMemo } from 'react';
import { Input } from '../Input';
import { detectInputType, normalizePhone } from '../../../utils/validation';
import { formatPhone } from '../../../utils/formatting';
import { themeClasses } from '../../utils/themeClasses';

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
  // Применяем форматирование во время ввода и при blur
  const displayValue = useMemo(() => {
    // Если в значении есть "@", это email - не применяем форматирование телефона
    if (value && value.includes('@')) {
      return value;
    }
    
    if (isPhone && normalizedValue) {
      // Если только +7 без цифр, не показываем (показываем placeholder)
      if (normalizedValue === '+7' || normalizedValue.length <= 2) {
        return '';
      }
      
      // Убираем +7 из начала, так как он отображается в leftIcon
      const withoutPrefix = normalizedValue.startsWith('+7') 
        ? normalizedValue.slice(2) 
        : normalizedValue;
      
      // Форматируем номер во время ввода (начинаем с 1-й цифры)
      if (normalizedValue.startsWith('+7') && withoutPrefix.length >= 1) {
        // Форматируем частично введенный номер
        const digits = withoutPrefix;
        let formatted = '';
        
        // Первые 3 цифры (код оператора)
        if (digits.length > 0) {
          formatted = digits.slice(0, 3);
        }
        
        // Добавляем пробел после кода оператора (если есть хотя бы 4-я цифра)
        if (digits.length > 3) {
          formatted += ' ' + digits.slice(3, 6);
        }
        
        // Добавляем дефис после первых 3 цифр номера (если есть хотя бы 7-я цифра)
        if (digits.length > 6) {
          formatted += '-' + digits.slice(6, 8);
        }
        
        // Добавляем второй дефис (если есть хотя бы 9-я цифра)
        if (digits.length > 8) {
          formatted += '-' + digits.slice(8, 10);
        }
        
        return formatted;
      }
      
        return withoutPrefix;
    }
    return value || '';
  }, [normalizedValue, value, isPhone]);

  // Определяем, есть ли введенные цифры (для телефона)
  const hasPhoneDigits = useMemo(() => {
    // Если в значении есть "@", это email - не показываем иконку телефона
    if (value && value.includes('@')) return false;
    if (!isPhone || !normalizedValue) return false;
    return normalizedValue.length > 2; // Больше чем просто +7
  }, [isPhone, normalizedValue, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHasValue(newValue.length > 0);
    
    // Если в значении есть "@", это email - убираем форматирование телефона
    if (newValue.includes('@')) {
      // Удаляем все форматирование телефона (пробелы, дефисы, +7 в начале)
      // Но сохраняем "@" и все после него
      const atIndex = newValue.indexOf('@');
      const beforeAt = newValue.slice(0, atIndex);
      const afterAt = newValue.slice(atIndex);
      
      // Убираем форматирование из части до "@"
      const cleanedBeforeAt = beforeAt.replace(/[\s\-\(\)\+]/g, '');
      
      // Объединяем очищенную часть с частью после "@"
      onChange(cleanedBeforeAt + afterAt);
      return;
    }
    
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
          // Не показываем иконку телефона, если в значении есть "@" (это email)
          (isPhone || hasValue) && !(value && value.includes('@')) ? (
            <span className={`flex items-center gap-1 ${hasPhoneDigits ? themeClasses.text.primary : themeClasses.text.secondary}`}>
              <span className="text-base">🇷🇺</span>
              <span className="text-sm font-medium">+7</span>
            </span>
          ) : undefined
        }
      />
    </div>
  );
};

