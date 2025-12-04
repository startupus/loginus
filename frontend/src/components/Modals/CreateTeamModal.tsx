import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Icon, Textarea } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { teamsApi } from '../../services/api/teams';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * CreateTeamModal - модальное окно для создания команды (группы)
 */
export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('work.createTeam.nameRequired', 'Название группы обязательно'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await teamsApi.createTeam({
        name: name.trim(),
        description: description.trim() || undefined,
        organizationId: null, // Команды без организации
      });

      // Очищаем форму
      setName('');
      setDescription('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 
        err?.message || 
        t('work.createTeam.error', 'Ошибка при создании группы')
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Закрытие модалки с очисткой состояния
   */
  const handleClose = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Иллюстрация */}
        <div className="flex justify-center">
          <div className={`w-[220px] h-[120px] ${themeClasses.background.gray} dark:bg-dark-3 rounded-xl flex items-center justify-center`}>
            <Icon name="briefcase" size="xl" className="text-primary" />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            {t('work.createTeam.title', 'Создать группу')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('work.createTeam.description', 'Создайте рабочую группу для совместной работы')}
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label={t('work.createTeam.nameLabel', 'Название группы')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('work.createTeam.namePlaceholder', 'Например: Команда разработки')}
            disabled={isLoading}
            error={error || undefined}
            fullWidth
            required
            autoFocus
          />

          <Textarea
            label={t('work.createTeam.descriptionLabel', 'Описание (необязательно)')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('work.createTeam.descriptionPlaceholder', 'Краткое описание группы')}
            disabled={isLoading}
            fullWidth
            rows={3}
          />

          {/* Ошибка */}
          {error && (
            <div className="text-error text-sm text-center">{error}</div>
          )}

          {/* Кнопки */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              {t('work.createTeam.create', 'Создать группу')}
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('common.cancel', 'Отмена')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

