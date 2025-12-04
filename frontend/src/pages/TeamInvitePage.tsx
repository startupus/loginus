import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useAuthStore } from '@/store';
import { apiClient } from '@/services/api/client';

const TeamInvitePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = useCurrentLanguage();
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<{
    inviterName: string | null;
    targetName: string;
    roleName: string;
    organizationName?: string;
    teamName?: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || 
                searchParams.get('invitation') || 
                searchParams.get('invite-id') || 
                searchParams.get('inviteId');
  const type = searchParams.get('type');
  const teamId = searchParams.get('teamId');

  const hasInvite = Boolean(token);

  // Загружаем детали приглашения, если есть токен
  const { isLoading: isLoadingDetails, error: detailsError, data: detailsData } = useQuery({
    queryKey: ['team-invitation-details', token],
    queryFn: async () => {
      if (!token) {
        console.error('[TeamInvitePage] No token provided');
        setLoadError(t('work.invite.noToken', 'Токен приглашения не найден'));
        return null;
      }
      try {
        console.log('[TeamInvitePage] Fetching invitation details for token:', token.substring(0, 20) + '...');
        
        const response = await apiClient.get(`/invitations/details?token=${encodeURIComponent(token)}`);
        console.log('[TeamInvitePage] Response received:', response);
        
        const details = response.data?.data || response.data;
        console.log('[TeamInvitePage] Extracted details:', details);
        
        // Проверяем, что это приглашение в группу
        if (details && (details.type === 'team' || type === 'team' || teamId)) {
          if (details.targetName && details.roleName) {
            setInvitationDetails(details);
            setLoadError(null);
            return details;
          } else {
            throw new Error('Invalid response format: missing invitation details');
          }
        } else {
          throw new Error('This invitation is not for a team');
        }
      } catch (err: any) {
        console.error('[TeamInvitePage] Failed to fetch invitation details:', err);
        
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error ||
                           err.message || 
                           t('work.invite.fetchError', 'Не удалось загрузить детали приглашения.');
        setLoadError(errorMessage);
        setInvitationDetails(null);
        throw err;
      }
    },
    enabled: Boolean(token),
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (detailsData) {
      setInvitationDetails(detailsData);
      setLoadError(null);
    } else if (detailsError) {
      const errorMessage = (detailsError as any)?.response?.data?.message || 
                          (detailsError as any)?.message || 
                          t('work.invite.fetchError', 'Не удалось загрузить детали приглашения.');
      setLoadError(errorMessage);
      setInvitationDetails(null);
    }
  }, [detailsData, detailsError, t]);

  const acceptMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      const response = await apiClient.post('/invitations/accept', {
        token: inviteToken,
      });
      return response;
    },
    onSuccess: async (response) => {
      console.log('[TeamInvitePage] Invitation accepted, response:', response);
      
      await queryClient.cancelQueries({ queryKey: ['team-invitation-details', token] });
      queryClient.removeQueries({ queryKey: ['team-invitation-details', token] });
      queryClient.setQueryData(['team-invitation-details', token], null);
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['work-teams'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      
      navigate(buildPathWithLang('/work', currentLang), { replace: true });
    },
    onError: (error: any) => {
      console.error('[TeamInvitePage] Error accepting invitation:', error);
      setAcceptError(error?.response?.data?.message || t('work.invite.acceptError', 'Ошибка при принятии приглашения'));
      setIsAccepting(false);
    },
  });

  const handleAccept = async () => {
    if (!token) {
      setAcceptError(t('work.invite.noToken', 'Токен приглашения не найден'));
      return;
    }

    const { user: currentUser, accessToken } = useAuthStore.getState();
    console.log('[TeamInvitePage] handleAccept - user:', currentUser ? 'exists' : 'null');

    if (!currentUser) {
      const invitationPath = buildPathWithLang('/invitation', currentLang) + (location.search || '');
      const authPath = buildPathWithLang('/auth', currentLang);
      navigate(`${authPath}?next=${encodeURIComponent(invitationPath)}`);
      return;
    }

    if (!accessToken) {
      console.error('[TeamInvitePage] User is authenticated but accessToken is missing!');
      setAcceptError(t('work.invite.authError', 'Ошибка авторизации. Пожалуйста, войдите в систему заново.'));
      return;
    }

    setIsAccepting(true);
    setAcceptError(null);
    acceptMutation.mutate(token);
  };

  const handleDecline = async () => {
    if (!token || !user) {
      return;
    }
    // TODO: Реализовать отклонение приглашения через API
    navigate(buildPathWithLang('/work', currentLang), { replace: true });
  };

  const goToWork = () => {
    navigate(buildPathWithLang('/work', currentLang), { replace: true });
  };

  const goToAuth = () => {
    const workPathWithInvite = buildPathWithLang('/work', currentLang) + (location.search || '');
    const authPath = buildPathWithLang('/auth', currentLang);
    navigate(`${authPath}?next=${encodeURIComponent(workPathWithInvite)}`);
  };

  return (
    <PageTemplate 
      title={t('work.invite.title', 'Приглашение в группу')} 
      showSidebar={false}
      contentClassName="flex justify-center items-start py-10 px-4"
    >
      <div className="w-full max-w-xl">
        <div className={`${themeClasses.card.default} ${themeClasses.card.shadow} p-6 sm:p-8 space-y-4`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={themeClasses.iconContainer.active}>
              <Icon name="briefcase" size="md" />
            </div>
            <div>
              <h1 className={`${themeClasses.text.primary} text-xl sm:text-2xl font-semibold`}>
                {t('work.invite.title', 'Приглашение в группу')}
              </h1>
              <p className={`${themeClasses.text.secondary} text-sm sm:text-base`}>
                {t('work.invite.subtitle', 'Примите приглашение, чтобы присоединиться к группе и начать совместную работу.')}
              </p>
            </div>
          </div>

          {hasInvite ? (
            <>
              {isLoadingDetails ? (
                <div className={`${themeClasses.text.secondary} text-center py-4`}>
                  {t('common.loading', 'Загрузка...')}
                </div>
              ) : (loadError || detailsError) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={themeClasses.iconContainer.gray}>
                      <Icon name="alert-circle" size="md" />
                    </div>
                    <div>
                      <p className={`${themeClasses.text.primary} font-medium`}>
                        {t('work.invite.loadErrorTitle', 'Не удалось распознать приглашение')}
                      </p>
                      <p className={`${themeClasses.text.secondary} text-sm`}>
                        {loadError || (detailsError as any)?.response?.data?.message || (detailsError as any)?.message || t('work.invite.invalidDescription', 'Проверьте, что вы открыли актуальную ссылку приглашения, или попросите отправить новое приглашение.')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="primary" onClick={goToWork}>
                      {t('work.invite.backToWork', 'Перейти в раздел «Работа»')}
                    </Button>
                  </div>
                </div>
              ) : invitationDetails ? (
                <>
                  <div className="space-y-3">
                    {!user ? (
                      <p className={themeClasses.text.primary}>
                        {t(
                          'work.invite.description',
                          'Чтобы завершить присоединение к группе, войдите в свой аккаунт или создайте новый. После входа вы сможете управлять группой на странице «Работа».'
                        )}
                      </p>
                    ) : (
                      <p className={themeClasses.text.primary}>
                        {t(
                          'work.invite.acceptDescription',
                          'Вы можете принять или отклонить это приглашение.'
                        )}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      {user && accessToken && token ? (
                        <>
                          <Button 
                            variant="primary"
                            className="flex-1"
                            onClick={handleAccept}
                            loading={isAccepting}
                            disabled={isAccepting || isDeclining}
                          >
                            {t('work.invite.accept', 'Принять приглашение')}
                          </Button>
                          <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={handleDecline}
                            loading={isDeclining}
                            disabled={isAccepting || isDeclining}
                          >
                            {t('work.invite.decline', 'Отклонить')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="primary"
                            className="flex-1"
                            onClick={goToAuth}
                          >
                            {t('work.invite.loginOrRegister', 'Войти или зарегистрироваться')}
                          </Button>
                          <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={goToWork}
                          >
                            {t('work.invite.goToWork', 'Перейти в раздел «Работа»')}
                          </Button>
                        </>
                      )}
                    </div>

                    {acceptError && (
                      <div className={`${themeClasses.background.error} ${themeClasses.text.error} rounded-lg px-3 py-2 text-sm mt-2`}>
                        {acceptError}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className={themeClasses.iconContainer.gray}>
                  <Icon name="alert-circle" size="md" />
                </div>
                <div>
                  <p className={`${themeClasses.text.primary} font-medium`}>
                    {t('work.invite.invalidTitle', 'Не удалось распознать приглашение')}
                  </p>
                  <p className={`${themeClasses.text.secondary} text-sm`}>
                    {t(
                      'work.invite.invalidDescription',
                      'Проверьте, что вы открыли актуальную ссылку приглашения, или попросите отправить новое приглашение.'
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="primary" onClick={goToWork}>
                  {t('work.invite.backToWork', 'Перейти в раздел «Работа»')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

export default TeamInvitePage;

