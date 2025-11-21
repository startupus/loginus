/**
 * ChatMessage - переиспользуемый компонент для отображения сообщения в чате
 * Соответствует принципам Atomic Design (Molecule - композиция из Avatar и текста)
 */

import React, { useState, useRef, useEffect } from 'react';
import { themeClasses } from '../../utils/themeClasses';
import { useTranslation } from 'react-i18next';

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

  /**
   * Сообщение было отредактировано
   */
  edited?: boolean;

  /**
   * Время редактирования
   */
  editedAt?: string;

  /**
   * Можно ли редактировать сообщение (только для сообщений пользователя)
   */
  canEdit?: boolean;

  /**
   * Обработчик редактирования сообщения
   */
  onEdit?: (messageId: string) => void;

  /**
   * ID сообщения
   */
  messageId?: string;
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
  edited = false,
  editedAt,
  canEdit = false,
  onEdit,
  messageId,
}) => {
  const { t } = useTranslation();
  const isBot = sender === 'bot';
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Закрытие контекстного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node) &&
        messageRef.current &&
        !messageRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showContextMenu]);

  // Обработчик правого клика
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isBot && canEdit && onEdit && messageId) {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  // Обработчик редактирования
  const handleEdit = () => {
    if (onEdit && messageId) {
      onEdit(messageId);
      setShowContextMenu(false);
    }
  };

  // Формат для сообщений от пользователя (Reply)
  if (!isBot) {
    return (
      <div 
        ref={messageRef}
        className={`ml-auto max-w-[85%] sm:max-w-[355px] ${className} relative`}
        onContextMenu={handleContextMenu}
      >
        <div className="mb-1.5 sm:mb-2 rounded-2xl rounded-br-none bg-primary px-3 py-2 sm:px-5 sm:py-3">
          <p className="text-sm sm:text-base text-white break-words">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {edited && (
            <span className={`text-xs ${themeClasses.text.secondary} italic`}>
              {t('support.chat.edited', 'изменено')}
            </span>
          )}
          <p className={`text-right text-xs ${themeClasses.text.secondary}`}>
            {timestamp}
          </p>
        </div>
        
        {/* Контекстное меню */}
        {showContextMenu && canEdit && (
          <div
            ref={contextMenuRef}
            className={`fixed z-50 ${themeClasses.card.shadow} ${themeClasses.border.default} rounded-lg shadow-lg py-1 min-w-[120px]`}
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors"
            >
              {t('support.chat.edit', 'Изменить')}
            </button>
          </div>
        )}
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
      <div className="flex items-center gap-1.5">
        {edited && (
          <span className={`text-xs ${themeClasses.text.secondary} italic`}>
            {t('support.chat.edited', 'изменено')}
          </span>
        )}
        <p className={`text-xs ${themeClasses.text.secondary}`}>{timestamp}</p>
      </div>
    </div>
  );
};

