import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../design-system/composites';
import { Button, Avatar, Icon } from '../../design-system/primitives';
import { getInitials } from '../../utils/stringUtils';
import { PREDEFINED_AVATARS } from '../../utils/avatars';
import { preloadModule } from '../../services/i18n/config';

/**
 * Интерфейс пропсов модального окна
 */
export interface EditFamilyMemberAvatarModalProps {
  /** Флаг открытия модального окна */
  isOpen: boolean;
  /** Колбэк закрытия модального окна */
  onClose: () => void;
  /** Колбэк успешного сохранения */
  onSuccess?: (avatarUrl: string) => void;
  /** Начальные данные члена семьи */
  initialData?: {
    /** Имя члена семьи */
    name: string;
    /** URL текущего аватара */
    avatar?: string | null;
  };
}

/**
 * EditFamilyMemberAvatarModal - модальное окно для выбора аватара члена семьи
 * Упрощённая версия EditAvatarModal без загрузки файлов и выбора фона
 */
export const EditFamilyMemberAvatarModal: React.FC<EditFamilyMemberAvatarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialData?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  // Обновляем состояние при изменении initialData
  React.useEffect(() => {
    if (initialData) {
      setSelectedAvatar(initialData.avatar || null);
    }
  }, [initialData]);

  // Гарантируем загрузку модуля переводов 'modals' при монтировании и при смене языка
  React.useEffect(() => {
    void preloadModule('modals').catch(() => undefined);
  }, [i18n.language]);

  const handleAvatarSelect = useCallback((avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAvatar) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Реализовать сохранение аватара через API
      if (process.env.NODE_ENV === 'development') {
        console.log('Save member avatar:', selectedAvatar);
      }

      // Временная заглушка - просто закрываем модалку
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSuccess?.(selectedAvatar);
      handleClose();
    } catch (error: any) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAvatar(initialData?.avatar || null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('familyMember.avatarTitle', { defaultValue: 'Select avatar' })}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Текущий аватар */}
        <div className="flex flex-col items-center gap-4">
          <Avatar
            src={selectedAvatar || undefined}
            initials={getInitials(initialData?.name || '')}
            name={initialData?.name || ''}
            size="2xl"
            rounded
          />
          <p className="text-sm font-medium text-text-primary">
            {initialData?.name}
          </p>
        </div>

        {/* Выбор аватара */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            {t('familyMember.selectAvatar', { defaultValue: 'Select an avatar' })}
          </label>
          
          {/* Галерея готовых аватаров */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2" role="radiogroup" aria-label={t('familyMember.selectAvatar', { defaultValue: 'Select an avatar' })}>
            {PREDEFINED_AVATARS.map((avatar) => (
              <button
                key={avatar.url}
                type="button"
                onClick={() => handleAvatarSelect(avatar.url)}
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedAvatar === avatar.url
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-transparent hover:border-border dark:hover:border-border'
                }`}
                aria-label={avatar.label}
                aria-checked={selectedAvatar === avatar.url}
                role="radio"
              >
                <img
                  src={avatar.url}
                  alt={avatar.label}
                  className="w-full h-full object-contain"
                />
                {selectedAvatar === avatar.url && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="check" size="xs" className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !selectedAvatar}
            className="flex-1"
          >
            {isLoading
              ? t('familyMember.saving', { defaultValue: 'Saving...' })
              : t('familyMember.save', { defaultValue: 'Save' })
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

