import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { themeClasses } from '../../utils/themeClasses';

export interface CodeInputProps {
  /**
   * Количество полей ввода (обычно 6)
   */
  length?: number;
  
  /**
   * Callback при полном заполнении кода
   */
  onComplete?: (code: string) => void;
  
  /**
   * Callback при изменении кода
   */
  onChange?: (code: string) => void;
  
  /**
   * Сообщение об ошибке
   */
  error?: string;
  
  /**
   * Автофокус на первое поле
   */
  autoFocus?: boolean;
  
  /**
   * Отключено
   */
  disabled?: boolean;
  
  /**
   * Значение кода (контролируемый режим)
   */
  value?: string;
}

export interface CodeInputRef {
  /**
   * Установить фокус на первое поле
   */
  focus: () => void;
}

/**
 * CodeInput - компонент для ввода кода подтверждения
 * Поддерживает автоматический переход между полями, Backspace, вставку
 */
export const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(({
  length = 6,
  onComplete,
  onChange,
  error,
  autoFocus = false,
  disabled = false,
  value: controlledValue,
}, ref) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Предоставляем метод focus родительскому компоненту
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRefs.current[0]?.focus();
    },
  }));

  // Контролируемый режим
  const isControlled = controlledValue !== undefined;
  const currentOtp = isControlled 
    ? controlledValue.split('').concat(Array(length - controlledValue.length).fill('')).slice(0, length)
    : otp;

  useEffect(() => {
    if (isControlled && controlledValue) {
      const digits = controlledValue.split('').slice(0, length);
      const newOtp = [...digits, ...Array(length - digits.length).fill('')].slice(0, length);
      setOtp(newOtp);
    }
  }, [controlledValue, length, isControlled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем только цифры, Backspace, Delete, Tab, и служебные клавиши
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Tab' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const index = inputRefs.current.indexOf(e.target as HTMLInputElement);
      if (index > 0 && !currentOtp[index]) {
        const newOtp = [...currentOtp];
        newOtp[index - 1] = '';
        if (!isControlled) {
          setOtp(newOtp);
        }
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    
    if (target.value) {
      // Берем только последний символ (на случай вставки)
      const digit = target.value.slice(-1);
      
      if (!/^[0-9]$/.test(digit)) {
        return;
      }

      const newOtp = [...currentOtp];
      newOtp[index] = digit;
      
      if (!isControlled) {
        setOtp(newOtp);
      }

      const code = newOtp.join('');
      onChange?.(code);

      // Переход к следующему полю
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Проверка на завершение
      if (newOtp.every(d => d) && newOtp.join('').length === length) {
        onComplete?.(newOtp.join(''));
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    
    if (!new RegExp(`^[0-9]{${length}}$`).test(text)) {
      return;
    }

    const digits = text.split('').slice(0, length);
    const newOtp = [...digits, ...Array(length - digits.length).fill('')].slice(0, length);
    
    if (!isControlled) {
      setOtp(newOtp);
    }

    const code = newOtp.join('');
    onChange?.(code);

    // Фокус на последнее заполненное поле
    const lastFilledIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Если код полный, вызываем onComplete
    if (digits.length === length) {
      onComplete?.(code);
    }
  };

  return (
    <div className="code-input">
      <div className="flex gap-2 justify-center">
        {currentOtp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onPaste={handlePaste}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={`
              flex w-14 h-14 items-center justify-center rounded-lg 
              border p-2 text-center 
              text-2xl font-medium outline-none 
              focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${themeClasses.background.default}
              ${themeClasses.text.primary}
              ${
                error && error.trim() !== ''
                  ? `border-error focus:border-error focus:ring-error/20` 
                  : `${themeClasses.border.default} focus:border-primary focus:ring-primary/20`
              }
            `}
            aria-label={t('codeInput.digit', 'Цифра {{index}} из {{total}}', { index: index + 1, total: length })}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

CodeInput.displayName = 'CodeInput';

