import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Avatar } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { getInitials } from '../../utils/stringUtils';

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

// Цвета фона для аватара (из референса)
const BACKGROUND_COLORS = [
  { value: '#edeff2', label: 'светло-серый' },
  { value: '#fdebeb', label: 'светло-красный' },
  { value: '#ffedd1', label: 'светло-оранжевый' },
  { value: '#fcf1c5', label: 'светло-желтый' },
  { value: '#e1fae7', label: 'светло-зеленый' },
  { value: '#e1f7f4', label: 'светло-бирюзовый' },
  { value: '#e3f3fa', label: 'светло-синий' },
  { value: '#efedf7', label: 'светло-фиолетовый' },
  { value: '#fae9f6', label: 'светло-пурпурный' },
];

// Готовые аватары (иконки) - можно расширить список
const DEFAULT_AVATARS = [
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/1b1b8e713e99ec22c81a.webp', label: 'Academic cap' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fff280518cf59cf9b644.webp', label: 'Alien' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/7504ddd175f79330ae19.webp', label: 'Bear' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/692fb3ccc028a306ee0f.webp', label: 'Cat' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/2304fdb8b218a2006745.webp', label: 'Chess' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/72d8ef0bfc7289491011.webp', label: 'Cosmonaut' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/deb4c7a8510b7e303522.webp', label: 'Dino' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/a98a60a15cbd81f691de.webp', label: 'Dog' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fee0452b9300856d718e.webp', label: 'Football' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/c06fdaa38e6c02ca365c.webp', label: 'Fox' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/33bca4e6a3c408683127.webp', label: 'Ghost' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/ee1c88b1efccb86ccbfc.webp', label: 'Goose' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/f51e3559cb03a1ef9bf2.webp', label: 'Hare' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/6bba13fab0f50d638d39.webp', label: 'GingerbreadBoy' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/2976b8c96507853a40ae.webp', label: 'Moai' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/185e9da5bb2e68722b6b.webp', label: 'Parrot' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/d33b16ca7cd113d5a60a.webp', label: 'Robot' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/36b1d44b445b96ecacb0.webp', label: 'Rover' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/5c79c459b78c5af5809d.webp', label: 'Turtle' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/e3d62fb45a9255ffacbc.webp', label: 'Unicorn' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/704ef1c300c8fbffe829.webp', label: 'Yac' },
  { url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fcacc0117be1cd34023f.webp', label: 'Whale' },
];

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
  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(initialData?.avatar || null);
  const [selectedBackground, setSelectedBackground] = useState<string>(initialData?.backgroundColor || BACKGROUND_COLORS[0].value);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем состояние при изменении initialData
  React.useEffect(() => {
    if (initialData) {
      setSelectedAvatar(initialData.avatar || null);
      setSelectedBackground(initialData.backgroundColor || BACKGROUND_COLORS[0].value);
      setAvatarPreview(initialData.avatar || null);
    }
  }, [initialData]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setErrors({ avatar: t('modals.avatar.invalidImage', 'Выберите изображение') });
        return;
      }

      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: t('modals.avatar.imageTooLarge', 'Размер файла не должен превышать 5MB') });
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
      setErrors({ submit: error.message || t('modals.avatar.error', 'Ошибка при сохранении аватара') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAvatar(initialData?.avatar || null);
    setSelectedBackground(initialData?.backgroundColor || BACKGROUND_COLORS[0].value);
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
      title={t('modals.avatar.title', 'Новый аватар')}
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
            {t('modals.avatar.backgroundColor', 'Фон аватара')}
          </label>
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t('modals.avatar.backgroundColor', 'Фон аватара')}>
            {BACKGROUND_COLORS.map((color) => (
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
            {t('modals.avatar.image', 'Изображение аватара')}
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
              {t('modals.avatar.addPhoto', 'Добавить фото')}
            </Button>
          </div>

          {/* Готовые аватары */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2" role="radiogroup" aria-label={t('modals.avatar.image', 'Изображение аватара')}>
            {DEFAULT_AVATARS.map((avatar) => (
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
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading 
              ? t('modals.avatar.saving', 'Сохранение...') 
              : t('modals.avatar.save', 'Сохранить')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

