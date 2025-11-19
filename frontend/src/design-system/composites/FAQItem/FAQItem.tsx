import React from 'react';

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
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white p-6 shadow-1 dark:bg-dark-2 dark:shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <h3 className="mb-3 text-lg font-bold text-dark dark:text-white">
        {question}
      </h3>
      <p className="text-base leading-relaxed text-body-color dark:text-dark-6">
        {answer}
      </p>
    </div>
  );
};

