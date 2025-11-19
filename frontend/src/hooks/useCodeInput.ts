import { useState, useCallback } from 'react';

export interface UseCodeInputReturn {
  /**
   * Массив значений полей
   */
  values: string[];
  
  /**
   * Установить значение для конкретного поля
   */
  setValue: (index: number, value: string) => void;
  
  /**
   * Очистить все поля
   */
  clear: () => void;
  
  /**
   * Заполнен ли код полностью
   */
  isComplete: boolean;
  
  /**
   * Полный код как строка
   */
  code: string;
}

/**
 * Хук для управления состоянием полей ввода кода
 */
export function useCodeInput(length: number = 6): UseCodeInputReturn {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));

  const setValue = useCallback((index: number, value: string) => {
    // Разрешаем только цифры
    if (value && !/^\d$/.test(value)) {
      return;
    }

    setValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value.slice(-1); // Только последний символ
      return newValues;
    });
  }, []);

  const clear = useCallback(() => {
    setValues(Array(length).fill(''));
  }, [length]);

  const code = values.join('');
  const isComplete = values.every((v) => v) && code.length === length;

  return {
    values,
    setValue,
    clear,
    isComplete,
    code,
  };
}

