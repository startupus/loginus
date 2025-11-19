import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { familyApi } from '../../services/api/family';

export interface InviteFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * InviteFamilyMemberModal - модальное окно для приглашения члена семьи
 */
export const InviteFamilyMemberModal: React.FC<InviteFamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'child'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError(t('family.invite.emailRequired', 'Введите email'));
      return false;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('family.invite.invalidEmail', 'Некорректный email'));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await familyApi.inviteMember({
        email: email.trim(),
        role,
      });
      setEmail('');
      setRole('member');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || t('family.invite.error', 'Ошибка при отправке приглашения'));
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
      title={t('family.invite.title', 'Пригласить в семью')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            label={t('family.invite.email', 'Email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('family.invite.emailPlaceholder', 'email@example.com')}
            disabled={isLoading}
            error={error || undefined}
            fullWidth
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            {t('family.invite.role', 'Роль')}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                role === 'member'
                  ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                  : 'bg-gray-1 dark:bg-dark-3 border-stroke dark:border-dark-3 text-body-color dark:text-dark-6 hover:border-primary/30'
              }`}
              disabled={isLoading}
            >
              {t('family.invite.roles.member', 'Взрослый')}
            </button>
            <button
              type="button"
              onClick={() => setRole('child')}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                role === 'child'
                  ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                  : 'bg-gray-1 dark:bg-dark-3 border-stroke dark:border-dark-3 text-body-color dark:text-dark-6 hover:border-primary/30'
              }`}
              disabled={isLoading}
            >
              {t('family.invite.roles.child', 'Ребенок')}
            </button>
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
            {t('common.cancel', 'Отмена')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !email.trim()}
            className="flex-1"
          >
            {isLoading 
              ? t('family.invite.sending', 'Отправка...') 
              : t('family.invite.send', 'Отправить приглашение')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
};

