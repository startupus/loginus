import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Icon } from '../../design-system/primitives';
import { Modal } from '../../design-system/composites';
import { familyApi } from '../../services/api/family';
import { themeClasses } from '../../design-system/utils/themeClasses';

export interface InviteFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Типы отношений для приглашаемого члена семьи
 */
type RelationType = 'partner' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';

/**
 * Шаги процесса приглашения
 */
type InviteStep = 'relation' | 'invite' | 'sendMethod';

/**
 * InviteFamilyMemberModal - модальное окно для приглашения члена семьи
 * Многошаговый процесс по референсу Яндекс ID
 */
export const InviteFamilyMemberModal: React.FC<InviteFamilyMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  
  // Логирование для отладки
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[InviteFamilyMemberModal] isOpen changed:', isOpen);
    }
  }, [isOpen]);
  
  // Состояние шага
  const [currentStep, setCurrentStep] = useState<InviteStep>('relation');
  
  // Выбранное отношение
  const [selectedRelation, setSelectedRelation] = useState<RelationType | null>(null);
  
  // Ссылка приглашения (генерируется после выбора отношения)
  const [inviteLink, setInviteLink] = useState<string>('');
  
  // Телефон или email для отправки
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  
  // Состояния загрузки и ошибок
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  /**
   * Генерирует ссылку приглашения через API
   */
  const generateInviteLink = async (relation: RelationType | null): Promise<string> => {
    try {
      // Для семейных групп email не нужен - кто перешел по ссылке, тот и присоединяется
      const response = await familyApi.inviteMember({
        role: relation === 'child' ? 'child' : 'member',
      });
      if (process.env.NODE_ENV === 'development') {
        // Логируем реальный ответ бэкенда, чтобы понимать структуру
        // и избежать проблем с парсингом поля invitationLink/token
        // eslint-disable-next-line no-console
        console.log('[InviteFamilyMemberModal] inviteMember response', response);
        console.log('[InviteFamilyMemberModal] inviteMember response.data', response.data);
        console.log('[InviteFamilyMemberModal] inviteMember response.data.data', response.data?.data);
        console.log('[InviteFamilyMemberModal] Full response structure:', JSON.stringify(response.data, null, 2));
      }

      // Получаем реальную ссылку из ответа API
      // Структура: { success: true, data: { token: '...', invitationLink: '...', ... } }
      const responseData = response.data?.data || response.data;
      console.log('[InviteFamilyMemberModal] responseData:', responseData);
      console.log('[InviteFamilyMemberModal] responseData keys:', responseData ? Object.keys(responseData) : 'null');
      
      const invitationLink = responseData?.invitationLink;
      const token = responseData?.token;
      
      console.log('[InviteFamilyMemberModal] invitationLink:', invitationLink);
      console.log('[InviteFamilyMemberModal] token:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (invitationLink) {
        // Добавляем relation к ссылке, если оно было выбрано
        try {
          const url = new URL(invitationLink);
          if (relation) {
            url.searchParams.set('relation', relation);
          }
          const finalLink = url.toString();
          console.log('[InviteFamilyMemberModal] Final invitationLink:', finalLink);
          return finalLink;
        } catch (e) {
          console.error('[InviteFamilyMemberModal] Error parsing invitationLink:', e);
          // Если ошибка парсинга URL, используем как есть
          return invitationLink;
        }
      }
      
      // Fallback: формируем ссылку из token, если он есть в ответе
      if (token) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invitation?token=${token}${relation ? `&relation=${relation}` : ''}`;
        console.log('[InviteFamilyMemberModal] Generated link from token:', link);
        return link;
      }
      
      throw new Error(t('family.invite.error', 'Не удалось получить ссылку приглашения'));
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || t('family.invite.error', 'Ошибка при генерации ссылки'));
    }
  };

  /**
   * Обработчик выбора отношения
   */
  const handleSelectRelation = async (relation: RelationType) => {
    setSelectedRelation(relation);
    setIsLoading(true);
    try {
      const link = await generateInviteLink(relation);
      setInviteLink(link);
      setCurrentStep('invite');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработчик пропуска выбора отношения
   */
  const handleSkipRelation = async () => {
    setSelectedRelation(null);
    setIsLoading(true);
    try {
      const link = await generateInviteLink(null);
      setInviteLink(link);
      setCurrentStep('invite');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Копирование ссылки в буфер обмена
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      setError(t('family.invite.error', 'Не удалось скопировать ссылку'));
    }
  };

  /**
   * Обработчик перехода к отправке SMS/email
   */
  const handleShowSendMethod = () => {
    setCurrentStep('sendMethod');
  };

  /**
   * Обработчик отправки SMS/email
   */
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await familyApi.inviteMember({
        role: selectedRelation === 'child' ? 'child' : 'member',
      });
      
      // Получаем ссылку из ответа и обновляем inviteLink
      const invitationLink = (response.data as any)?.data?.invitationLink || 
                            (response.data as any)?.invitationLink;
      const token = (response.data as any)?.data?.token || (response.data as any)?.token;
      
      console.log('[InviteFamilyMemberModal] invitationLink from response:', invitationLink);
      console.log('[InviteFamilyMemberModal] token from response:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (invitationLink) {
        console.log('[InviteFamilyMemberModal] Using invitationLink from response:', invitationLink);
        setInviteLink(invitationLink);
      } else if (token) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invitation?token=${token}${selectedRelation ? `&relation=${selectedRelation}` : ''}`;
        console.log('[InviteFamilyMemberModal] Generated link from token:', link);
        setInviteLink(link);
      } else {
        console.error('[InviteFamilyMemberModal] No invitationLink or token in response:', response.data);
      }
      
      // Переходим на шаг с ссылкой
      setCurrentStep('invite');
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || t('family.invite.error', 'Ошибка при отправке приглашения'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обработчик поделиться ссылкой
   */
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('family.invite.step2.title', 'Приглашение в семейную группу'),
          text: t('family.invite.step2.description', 'Приняв приглашение, близкий получит все возможности семейной группы'),
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
    setCurrentStep('relation');
    setSelectedRelation(null);
    setInviteLink('');
    setPhoneOrEmail('');
    setError(null);
    setLinkCopied(false);
    onClose();
  };

  /**
   * Рендер шага выбора отношения
   */
  const renderRelationStep = () => {
    const relations: RelationType[] = ['partner', 'parent', 'child', 'sibling', 'friend', 'other'];
    
    return (
      <div className="space-y-6">
        {/* Иллюстрация */}
        <div className="flex justify-center">
          <div className={`w-[220px] h-[120px] ${themeClasses.background.gray} dark:bg-dark-3 rounded-xl flex items-center justify-center`}>
            <Icon name="users" size="xl" className="text-primary" />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            {t('family.invite.step1.title', 'Кто этот человек для вас?')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('family.invite.step1.description', 'Делаем семейную группу удобнее')}
          </p>
        </div>

        {/* Кнопки выбора отношения */}
        <div className="flex flex-wrap gap-2 justify-center">
          {relations.map((relation) => (
            <button
              key={relation}
              type="button"
              onClick={() => handleSelectRelation(relation)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-1 dark:bg-dark-3 border-border text-text-secondary cursor-not-allowed opacity-50'
                  : `${themeClasses.card.default} ${themeClasses.text.primary} hover:border-primary ${themeClasses.card.hover}`
              }`}
            >
              {t(`family.invite.relations.${relation}`)}
            </button>
          ))}
        </div>

        {/* Кнопка "Пропустить" */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSkipRelation}
            disabled={isLoading}
            className="text-text-secondary hover:text-primary transition-colors text-sm font-medium"
          >
            {t('family.invite.step1.skip', 'Пропустить')}
          </button>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="text-error text-sm text-center">{error}</div>
        )}
      </div>
    );
  };

  /**
   * Рендер шага приглашения (ссылка + действия)
   */
  const renderInviteStep = () => {
    return (
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
            {t('family.invite.step2.title', 'Приглашение в семейную группу')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('family.invite.step2.description', 'Приняв приглашение, близкий получит все возможности семейной группы')}
          </p>
        </div>

        {/* Выбранное отношение (если было выбрано) */}
        {selectedRelation && (
          <div className="flex flex-wrap gap-2 justify-center opacity-60">
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl border bg-primary/10 border-primary text-primary cursor-not-allowed"
            >
              {t(`family.invite.relations.${selectedRelation}`)}
            </button>
          </div>
        )}

        {/* Баннер со ссылкой */}
        <div 
          className={`p-4 rounded-xl ${themeClasses.background.gray} dark:bg-dark-3 border ${themeClasses.border.default} space-y-2 cursor-pointer hover:border-primary/50 transition-colors`}
          onClick={handleCopyLink}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary mb-1">
                {linkCopied 
                  ? t('family.invite.step2.linkCopied', 'Ссылка скопирована') 
                  : t('family.invite.step2.copyHint', 'Если ссылка не скопировалась')
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
              aria-label={t('family.invite.step2.linkCopied', 'Скопировать')}
            >
              <Icon name={linkCopied ? 'check' : 'copy'} size="sm" className={linkCopied ? 'text-success' : 'text-text-secondary'} />
            </button>
          </div>
        </div>

        {/* Действия */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={handleShareLink}
          >
            {t('family.invite.step2.shareLink', 'Поделиться ссылкой')}
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleShowSendMethod}
          >
            {t('family.invite.step2.sendSmsOrEmail', 'Отправить смс или письмо')}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Рендер шага отправки SMS/email
   */
  const renderSendMethodStep = () => {
    return (
      <div className="space-y-6">
        {/* Иллюстрация */}
        <div className="flex justify-center">
          <div className={`w-[220px] h-[120px] ${themeClasses.background.gray} dark:bg-dark-3 rounded-xl flex items-center justify-center`}>
            <Icon name="mail" size="xl" className="text-primary" />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-text-primary">
            {t('family.invite.step2.title', 'Приглашение в семейную группу')}
          </h3>
          <p className="text-base text-text-secondary">
            {t('family.invite.step2.description', 'Приняв приглашение, близкий получит все возможности семейной группы')}
          </p>
        </div>

        {/* Форма отправки */}
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            type="text"
            label={t('family.invite.phoneOrEmail', 'Телефон или почта')}
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            placeholder={t('family.invite.phoneOrEmailPlaceholder', '+7 или email@example.com')}
            disabled={isLoading}
            error={error || undefined}
            fullWidth
            required
          />

          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              {t('family.invite.send', 'Отправить')}
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setCurrentStep('invite')}
              disabled={isLoading}
            >
              {t('family.invite.step2.orShareLink', 'Или поделиться ссылкой')}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showCloseButton={true}
    >
      {currentStep === 'relation' && renderRelationStep()}
      {currentStep === 'invite' && renderInviteStep()}
      {currentStep === 'sendMethod' && renderSendMethodStep()}
    </Modal>
  );
};
