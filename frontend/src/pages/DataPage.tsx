import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { profileApi } from '@/services/api/profile';
import { personalApi } from '@/services/api/personal';
import { familyApi } from '@/services/api/family';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { useCurrentLanguage, buildPathWithLang } from '@/utils/routing';
import { useModal } from '@/hooks/useModal';
import type { DocumentType, AddressType } from '@/components/Modals';
import { 
  ProfileCard,
  DocumentsGrid,
  AddressesGrid,
  VehiclesSection,
  PetsSection,
  ContactsSection,
  ExternalAccountsSection,
  PublicDataSection,
  DataManagementSection,
  FamilyMembers,
} from '@/components/Dashboard';
import { appQueryClient } from '@/providers/RootProvider';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { preloadModule } from '@/services/i18n/config';

// Lazy loading для модалок - загружаются только при открытии (оптимизация первой загрузки)
const AddDocumentModal = lazy(() => import('@/components/Modals/AddDocumentModal').then(m => ({ default: m.AddDocumentModal })));
const AddAddressModal = lazy(() => import('@/components/Modals/AddAddressModal').then(m => ({ default: m.AddAddressModal })));
const AddVehicleModal = lazy(() => import('@/components/Modals/AddVehicleModal').then(m => ({ default: m.AddVehicleModal })));
const AddPetModal = lazy(() => import('@/components/Modals/AddPetModal').then(m => ({ default: m.AddPetModal })));
const EditProfileModal = lazy(() => import('@/components/Modals/EditProfileModal').then(m => ({ default: m.EditProfileModal })));
const EditAvatarModal = lazy(() => import('@/components/Modals/EditAvatarModal').then(m => ({ default: m.EditAvatarModal })));
const DeleteProfileModal = lazy(() => import('@/components/Modals/DeleteProfileModal').then(m => ({ default: m.DeleteProfileModal })));
const InviteFamilyMemberModal = lazy(() => import('@/components/Modals/InviteFamilyMemberModal').then(m => ({ default: m.InviteFamilyMemberModal })));

// Компонент скелетона для Suspense fallback
const SectionSkeleton: React.FC = () => (
  <div className="w-full animate-pulse">
    <div className={`${themeClasses.card.rounded} p-6`}>
      <div className={`h-4 ${themeClasses.background.gray2} rounded w-1/4 mb-4`}></div>
      <div className="space-y-3">
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-full`}></div>
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-5/6`}></div>
        <div className={`h-3 ${themeClasses.background.gray2} rounded w-4/6`}></div>
      </div>
    </div>
  </div>
);

const personalDataQueryKey = ['personal-data'] as const;

const fetchPersonalData = async () => {
  const startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  try {
    // Параллельно загружаем все данные
    // Используем getDashboard вместо getProfile, чтобы получить balance и gamePoints
    const [documentsRes, addressesRes, petsRes, vehiclesRes, dashboardRes] = await Promise.all([
      personalApi.getDocuments(),
      personalApi.getAddresses(),
      personalApi.getPets(),
      personalApi.getVehicles(),
      profileApi.getDashboard(),
    ]);

    if (process.env.NODE_ENV === 'development' && startTime) {
      const endTime = performance.now();
      console.log(`[PersonalData] API request: ${(endTime - startTime).toFixed(2)}ms`);
    }

    // Объединяем данные пользователя из dashboard с данными dashboard
    const dashboardData = dashboardRes.data?.data || {};
    const userData = dashboardData.user || {};
    const dashboardInfo = dashboardData.dashboard || {};

    return {
      data: {
        documents: documentsRes.data?.data?.documents || [],
        addresses: addressesRes.data?.data?.addresses || [],
        pets: Array.isArray(petsRes.data?.data) ? petsRes.data.data : [],
        vehicles: Array.isArray(vehiclesRes.data?.data) ? vehiclesRes.data.data : [],
        // Объединяем user с данными из dashboard (balance, gamePoints и т.д.)
        user: {
          ...userData,
          balance: dashboardInfo.balance,
          gamePoints: dashboardInfo.gamePoints,
          achievements: dashboardInfo.achievements,
        },
        // Добавляем данные о семейной группе
        family: dashboardInfo.family || [],
        familyIsCreator: dashboardInfo.familyIsCreator || false,
      }
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development' && startTime) {
      const endTime = performance.now();
      console.error(`[PersonalData] API error after ${(endTime - startTime).toFixed(2)}ms:`, err);
    }
    throw err;
  }
};

if (typeof window !== 'undefined') {
  void appQueryClient.prefetchQuery({
    queryKey: personalDataQueryKey,
    queryFn: fetchPersonalData,
  });
  void preloadModule('data');
  void preloadModule('profile');
}

