import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface FAQItemProps {
  /**
   * Вопрос
   */
  question: string;
  
  /**
   * Ответ
   */
  answer: string;
  
  /**
   * Открыт ли по умолчанию
   */
  defaultOpen?: boolean;
  
  /**
   * Callback при клике
   */
  onClick?: () => void;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * FAQItem - элемент FAQ (вопрос-ответ)
 * Используется в секциях FAQ на landing страницах
 */
export const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  // defaultOpen = false, // TODO: реализовать функционал открытия по умолчанию
  onClick,
  className = '',
}) => {
  const { isDark } = useTheme();
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white p-6 shadow-1 dark:bg-dark-2 dark:shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <h3 className={`mb-3 text-lg font-bold ${isDark ? 'text-white' : 'text-text-primary'}`}>
        {question}
      </h3>
      <p className="text-base leading-relaxed text-text-secondary">
        {answer}
      </p>
    </div>
  );
};

