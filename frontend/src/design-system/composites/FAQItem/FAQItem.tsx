import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

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
      className={`${themeClasses.card.roundedShadow} p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <h3 className={`mb-3 text-lg font-bold ${themeClasses.text.primary}`}>
        {question}
      </h3>
      <p className={`text-base leading-relaxed ${themeClasses.text.secondary}`}>
        {answer}
      </p>
    </div>
  );
};

