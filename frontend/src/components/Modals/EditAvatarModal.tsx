import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { getInitials } from '../../utils/stringUtils';
import { PREDEFINED_AVATARS, AVATAR_BACKGROUND_COLORS } from '../../utils/avatars';
import { preloadModule } from '../../services/i18n/config';

export interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    name: string;
    avatar?: string | null;
    backgroundColor?: string;
  };
}

/**
 * EditAvatarModal - модальное окно для редактирования аватара
 * Позволяет выбрать цвет фона, загрузить фото или выбрать готовый аватар
 */
export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialData?.avatar || null);
  const [selectedBackground, setSelectedBackground] = useState<string>(initialData?.backgroundColor || AVATAR_BACKGROUND_COLORS[0].value);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Гарантируем, что модуль переводов 'modals' загружен до первого рендера контента модалки
  React.useEffect(() => {
    void preloadModule('modals').catch(() => undefined);
  }, []);

  // Перезагружаем модуль при смене языка, чтобы исключить кэш EN на RU и наоборот
  React.useEffect(() => {
    void preloadModule('modals').catch(() => undefined);
  }, [i18n.language]);

  // Обновляем состояние при изменении initialData
  React.useEffect(() => {
    if (initialData) {
      setSelectedAvatar(initialData.avatar || null);
      setSelectedBackground(initialData.backgroundColor || AVATAR_BACKGROUND_COLORS[0].value);
      setAvatarPreview(initialData.avatar || null);
    }
  }, [initialData]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setErrors({ avatar: t('avatar.invalidImage', 'Выберите изображение') });
        return;
      }

      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: t('avatar.imageTooLarge', 'Размер файла не должен превышать 5MB') });
        return;
      }

      setAvatarFile(file);
      setSelectedAvatar(null); // Сбрасываем выбранный готовый аватар
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const handleDefaultAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // TODO: Реализовать загрузку аватара на сервер
      // Пока что просто обновляем профиль
      if (avatarFile) {
        // TODO: Реализовать загрузку файла через API
        if (process.env.NODE_ENV === 'development') {
          console.log('Upload avatar file:', avatarFile);
        }
      }
      
      if (selectedAvatar) {
        // TODO: Сохранить выбранный аватар и цвет фона
        if (process.env.NODE_ENV === 'development') {
          console.log('Save avatar:', selectedAvatar, 'background:', selectedBackground);
        }
      }

      // Временная заглушка - просто закрываем модалку
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      setErrors({ submit: error.message || t('avatar.error', 'Ошибка при сохранении аватара') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAvatar(initialData?.avatar || null);
    setSelectedBackground(initialData?.backgroundColor || AVATAR_BACKGROUND_COLORS[0].value);
    setAvatarPreview(initialData?.avatar || null);
    setAvatarFile(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const currentAvatarUrl = avatarPreview || selectedAvatar || initialData?.avatar || null;

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('avatar.title', { defaultValue: 'New avatar' })}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Текущий аватар */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="relative rounded-full p-2"
            style={{ backgroundColor: selectedBackground }}
          >
            <Avatar
              src={currentAvatarUrl || undefined}
              initials={getInitials(initialData?.name || '')}
              name={initialData?.name || ''}
              size="2xl"
              rounded
            />
          </div>
        </div>

        {/* Выбор цвета фона */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            {t('avatar.backgroundColor', { defaultValue: 'Avatar background' })}
          </label>
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t('avatar.backgroundColor', { defaultValue: 'Avatar background' })}>
            {AVATAR_BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedBackground(color.value)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedBackground === color.value
                    ? 'border-text-primary dark:border-text-secondary scale-110'
                    : 'border-transparent hover:border-border dark:hover:border-border'
                }`}
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
                aria-checked={selectedBackground === color.value}
                role="radio"
              />
            ))}
          </div>
        </div>

        {/* Выбор изображения аватара */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            {t('avatar.image', { defaultValue: 'Avatar image' })}
          </label>
          
          {/* Кнопка загрузки фото */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/heic,image/gif,image/webp"
              onChange={handleAvatarFileChange}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
                  clipRule="evenodd"
                />
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10.51 3h2.98c.794 0 1.077.045 1.385.144.308.1.574.253.815.469.24.215.423.438.823 1.123L17.25 6h1.545c1.114 0 1.519.116 1.926.334s.727.538.945.945S22 8.09 22 9.205v7.59c0 1.114-.116 1.519-.334 1.926a2.27 2.27 0 0 1-.945.945c-.407.218-.811.334-1.926.334H5.205c-1.115 0-1.519-.116-1.926-.334a2.27 2.27 0 0 1-.945-.945C2.116 18.314 2 17.91 2 16.795v-7.59c0-1.115.116-1.519.334-1.926s.538-.727.945-.945S4.09 6 5.205 6H6.75l.737-1.264c.4-.685.582-.908.823-1.123.24-.216.507-.37.815-.469S9.716 3 10.51 3m0 2c-.546 0-.664.013-.771.048a.2.2 0 0 0-.094.054c-.084.075-.155.17-.43.642l-.737 1.264A2 2 0 0 1 6.75 8H5.205c-.427 0-.694.019-.849.049a.4.4 0 0 0-.134.049.3.3 0 0 0-.124.124.4.4 0 0 0-.049.134c-.03.155-.049.422-.049.849v7.59c0 .427.019.694.049.849.012.06.017.074.049.134a.3.3 0 0 0 .124.125c.06.031.073.036.134.048.155.03.422.049.849.049h13.59c.427 0 .694-.019.849-.049a.4.4 0 0 0 .134-.049.3.3 0 0 0 .125-.124.4.4 0 0 0 .048-.134c.03-.155.049-.422.049-.849v-7.59c0-.427-.019-.694-.049-.849a.4.4 0 0 0-.049-.134.3.3 0 0 0-.124-.124.4.4 0 0 0-.134-.049c-.155-.03-.422-.049-.849-.049H17.25a2 2 0 0 1-1.728-.992l-.737-1.264c-.275-.472-.346-.567-.43-.642a.2.2 0 0 0-.094-.054c-.107-.035-.225-.048-.77-.048z"
                  clipRule="evenodd"
                />
              </svg>
              {t('avatar.addPhoto', { defaultValue: 'Add photo' })}
            </Button>
          </div>

          {/* Готовые аватары */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2" role="radiogroup" aria-label={t('avatar.image', { defaultValue: 'Avatar image' })}>
            {PREDEFINED_AVATARS.map((avatar) => (
              <button
                key={avatar.url}
                type="button"
                onClick={() => handleDefaultAvatarSelect(avatar.url)}
                className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedAvatar === avatar.url
                    ? 'border-primary scale-105'
                    : 'border-transparent hover:border-border'
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
              </button>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {errors.submit}
          </div>
        )}

        {errors.avatar && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {errors.avatar}
          </div>
        )}

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
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading
              ? t('avatar.saving', { defaultValue: 'Saving...' })
              : t('avatar.save', { defaultValue: 'Save' })
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

