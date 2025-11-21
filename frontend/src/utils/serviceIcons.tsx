/**
 * Утилита для получения иконок сервисов из react-icons
 * Используется для отображения иконок в кнопках и элементах интерфейса
 */

import React from 'react';
import { 
  FiUser, 
  FiStar, 
  FiMail, 
  FiHardDrive, 
  FiGrid,
  FiPlus,
  FiChevronDown,
  FiPaperclip,
  FiSend,
  FiMic,
  FiArrowLeft,
  FiHelpCircle,
  FiMessageSquare,
  FiFolder
} from 'react-icons/fi';

/**
 * Типы сервисов и соответствующие им иконки
 */
export const serviceIconMap: Record<string, React.ComponentType<{ className?: string; size?: string | number }>> = {
  // Сервисы
  'id': FiUser,
  'user': FiUser,
  'plus': FiStar, // Loginus Plus использует звезду
  'star': FiStar,
  'mail': FiMail,
  'hard-drive': FiHardDrive,
  'disk': FiHardDrive,
  'other': FiGrid,
  'grid': FiGrid,
  'all': FiGrid,
  
  // Действия
  'add': FiPlus,
  'chevron-down': FiChevronDown,
  'paperclip': FiPaperclip,
  'send': FiSend,
  'microphone': FiMic,
  'arrow-left': FiArrowLeft,
  'help-circle': FiHelpCircle,
  'message': FiMessageSquare,
  'folder': FiFolder,
};

/**
 * Иконка по умолчанию (папка)
 */
export const DefaultIcon = FiFolder;

/**
 * Получить компонент иконки по имени сервиса
 * @param serviceId - ID сервиса или имя иконки
 * @returns Компонент иконки или иконка по умолчанию
 */
export const getServiceIcon = (serviceId: string | undefined): React.ComponentType<{ className?: string; size?: string | number }> => {
  if (!serviceId) return DefaultIcon;
  return serviceIconMap[serviceId.toLowerCase()] || DefaultIcon;
};

/**
 * Компонент для отображения иконки сервиса
 */
export interface ServiceIconProps {
  serviceId?: string;
  className?: string;
  size?: string | number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ 
  serviceId, 
  className = '', 
  size = 16 
}) => {
  const IconComponent = getServiceIcon(serviceId);
  return <IconComponent className={className} size={size} />;
};

