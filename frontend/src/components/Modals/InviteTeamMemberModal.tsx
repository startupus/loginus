import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Icon } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { teamsApi } from '../../services/api/teams';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  teamId: string;
  teamName: string;
}

/**
 * InviteTeamMemberModal - модальное окно для приглашения участников в команду
 * Многоразовая ссылка приглашения
 */
export const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teamId,
  teamName,
}) => {
  const { t } = useTranslation();
  
  const [inviteLink, setInviteLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  /**
   * Генерирует многоразовую ссылку приглашения через API
   */
  const generateInviteLink = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await teamsApi.generateInviteLink(teamId, 'viewer');
      const link = response.data.data.invitationLink;
      setInviteLink(link);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 
        err?.message || 
        t('work.invite.error', 'Ошибка при генерации ссылки')
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Копирование ссылки в буфер обмена
   */
  const handleCopyLink = async () => {
    if (!inviteLink) {
      await generateInviteLink();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      setError(t('work.invite.error', 'Не удалось скопировать ссылку'));
    }
  };

  /**
   * Обработчик поделиться ссылкой
   */
  const handleShareLink = async () => {
    if (!inviteLink) {
      await generateInviteLink();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('work.invite.shareTitle', 'Приглашение в команду'),
          text: t('work.invite.shareText', `Присоединяйтесь к команде "${teamName}"`),
          url: inviteLink,
        });
      } catch (err) {
        // Если пользователь отменил шаринг, ничего не делаем
        if ((err as Error).name !== 'AbortError') {
          // Fallback: копируем ссылку
          handleCopyLink();
        }
      }
    } else {
      // Fallback: копируем ссылку
      handleCopyLink();
    }
  };

  /**
   * Закрытие модалки с очисткой состояния
   */
  const handleClose = () => {
    setInviteLink('');
    setError(null);
    setLinkCopied(false);
    onClose();
  };

  // Генерируем ссылку при открытии модалки
  useEffect(() => {
    if (isOpen && !inviteLink) {
      generateInviteLink();
    }
  }, [isOpen]);

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
            <Icon name="link" size="xl" className="text-primary" />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            {t('work.invite.title', 'Пригласить в команду')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('work.invite.description', `Пригласите участников в команду "${teamName}"`)}
          </p>
        </div>

        {/* Баннер со ссылкой */}
        {inviteLink ? (
          <div 
            className={`p-4 rounded-xl ${themeClasses.background.gray} dark:bg-dark-3 border ${themeClasses.border.default} space-y-2 cursor-pointer hover:border-primary/50 transition-colors`}
            onClick={handleCopyLink}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary mb-1">
                  {linkCopied 
                    ? t('work.invite.linkCopied', 'Ссылка скопирована') 
                    : t('work.invite.copyHint', 'Нажмите, чтобы скопировать ссылку')
                  }
                </p>
                <p className="text-sm text-text-primary font-mono break-all">
                  {inviteLink}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-dark-2 transition-colors"
                aria-label={t('work.invite.copy', 'Скопировать')}
              >
                <Icon name={linkCopied ? 'check' : 'copy'} size="sm" className={linkCopied ? 'text-success' : 'text-text-secondary'} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isLoading ? (
              <p className="text-text-secondary">{t('work.invite.generating', 'Генерация ссылки...')}</p>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={generateInviteLink}
                loading={isLoading}
              >
                {t('work.invite.generate', 'Сгенерировать ссылку')}
              </Button>
            )}
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="text-error text-sm text-center">{error}</div>
        )}

        {/* Действия */}
        {inviteLink && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleShareLink}
            >
              {t('work.invite.shareLink', 'Поделиться ссылкой')}
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleClose}
            >
              {t('common.close', 'Закрыть')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

