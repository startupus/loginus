import { useState, useEffect, useCallback } from 'react';

export interface UseResendTimerReturn {
  /**
   * Оставшиеся секунды
   */
  seconds: number;
  
  /**
   * Можно ли отправить код повторно
   */
  canResend: boolean;
  
  /**
   * Сбросить таймер
   */
  reset: () => void;
  
  /**
   * Отформатированное время (MM:SS)
   */
  format: string;
}

/**
 * Хук для таймера повторной отправки кода
 */
export function useResendTimer(initialSeconds: number = 60): UseResendTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const format = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [seconds]);

  return {
    seconds,
    canResend: seconds === 0,
    reset,
    format: format(),
  };
}

