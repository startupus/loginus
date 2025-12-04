import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Icon, Textarea } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { teamsApi, Team } from '../../services/api/teams';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  team: Team | null;
}

/**
 * EditTeamModal - модальное окно для редактирования команды
 */
export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  team,
}) => {
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Заполняем форму данными команды при открытии
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setDescription(team.description || '');
    }
  }, [team, isOpen]);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team?.id) {
      setError(t('work.editTeam.teamNotFound', 'Команда не найдена'));
      return;
    }

    if (!name.trim()) {
      setError(t('work.editTeam.nameRequired', 'Название группы обязательно'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await teamsApi.updateTeam(team.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 
        err?.message || 
        t('work.editTeam.error', 'Ошибка при обновлении группы')
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
            <Icon name="edit" size="xl" className="text-primary" />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            {t('work.editTeam.title', 'Редактировать группу')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('work.editTeam.description', 'Измените информацию о группе')}
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label={t('work.editTeam.nameLabel', 'Название группы')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('work.editTeam.namePlaceholder', 'Например: Команда разработки')}
            disabled={isLoading}
            error={error || undefined}
            fullWidth
            required
            autoFocus
          />

          <Textarea
            label={t('work.editTeam.descriptionLabel', 'Описание (необязательно)')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('work.editTeam.descriptionPlaceholder', 'Краткое описание группы')}
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
              {t('work.editTeam.save', 'Сохранить')}
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