/**
 * DataPage - страница персональных данных пользователя
 * Стиль и структура соответствуют DashboardPage для единообразия
 */
const DataPage: React.FC = () => {
  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ВЫЗВАНЫ В НАЧАЛЕ, ДО ЛЮБЫХ УСЛОВНЫХ ВОЗВРАТОВ
  const { t, i18n } = useTranslation();
  const { updateUser, login } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentLang = useCurrentLanguage();
  
  // Модалки - все хуки должны быть вызваны до условных возвратов
  const documentModal = useModal();
  const addressModal = useModal();
  const vehicleModal = useModal();
  const petModal = useModal();
  const editProfileModal = useModal();
  const editAvatarModal = useModal();
  const deleteProfileModal = useModal();
  const familyModal = useModal();
  
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [selectedAddressType, setSelectedAddressType] = useState<AddressType | undefined>();

  // Оптимизация: используем initialData и placeholderData для мгновенного отображения контента
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: personalDataQueryKey,
    queryFn: fetchPersonalData,
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 30 * 60 * 1000, // 30 минут в кэше
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
    placeholderData: (previousData) => previousData,
    initialData: () => {
      const cachedData = queryClient.getQueryData(personalDataQueryKey);
      return cachedData || undefined;
    },
  });

  // Предзагрузка и перезагрузка модулей переводов при смене языка
  useEffect(() => {
    const loadModules = async () => {
      try {
        await Promise.all([
          preloadModule('data'),
          preloadModule('profile'),
          preloadModule('modals'),
        ]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DataPage] Failed to load modules:', error);
        }
      }
    };

    loadModules();

    // Перезагружаем модули при смене языка
    const handleLanguageChanged = async () => {
      try {
        await Promise.all([
          preloadModule('data'),
          preloadModule('profile'),
          preloadModule('modals'),
        ]);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DataPage] Failed to reload modules on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Логирование времени рендеринга компонента (только в dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderStart = performance.now();
      const timer = setTimeout(() => {
        const renderEnd = performance.now();
        console.log(`[PersonalData] Component render: ${(renderEnd - renderStart).toFixed(2)}ms`);
      }, 0);
      return () => clearTimeout(timer);
    }
  });

  // Синхронизируем данные пользователя из API с authStore
  // ВАЖНО: Сохраняем роль и права при обновлении, чтобы не потерять их
  useEffect(() => {
    if (data && typeof data === 'object' && 'data' in data && data.data && typeof data.data === 'object' && 'user' in data.data) {
      const apiUser = (data as any).data.user;
      const currentUser = useAuthStore.getState().user;
      updateUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        avatar: apiUser.avatar,
        // Сохраняем роль и права из текущего состояния, если они не пришли из API
        role: apiUser.role || currentUser?.role,
        companyId: apiUser.companyId !== undefined ? apiUser.companyId : currentUser?.companyId,
        permissions: apiUser.permissions || currentUser?.permissions,
      });
    }
  }, [data, updateUser]);

  // Обработчики для модалок - должны быть определены до условных возвратов
  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: personalDataQueryKey });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    // Также инвалидируем отдельные запросы для страниц документов и адресов
    queryClient.invalidateQueries({ queryKey: ['personal-documents'] });
    queryClient.invalidateQueries({ queryKey: ['personal-addresses'] });
  }, [queryClient]);

  const handleAddDocument = useCallback((type?: string | DocumentType) => {
    const docType = typeof type === 'string' ? type as DocumentType : type;
    setSelectedDocumentType(docType);
    documentModal.open();
  }, [documentModal]);

  const handleAddAddress = useCallback((type?: string | AddressType) => {
    const addrType = typeof type === 'string' ? type as AddressType : type;
    setSelectedAddressType(addrType);
    addressModal.open();
  }, [addressModal]);

  const handleDeleteProfile = useCallback(async (password: string) => {
    try {
      await profileApi.deleteProfile(password);
      window.location.href = '/auth/login';
    } catch (error: any) {
      throw error;
    }
  }, []);

  const handleAddFamilyMember = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DataPage] handleAddFamilyMember called');
      console.log('[DataPage] familyModal:', familyModal);
    }
    familyModal.open();
  }, [familyModal]);

  const handleLoginAsFamilyMember = useCallback(async (member: { id: string; name: string; avatar?: string | null }) => {
    try {
      const response = await familyApi.loginAs(member.id);
      const { user, tokens } = response.data.data;
      
      login(
        {
          id: user.id,
          name: user.name || member.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || member.avatar || undefined,
          role: user.role || 'user',
          companyId: user.companyId || null,
          permissions: user.permissions || [],
        },
        tokens.accessToken,
        tokens.refreshToken
      );
      
      navigate(buildPathWithLang('/dashboard', currentLang));
      
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['personal-data'] });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to login as family member:', error);
      }
    }
  }, [login, navigate, currentLang, queryClient]);

  const handleFamilyInviteSuccess = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['personal-data'] }),
    ]);
    familyModal.close();
  }, [queryClient, familyModal]);

  // Логирование для отладки
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && data) {
      const personalData = data && typeof data === 'object' && 'data' in data ? (data as any).data : undefined;
      if (personalData) {
        console.log('[DataPage] personalData:', {
          familyCount: personalData?.family?.length || 0,
          familyIsCreator: personalData?.familyIsCreator,
        });
      }
    }
  }, [data]);

  // ТЕПЕРЬ МОЖЕМ ДЕЛАТЬ УСЛОВНЫЕ ВОЗВРАТЫ - ВСЕ ХУКИ УЖЕ ВЫЗВАНЫ
  const personalData = data && typeof data === 'object' && 'data' in data ? (data as any).data : undefined;
  const user = personalData?.user;
  const showSkeleton = !data && (isLoading || isFetching);

  if (error) {
    return (
      <PageTemplate title={t('sidebar.data', 'Данные')} showSidebar={true}>
        <div className={themeClasses.state.error}>
          <div className="text-center">
            <p className={themeClasses.text.secondary}>
              {t('errors.500Description', 'Что-то пошло не так. Мы уже работаем над исправлением.')}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Если нет данных после загрузки - показываем сообщение
  if (!personalData || !user) {
    if (showSkeleton) {
      return (
        <PageTemplate title={t('sidebar.data', 'Данные')} showSidebar={true}>
          <div className="space-y-4 sm:space-y-6">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </PageTemplate>
      );
    }
    return (
      <PageTemplate title={t('sidebar.data', 'Данные')} showSidebar={true}>
        <div className={themeClasses.state.error}>
          <p className={themeClasses.text.secondary}>{t('common.noData', 'Нет данных')}</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('sidebar.data', 'Данные')} 
      showSidebar={true}
      showHeaderNav={false}
      userData={{
        id: user.id || '1',
        name: user.name,
        phone: user.phone,
        email: user.email,
        login: user.login,
        avatar: user.avatar,
      }}
    >
      {/* Индикатор обновления данных (не блокирует контент) */}
      {isFetching && !isLoading && (
        <div className={`fixed top-20 right-4 z-50 ${themeClasses.background.primarySemiTransparent10} ${themeClasses.border.primarySemi20} ${themeClasses.card.rounded} ${themeClasses.spacing.p3} ${themeClasses.typographySize.bodyXSmall} ${themeClasses.text.primary} animate-pulse`}>
          {t('common.updating', 'Обновление...')}
        </div>
      )}
      
      <div className="space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <div className="w-full animate-fade-in" style={{ animationDelay: '0ms' }}>
          <ProfileCard
            user={{
              name: user.name,
              phone: user.phone,
              email: user.email,
              avatar: user.avatar,
              balance: user.balance,
              gamePoints: user.gamePoints,
              achievements: user.achievements,
            }}
            onEdit={editProfileModal.open}
            onEditAvatar={editAvatarModal.open}
          />
        </div>

        {/* Documents Section - полная ширина */}
        <div className="w-full mb-6">
          <DocumentsGrid
            documents={personalData?.documents || []}
            onAddDocument={handleAddDocument}
          />
        </div>

        {/* Addresses Section - полная ширина */}
        <div className="w-full mb-6">
          <AddressesGrid
            addresses={personalData?.addresses || []}
            onAddAddress={handleAddAddress}
          />
        </div>

        {/* Vehicles Section - полная ширина */}
        <div className="w-full mb-6">
          <VehiclesSection
            vehicles={personalData?.vehicles || []}
            onAddVehicle={vehicleModal.open}
          />
        </div>

        {/* Pets Section - полная ширина */}
        <div className="w-full mb-6">
          <PetsSection
            pets={personalData?.pets || []}
            onAddPet={petModal.open}
          />
        </div>

        {/* Family Section - полная ширина */}
        <div className="w-full mb-6">
          <FamilyMembers
            members={personalData?.family || []}
            onAddMember={personalData?.familyIsCreator ? handleAddFamilyMember : undefined}
            onMemberClick={(member) => {
              if (process.env.NODE_ENV === 'development') {
                console.log('Open member:', member);
              }
            }}
            onLoginAs={handleLoginAsFamilyMember}
            isCreator={personalData?.familyIsCreator || false}
          />
        </div>

        {/* Contacts Section - полная ширина */}
        <div className="w-full mb-6">
          <ContactsSection
            contacts={[
              {
                type: 'email',
                label: t('data.contacts.email', 'Email in Loginus'),
                value: user.email || '',
              },
              {
                type: 'phone',
                label: t('data.contacts.mainPhone', 'Primary phone'),
                value: user.phone || '',
                href: '/security/phones',
              },
              {
                type: 'backup-email',
                label: t('data.contacts.backupEmail', 'Backup email'),
                value: '', // TODO: добавить поле backupEmail в user
              },
            ]}
          />
        </div>

        {/* External Accounts Section - полная ширина */}
        <div className="w-full mb-6">
          <ExternalAccountsSection
            accounts={[]} // TODO: получить список подключенных аккаунтов из API
            onConnect={(providerId) => {
              // TODO: реализовать подключение аккаунта
              console.log('Connect account:', providerId);
            }}
            onDisconnect={(providerId) => {
              // TODO: реализовать отключение аккаунта
              console.log('Disconnect account:', providerId);
            }}
          />
        </div>

        {/* Public Data Section - полная ширина */}
        <div className="w-full mb-6">
          <PublicDataSection
            items={[
              {
                id: 'public-profile',
                label: t('data.publicData.profile', 'Public profile in Loginus search'),
                href: '/personal/public-profile',
                icon: 'globe',
              },
              {
                id: 'reviews',
                label: t('data.publicData.reviews', 'Your reviews and ratings'),
                href: '/reviews',
                icon: 'star',
              },
              {
                id: 'public-address',
                label: t('data.publicData.address', 'Add public address'),
                description: t('data.publicData.addressDesc', 'For your pages in Loginus'),
                onClick: () => {
                  // TODO: открыть модалку добавления публичного адреса
                  console.log('Add public address');
                },
                icon: 'map-pin',
              },
            ]}
          />
        </div>

        {/* Data Management Section - полная ширина */}
        <div className="w-full mb-6">
          <DataManagementSection
            items={[
              {
                id: 'inclusion',
                label: t('data.dataManagement.inclusion', 'Accessibility'),
                href: '/personal/inclusion',
                icon: 'settings',
              },
              {
                id: 'data-access',
                label: t('data.dataManagement.access', 'Data Access'),
                href: '/personal/data-access',
                icon: 'key',
              },
              {
                id: 'notifications',
                label: t('data.dataManagement.notifications', 'Service Notifications'),
                href: '/personal/communication-preferences',
                icon: 'bell',
              },
              {
                id: 'data-on-services',
                label: t('data.dataManagement.services', 'Data on Services'),
                href: '/personal/data',
                icon: 'cloud',
              },
              {
                id: 'delete-profile',
                label: t('data.dataManagement.delete', 'Delete Profile'),
                onClick: deleteProfileModal.open,
                icon: 'trash',
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>

      {/* Модалки - lazy loaded для оптимизации первой загрузки */}
      <Suspense fallback={null}>
        <AddDocumentModal
          isOpen={documentModal.isOpen}
          onClose={documentModal.close}
          onSuccess={refreshData}
          documentType={selectedDocumentType}
        />

        <AddAddressModal
          isOpen={addressModal.isOpen}
          onClose={addressModal.close}
          onSuccess={refreshData}
          addressType={selectedAddressType}
        />

        <AddVehicleModal
          isOpen={vehicleModal.isOpen}
          onClose={vehicleModal.close}
          onSuccess={refreshData}
        />

        <AddPetModal
          isOpen={petModal.isOpen}
          onClose={petModal.close}
          onSuccess={refreshData}
        />

        <EditProfileModal
          isOpen={editProfileModal.isOpen}
          onClose={editProfileModal.close}
          onSuccess={refreshData}
          initialData={{
            name: user.name,
            avatar: user.avatar,
          }}
        />

        <EditAvatarModal
          isOpen={editAvatarModal.isOpen}
          onClose={editAvatarModal.close}
          onSuccess={refreshData}
          initialData={{
            name: user.name,
            avatar: user.avatar,
          }}
        />

        <DeleteProfileModal
          isOpen={deleteProfileModal.isOpen}
          onClose={deleteProfileModal.close}
          onDelete={handleDeleteProfile}
        />

        <InviteFamilyMemberModal
          isOpen={familyModal.isOpen}
          onClose={familyModal.close}
          onSuccess={handleFamilyInviteSuccess}
        />
      </Suspense>
    </PageTemplate>
  );
};

export default DataPage;
