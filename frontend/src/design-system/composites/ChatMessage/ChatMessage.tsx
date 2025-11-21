/**
 * ChatMessage - переиспользуемый компонент для отображения сообщения в чате
 * Соответствует принципам Atomic Design (Molecule - композиция из Avatar и текста)
 */

import React from 'react';
import { themeClasses } from '../../utils/themeClasses';

export interface ChatMessageProps {
  /**
   * Отправитель сообщения
   */
  sender: 'user' | 'bot';
  
  /**
   * Текст сообщения
   */
  message: string;
  
  /**
   * Время отправки
   */
  timestamp: string;
  
  /**
   * Имя отправителя (для бота)
   */
  senderName?: string;
  
  /**
   * Аватар отправителя (опционально)
   */
  avatar?: string;
  
  /**
   * Инициалы отправителя (если нет аватара)
   */
  initials?: string;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * ChatMessage - компонент сообщения в чате
 * Поддерживает сообщения от пользователя и бота с правильным позиционированием
 * Формат соответствует TailGrids ChatBox компоненту
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  timestamp,
  senderName = 'Поддержка',
  className = '',
}) => {
  const isBot = sender === 'bot';

  // Формат для сообщений от пользователя (Reply)
  if (!isBot) {
    return (
      <div className={`ml-auto max-w-[85%] sm:max-w-[355px] ${className}`}>
        <div className="mb-1.5 sm:mb-2 rounded-2xl rounded-br-none bg-primary px-3 py-2 sm:px-5 sm:py-3">
          <p className="text-sm sm:text-base text-white break-words">{message}</p>
        </div>
        <p className={`text-right text-xs ${themeClasses.text.secondary}`}>
          {timestamp}
        </p>
      </div>
    );
  }

  // Формат для сообщений от бота (Chat)
  return (
    <div className={`max-w-[85%] sm:max-w-[355px] ${className}`}>
      <p className={`mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${themeClasses.text.secondary}`}>
        {senderName}
      </p>
      <div className={`mb-1.5 sm:mb-2 rounded-2xl rounded-tl-none ${themeClasses.background.gray2} px-3 py-2 sm:px-5 sm:py-3`}>
        <p className={`text-sm sm:text-base ${themeClasses.text.primary} break-words`}>{message}</p>
      </div>
      <p className={`text-xs ${themeClasses.text.secondary}`}>{timestamp}</p>
    </div>
  );
};

