import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Avatar } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { profileApi } from '../../services/api/profile';
import { getInitials } from '../../utils/stringUtils';
import { validateRequired } from '../../utils/formValidation';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: {
    name: string;
    avatar?: string | null;
  };
}

/**
 * EditProfileModal - модальное окно для редактирования профиля (имя и аватар)
 */
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialData?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем состояние при изменении initialData
  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAvatarPreview(initialData.avatar || null);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateRequired(name, t('modals.profile.name', 'Имя'));
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || '';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setErrors({ avatar: t('modals.profile.invalidImage', 'Выберите изображение') });
        return;
      }

      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: t('modals.profile.imageTooLarge', 'Размер файла не должен превышать 5MB') });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Реализовать загрузку аватара на сервер
      // Пока что просто обновляем имя
      await profileApi.updateProfile({
        displayName: name,
      });
      
      // Если есть новый файл аватара, загружаем его
      if (avatarFile) {
        // TODO: Реализовать загрузку файла через API
        if (process.env.NODE_ENV === 'development') {
          console.log('Upload avatar:', avatarFile);
        }
      }

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      setErrors({ submit: error.message || t('modals.profile.error', 'Ошибка при сохранении профиля') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName(initialData?.name || '');
    setAvatarPreview(initialData?.avatar || null);
    setAvatarFile(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('modals.profile.title', 'Редактировать профиль')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Аватар */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar
              src={avatarPreview || undefined}
              initials={getInitials(name)}
              name={name}
              size="2xl"
              rounded
            />
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/80 transition-colors"
                aria-label={t('modals.profile.removeAvatar', 'Удалить аватар')}
              >
                ×
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {avatarPreview 
                ? t('modals.profile.changeAvatar', 'Изменить фото')
                : t('modals.profile.addAvatar', 'Добавить фото')
              }
            </Button>
            {avatarPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={isLoading}
              >
                {t('modals.profile.remove', 'Удалить')}
              </Button>
            )}
          </div>
          {errors.avatar && (
            <p className="text-sm text-error">{errors.avatar}</p>
          )}
        </div>

        {/* Имя */}
        <div>
          <Input
            type="text"
            label={t('modals.profile.name', 'Имя')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            fullWidth
            required
            disabled={isLoading}
          />
        </div>

        {errors.submit && (
          <div className="p-3 rounded-lg bg-error/10 dark:bg-error/20 border border-error/20 text-error text-sm">
            {errors.submit}
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
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !name.trim()}
            className="flex-1"
          >
            {isLoading 
              ? t('modals.profile.saving', 'Сохранение...') 
              : t('modals.profile.save', 'Сохранить')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

