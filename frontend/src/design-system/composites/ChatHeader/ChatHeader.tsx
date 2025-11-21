/**
 * ChatHeader - компонент заголовка чата
 * Отображает информацию о чате: аватар, название, статус онлайн
 * 
 * Соответствует принципам Atomic Design (Molecule - композиция из Avatar и текста)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../../primitives/Avatar';
import { LoginusIdLogo } from '../../primitives/LoginusIdLogo';
import { themeClasses } from '../../utils/themeClasses';
import { getInitials } from '@/utils/stringUtils';

export interface ChatHeaderProps {
  /**
   * Название чата
   */
  name: string;
  
  /**
   * Название сервиса (для аватара)
   */
  service: string;
  
  /**
   * Статус онлайн
   */
  isOnline?: boolean;
  
  /**
   * Дополнительные классы
   */
  className?: string;
  
  /**
   * Отступ слева для текстовой части (для мобильных с кнопкой назад)
   */
  textLeftPadding?: string;
}

/**
 * ChatHeader - компонент заголовка чата
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  service,
  isOnline,
  className = '',
  textLeftPadding = '',
}) => {
  const { t } = useTranslation();
  
  // Проверяем, является ли это чатом поддержки Loginus ID
  const isLoginusIdSupport = service === 'Loginus ID' || name.includes('Loginus ID');

  return (
    <div className={`${themeClasses.background.default} ${themeClasses.border.bottom} p-3 sm:p-4 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-shrink-0 relative">
          {isLoginusIdSupport ? (
            <LoginusIdLogo size="md" showStatus={isOnline} status={isOnline ? 'online' : 'offline'} />
          ) : (
          <Avatar
            initials={getInitials(service)}
            name={service}
            size="md"
            rounded
            showStatus={isOnline}
            status={isOnline ? 'online' : 'offline'}
          />
          )}
        </div>
        <div className={`flex-1 min-w-0 pl-2 sm:pl-0 ${textLeftPadding} flex items-center justify-between gap-2`}>
          <h3 className={`text-sm sm:text-base font-semibold ${themeClasses.text.primary} truncate`}>
            {name}
          </h3>
          {isOnline && (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" role="status" aria-label={t('support.chat.online', 'В сети')}>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full" aria-hidden="true"></div>
              <span className="text-xs sm:text-sm text-success whitespace-nowrap">
                {t('support.chat.online', 'В сети')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

