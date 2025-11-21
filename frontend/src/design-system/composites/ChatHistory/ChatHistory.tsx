/**
 * ChatHistory - переиспользуемый компонент для отображения истории чатов
 * Соответствует принципам Atomic Design (Molecule - композиция из Avatar, Button и текста)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../primitives/Avatar';
import { Button } from '../../primitives/Button';
import { Icon } from '../../primitives/Icon';
import { LoginusIdLogo } from '../../primitives/LoginusIdLogo';
import { themeClasses } from '../../utils/themeClasses';
import { getInitials } from '@/utils/stringUtils';
import { getServiceIcon } from '@/utils/serviceIcons';

export interface ChatHistoryItem {
  id: string;
  name: string;
  service: string;
  isOnline?: boolean;
  lastMessage?: string;
  date: string;
  isActive?: boolean;
}

export interface ChatHistoryProps {
  /**
   * Список активных чатов
   */
  chats: ChatHistoryItem[];
  
  /**
   * Список закрытых чатов
   */
  closedChats?: ChatHistoryItem[];
  
  /**
   * ID активного чата
   */
  activeChatId?: string;
  
  /**
   * Обработчик выбора чата
   */
  onChatSelect?: (chatId: string) => void;
  
  /**
   * Обработчик создания нового чата
   */
  onCreateChat?: () => void;
  
  /**
   * Текст кнопки создания чата
   */
  createButtonText?: string;
  
  /**
   * Дополнительные классы
   */
  className?: string;
}

/**
 * ChatHistory - компонент истории чатов
 * Отображает список активных и закрытых чатов с возможностью выбора
 */
export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  closedChats = [],
  activeChatId,
  onChatSelect,
  onCreateChat,
  createButtonText = 'Выбрать сервис',
  className = '',
}) => {
  const { t } = useTranslation();
  
  return (
    <div className={`${themeClasses.card.roundedShadow} ${themeClasses.border.default} flex flex-col h-full ${className}`}>
      {/* Заголовок панели */}
      <div className={`${themeClasses.border.bottom} p-3 sm:p-4`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-sm sm:text-base ${themeClasses.text.primary} font-semibold`}>
            {t('support.history.title', 'История обращений')}
          </h2>
          {onCreateChat && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreateChat}
              leftIcon={React.createElement(getServiceIcon('add'), { size: 16 })}
              rightIcon={<Icon name="chevron-down" size="sm" className="hidden sm:block" />}
            >
              <span className="hidden sm:inline">{createButtonText}</span>
              <span className="sm:hidden">+</span>
            </Button>
          )}
        </div>
      </div>

      {/* Список активных чатов */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-1 sm:p-2 space-y-0.5 sm:space-y-1">
          {chats.filter(chat => chat && chat.service).map((chat) => {
            const isActive = activeChatId === chat.id;
            return (
              <button
                key={chat.id}
                onClick={() => onChatSelect?.(chat.id)}
                className={`w-full text-left p-2 sm:p-3 rounded-lg ${
                  isActive
                    ? `${themeClasses.background.gray2} ${themeClasses.text.primary}`
                    : `${themeClasses.text.primary} ${themeClasses.list.itemHover}`
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 relative">
                    {chat.service === 'Loginus ID' ? (
                      <LoginusIdLogo 
                        size="md" 
                        showStatus={chat.isOnline} 
                        status={chat.isOnline ? 'online' : 'offline'} 
                      />
                    ) : (
                    <Avatar
                      initials={getInitials(chat.service)}
                      name={chat.service}
                      size="md"
                      rounded
                      showStatus={chat.isOnline}
                      status={chat.isOnline ? 'online' : 'offline'}
                    />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <span className={`text-sm sm:text-base font-medium ${themeClasses.text.primary} truncate`}>
                        {chat.name}
                      </span>
                      {chat.isOnline && (
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full"></div>
                          <span className={`text-xs ${themeClasses.text.secondary} hidden sm:inline`}>
                            {t('support.history.online', 'В сети')}
                          </span>
                        </div>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className={`text-xs sm:text-sm ${themeClasses.text.secondary} truncate mb-0.5 sm:mb-1`}>
                        {chat.lastMessage}
                      </p>
                    )}
                    <span className={`text-xs ${themeClasses.text.secondary}`}>
                      {chat.date}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Раздел закрытых обращений */}
        {closedChats.length > 0 && (
          <div className="px-2 sm:px-4 py-1 sm:py-2">
            <div className={`${themeClasses.border.top} pt-2 sm:pt-4 mt-1 sm:mt-2`}>
              <h3 className={`text-xs font-medium ${themeClasses.text.secondary} mb-1 sm:mb-2 uppercase`}>
                {t('support.history.closed', 'Закрыто')}
              </h3>
              <div className="space-y-0.5 sm:space-y-1">
                {closedChats.filter(chat => chat && chat.name).map((chat) => (
                  <button
                    key={chat.id}
                    className={`w-full text-left p-1.5 sm:p-2 rounded-lg ${themeClasses.text.secondary} hover:text-text-primary ${themeClasses.list.itemHover}`}
                  >
                    <span className="text-xs sm:text-sm">{chat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

