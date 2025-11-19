import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role?: 'admin' | 'member') => Promise<void>;
  groupName?: string;
}

/**
 * InviteMemberModal - модальное окно для приглашения участников в группу
 */
export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  groupName,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t('work.invite.emailRequired', 'Введите email'));
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('work.invite.invalidEmail', 'Некорректный email'));
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
      setRole('member');
      onClose();
    } catch (err: any) {
      setError(err.message || t('work.invite.error', 'Ошибка при отправке приглашения'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('work.invite.title', 'Пригласить участника')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {groupName && (
          <div className="text-sm text-text-secondary mb-4">
            {t('work.invite.group', 'Группа')}: <span className="font-medium text-text-primary">{groupName}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('work.invite.email', 'Email')}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('work.invite.emailPlaceholder', 'email@example.com')}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('work.invite.role', 'Роль')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                role === 'member'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-gray-1 dark:bg-gray-2 border-border text-text-secondary hover:border-primary/30'
              }`}
              disabled={isLoading}
            >
              {t('work.invite.member', 'Участник')}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-gray-1 dark:bg-gray-2 border-border text-text-secondary hover:border-primary/30'
              }`}
              disabled={isLoading}
            >
              {t('work.invite.admin', 'Администратор')}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

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
            disabled={isLoading || !email.trim()}
            className="flex-1"
            leftIcon={<Icon name="user-plus" size="sm" />}
          >
            {isLoading ? t('common.sending', 'Отправка...') : t('work.invite.send', 'Отправить приглашение')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

