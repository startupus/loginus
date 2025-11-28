import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { familyApi } from '@/services/api/family';
import { useAuthStore } from '@/store';

const FamilyInvitePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = useCurrentLanguage();
  const queryClient = useQueryClient();
  const { user, accessToken } = useAuthStore();
  
  // Логируем состояние авторизации при монтировании компонента
  useEffect(() => {
    const { user: currentUser, accessToken: currentToken } = useAuthStore.getState();
    console.log('[FamilyInvitePage] Component mounted - user:', currentUser ? 'exists' : 'null', 'accessToken:', currentToken ? 'exists' : 'null');
  }, []);
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
  // Поддерживаем разные форматы:
  // - token (новый формат: /invitation?token=...)
  // - invitation (старый формат: /dashboard?invitation=...)
  // - invite-id, inviteId (еще более старые форматы)
  const token = searchParams.get('token') || 
                searchParams.get('invitation') || 
                searchParams.get('invite-id') || 
                searchParams.get('inviteId');
  const relation = searchParams.get('relation');

  const hasInvite = Boolean(token);

  // Логируем для отладки
  useEffect(() => {
    console.log('[FamilyInvitePage] ========== DEBUG INFO ==========');
    console.log('[FamilyInvitePage] Full location object:', location);
    console.log('[FamilyInvitePage] Pathname:', location.pathname);
    console.log('[FamilyInvitePage] Search:', location.search);
    console.log('[FamilyInvitePage] Hash:', location.hash);
    console.log('[FamilyInvitePage] Full URL:', location.pathname + location.search + location.hash);
    console.log('[FamilyInvitePage] Window location href:', window.location.href);
    console.log('[FamilyInvitePage] Window location search:', window.location.search);
    console.log('[FamilyInvitePage] SearchParams keys:', Array.from(searchParams.keys()));
    console.log('[FamilyInvitePage] SearchParams entries:', Array.from(searchParams.entries()));
    console.log('[FamilyInvitePage] Token from searchParams.get("token"):', searchParams.get('token'));
    console.log('[FamilyInvitePage] Token from searchParams.get("invitation"):', searchParams.get('invitation'));
    console.log('[FamilyInvitePage] Final token:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('[FamilyInvitePage] Has invite:', hasInvite);
    console.log('[FamilyInvitePage] =================================');
  }, [location, token, hasInvite, searchParams]);

  // Загружаем детали приглашения, если есть токен
  const { isLoading: isLoadingDetails, error: detailsError, data: detailsData } = useQuery({
    queryKey: ['invitation-details', token],
    queryFn: async () => {
      if (!token) {
        console.error('[FamilyInvitePage] No token provided');
        setLoadError(t('family.invite.noToken', 'Токен приглашения не найден'));
        return null;
      }
      try {
        console.log('[FamilyInvitePage] Fetching invitation details for token:', token.substring(0, 20) + '...');
        console.log('[FamilyInvitePage] Full token:', token);
        console.log('[FamilyInvitePage] API base URL:', import.meta.env.VITE_API_BASE_URL || '/api/v2');
        
        const response = await familyApi.getInvitationDetails(token);
        console.log('[FamilyInvitePage] Response received:', response);
        console.log('[FamilyInvitePage] Response status:', response.status);
        console.log('[FamilyInvitePage] Response data:', response.data);
        console.log('[FamilyInvitePage] Response data.data:', response.data?.data);
        
        // Проверяем разные форматы ответа
        const details = response.data?.data || response.data;
        console.log('[FamilyInvitePage] Extracted details:', details);
        
        if (details && details.targetName && details.roleName) {
          // inviterName может быть null, это нормально
          setInvitationDetails(details);
          setLoadError(null);
          return details;
        } else {
          console.error('[FamilyInvitePage] Invalid response format:', { details, responseData: response.data });
          throw new Error('Invalid response format: missing invitation details');
        }
      } catch (err: any) {
        console.error('[FamilyInvitePage] Failed to fetch invitation details:', err);
        console.error('[FamilyInvitePage] Error type:', err.constructor.name);
        console.error('[FamilyInvitePage] Error response:', err.response);
        console.error('[FamilyInvitePage] Error response data:', err.response?.data);
        console.error('[FamilyInvitePage] Error response status:', err.response?.status);
        console.error('[FamilyInvitePage] Error message:', err.message);
        console.error('[FamilyInvitePage] Error stack:', err.stack);
        
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error ||
                           err.message || 
                           t('family.invite.fetchError', 'Не удалось загрузить детали приглашения.');
        setLoadError(errorMessage);
        setInvitationDetails(null);
        throw err; // Пробрасываем ошибку, чтобы useQuery мог её обработать
      }
    },
    enabled: Boolean(token),
    retry: 1,
    refetchOnWindowFocus: false, // Не рефетчить при фокусе окна
    refetchOnMount: false, // Не рефетчить при монтировании, если данные уже есть
    refetchOnReconnect: false, // Не рефетчить при переподключении
    staleTime: Infinity, // Данные никогда не считаются устаревшими (пока не удалены из кеша)
  });

  // Обновляем состояние при изменении данных из useQuery
  useEffect(() => {
    if (detailsData) {
      setInvitationDetails(detailsData);
      setLoadError(null);
    } else if (detailsError) {
      const errorMessage = (detailsError as any)?.response?.data?.message || 
                          (detailsError as any)?.message || 
                          t('family.invite.fetchError', 'Не удалось загрузить детали приглашения.');
      setLoadError(errorMessage);
      setInvitationDetails(null);
    }
  }, [detailsData, detailsError, t]);

  const acceptMutation = useMutation({
    mutationFn: (inviteToken: string) => familyApi.acceptInvitation(inviteToken),
    onSuccess: async (response) => {
      console.log('[FamilyInvitePage] Invitation accepted, response:', response);
      
      // Отменяем активный запрос деталей приглашения
      await queryClient.cancelQueries({ queryKey: ['invitation-details', token] });
      
      // Удаляем запрос из кеша полностью, чтобы он не рефетчился
      queryClient.removeQueries({ queryKey: ['invitation-details', token] });
      
      // Устанавливаем данные как null, чтобы отключить запрос
      queryClient.setQueryData(['invitation-details', token], null);
      
      // Инвалидируем все связанные запросы (кроме invitation-details)
      // Используем await чтобы убедиться, что инвалидация завершена перед навигацией
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['family'] }),
        queryClient.invalidateQueries({ queryKey: ['family-members'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      
      // Сразу перенаправляем пользователя на страницу семьи
      navigate(buildPathWithLang('/family', currentLang), { replace: true });
    },
    onError: (error: any) => {
      console.error('[FamilyInvitePage] Error accepting invitation:', error);
      setAcceptError(error?.response?.data?.message || t('family.invite.acceptError', 'Ошибка при принятии приглашения'));
      setIsAccepting(false);
    },
  });

  const handleAccept = async () => {
    if (!token) {
      setAcceptError(t('family.invite.noToken', 'Токен приглашения не найден'));
      return;
    }

    const { user: currentUser, accessToken } = useAuthStore.getState();
    console.log('[FamilyInvitePage] handleAccept - user:', currentUser ? 'exists' : 'null');
    console.log('[FamilyInvitePage] handleAccept - accessToken:', accessToken ? 'exists' : 'null');

    if (!currentUser) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      const invitationPath = buildPathWithLang('/invitation', currentLang) + (location.search || '');
      const authPath = buildPathWithLang('/auth', currentLang);
      navigate(`${authPath}?next=${encodeURIComponent(invitationPath)}`);
      return;
    }

    if (!accessToken) {
      console.error('[FamilyInvitePage] User is authenticated but accessToken is missing!');
      setAcceptError(t('family.invite.authError', 'Ошибка авторизации. Пожалуйста, войдите в систему заново.'));
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
    // Пока просто перенаправляем на страницу семьи
    navigate(buildPathWithLang('/family', currentLang), { replace: true });
  };

  const goToFamily = () => {
    navigate(buildPathWithLang('/family', currentLang), { replace: true });
  };

  const goToAuth = () => {
    const familyPathWithInvite = buildPathWithLang('/family', currentLang) + (location.search || '');
    const authPath = buildPathWithLang('/auth', currentLang);
    navigate(`${authPath}?next=${encodeURIComponent(familyPathWithInvite)}`);
  };

  return (
    <PageTemplate 
      title={t('profile.family.invitePage.title', 'Приглашение в семейную группу')} 
      showSidebar={false}
      contentClassName="flex justify-center items-start py-10 px-4"
    >
      <div className="w-full max-w-xl">
        <div className={`${themeClasses.card.default} ${themeClasses.card.shadow} p-6 sm:p-8 space-y-4`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={themeClasses.iconContainer.active}>
              <Icon name="users" size="md" />
            </div>
            <div>
              <h1 className={`${themeClasses.text.primary} text-xl sm:text-2xl font-semibold`}>
                {t('profile.family.invitePage.title', 'Приглашение в семейную группу')}
              </h1>
              <p className={`${themeClasses.text.secondary} text-sm sm:text-base`}>
                {t('profile.family.invitePage.subtitle', 'Примите приглашение, чтобы присоединиться к семейной группе и делиться подписками и сервисами.')}
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
                        {t('profile.family.invitePage.loadErrorTitle', 'Не удалось распознать приглашение')}
                      </p>
                      <p className={`${themeClasses.text.secondary} text-sm`}>
                        {loadError || (detailsError as any)?.response?.data?.message || (detailsError as any)?.message || t('profile.family.invitePage.invalidDescription', 'Проверьте, что вы открыли актуальную ссылку приглашения из семейной группы, или попросите отправить новое приглашение.')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="primary" onClick={goToFamily}>
                      {t('profile.family.invitePage.backToFamily', 'Перейти в раздел «Семья»')}
                    </Button>
                  </div>
                </div>
              ) : invitationDetails ? (
                <>
                  <div className="space-y-3">
                    {!user ? (
                      <p className={themeClasses.text.primary}>
                        {t(
                          'profile.family.invitePage.description',
                          'Чтобы завершить присоединение к семье, войдите в свой аккаунт или создайте новый. После входа вы сможете управлять семейной группой на странице «Семья».'
                        )}
                      </p>
                    ) : (
                      <p className={themeClasses.text.primary}>
                        {t(
                          'profile.family.invitePage.acceptDescription',
                          'Вы можете принять или отклонить это приглашение.'
                        )}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      {user && token ? (
                        <>
                          <Button 
                            variant="primary"
                            className="flex-1"
                            onClick={handleAccept}
                            loading={isAccepting}
                            disabled={isAccepting || isDeclining}
                          >
                            {t('profile.family.invitePage.accept', 'Принять приглашение')}
                          </Button>
                          <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={handleDecline}
                            loading={isDeclining}
                            disabled={isAccepting || isDeclining}
                          >
                            {t('profile.family.invitePage.decline', 'Отклонить')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="primary"
                            className="flex-1"
                            onClick={goToAuth}
                          >
                            {t('profile.family.invitePage.loginOrRegister', 'Войти или зарегистрироваться')}
                          </Button>
                          <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={goToFamily}
                          >
                            {t('profile.family.invitePage.goToFamily', 'Перейти в семейную группу')}
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
                    {t('profile.family.invitePage.invalidTitle', 'Не удалось распознать приглашение')}
                  </p>
                  <p className={`${themeClasses.text.secondary} text-sm`}>
                    {t(
                      'profile.family.invitePage.invalidDescription',
                      'Проверьте, что вы открыли актуальную ссылку приглашения из семейной группы, или попросите отправить новое приглашение.'
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="primary" onClick={goToFamily}>
                  {t('profile.family.invitePage.backToFamily', 'Перейти в раздел «Семья»')}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

export default FamilyInvitePage;


