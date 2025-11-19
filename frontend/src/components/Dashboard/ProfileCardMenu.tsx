import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../design-system/primitives';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useContactMasking } from '@/hooks/useContactMasking';

export interface ProfileCardMenuProps {
  /**
   * Открыто ли меню
   */
  isOpen: boolean;
  
  /**
   * Callback при закрытии
   */
  onClose: () => void;
  
  /**
   * Референс на элемент-якорь (кнопка редактирования)
   */
  anchorRef: React.RefObject<HTMLElement>;
  
  /**
   * Данные пользователя
   */
  user: {
    phone: string;
  };
  
  /**
   * Callback при выборе "Личные данные"
   */
  onPersonalData?: () => void;
  
  /**
   * Callback при выборе "Обновить аватар"
   */
  onEditAvatar?: () => void;
  
  /**
   * Callback при выборе "Телефон"
   */
  onPhone?: () => void;
}

/**
 * ProfileCardMenu - попап-меню для карточки профиля
 * Отображает опции редактирования профиля
 */
export const ProfileCardMenu: React.FC<ProfileCardMenuProps> = ({
  isOpen,
  onClose,
  anchorRef,
  user,
  onPersonalData,
  onEditAvatar,
  onPhone,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  const menuRef = useRef<HTMLDivElement>(null);
  const { masked: maskedPhone } = useContactMasking(user.phone, 'phone');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Позиционирование меню относительно якоря
  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Используем фиксированную ширину меню (320px) для расчета позиции
      const menuWidth = 320;
      const menuHeight = 212; // max-height

      // Позиционируем меню снизу от якоря, выравнивая по правому краю
      let top = anchorRect.bottom + 8;
      let left = anchorRect.right - menuWidth;

      // Проверка на выход за правый край экрана
      if (left < 16) {
        left = 16;
      }

      // Проверка на выход за нижний край экрана
      if (top + menuHeight > viewportHeight - 16) {
        // Показываем меню сверху от якоря
        top = anchorRect.top - menuHeight - 8;
      }

      // Проверка на выход за верхний край экрана
      if (top < 16) {
        top = 16;
      }

      // Проверка на выход за левый край экрана
      if (left + menuWidth > viewportWidth - 16) {
        left = viewportWidth - menuWidth - 16;
      }

      setPosition({ top, left });
    };

    // Небольшая задержка для корректного вычисления размеров
    const timeoutId = setTimeout(updatePosition, 0);

    // Обновляем позицию при скролле и ресайзе
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef]);

  // Закрытие меню при клике вне его
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Небольшая задержка, чтобы не закрыть меню сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Закрытие меню при нажатии Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handlePersonalData = () => {
    if (onPersonalData) {
      onPersonalData();
    } else {
      navigate(buildPathWithLang('/personal?dialog=personal-data', currentLang));
    }
    onClose();
  };

  const handleEditAvatar = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onEditAvatar) {
      onEditAvatar();
    }
    onClose();
  };

  const handlePhone = () => {
    if (onPhone) {
      onPhone();
    } else {
      navigate(buildPathWithLang('/security/phones', currentLang));
    }
    onClose();
  };

  // Структура данных меню согласно референсу
  const menuItems = [
    {
      key: 'Personal',
      testId: 'profile-card-menu-option-Personal',
      icon: 'user',
      title: t('profile.personalData', 'Личные данные'),
      description: t('profile.personalDataDescription', 'ФИО, день рождения, пол'),
      onClick: handlePersonalData,
    },
    {
      key: 'EditAvatar',
      testId: 'profile-card-menu-option-EditAvatar',
      icon: 'camera',
      title: t('profile.editAvatar', 'Обновить аватар'),
      description: t('profile.editAvatarDescription', 'Загрузить или создать'),
      onClick: handleEditAvatar,
    },
    {
      key: 'Phone',
      testId: 'profile-card-menu-option-Phone',
      icon: 'phone',
      title: t('profile.phone', 'Телефон'),
      description: maskedPhone,
      onClick: handlePhone,
    },
  ];

  // Рендерим меню через Portal в body для корректного позиционирования
  if (!isOpen || !position) {
    return null;
  }

  const menuContent = (
    <div
      ref={menuRef}
      role="menu"
      aria-label={t('profile.menu', 'Меню профиля')}
      id="react-aria-profile-card-menu"
      data-testid="profile-card-menu"
      className="fixed z-[100000] w-[320px] max-h-[212px] bg-white dark:bg-surface rounded-lg shadow-lg border border-border overflow-hidden py-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.key}
          id={`react-aria-profile-card-menu-${item.key}`}
          role="menuitem"
          onClick={item.onClick}
          className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-1 dark:hover:bg-gray-2 transition-colors text-left group"
          data-key={item.key}
          data-testid={item.testId}
          data-disabled="false"
          data-interactive="false"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
            <Icon name={item.icon as any} size="md" className="text-text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-primary mb-0.5" data-testid="heading-title" data-variant="text-m" data-color="primary">
              {item.title}
            </div>
            <div className="text-xs text-text-secondary" data-testid="heading-description" data-variant="text-s" data-color="secondary">
              {item.key === 'Phone' ? <bdi>{item.description}</bdi> : item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return createPortal(menuContent, document.body);
};

