import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { profileApi } from '@/services/api/profile';
import { personalApi } from '@/services/api/personal';
import { useAuthStore } from '@/store';
import { useModal } from '@/hooks/useModal';
import type { DocumentType, AddressType } from '@/components/Modals';
import { ProfileCard } from '@/components/Dashboard/ProfileCard';
import { DocumentsGrid } from '@/components/Dashboard/DocumentsGrid';
import { AddressesGrid } from '@/components/Dashboard/AddressesGrid';
import { appQueryClient } from '@/providers/RootProvider';
import { themeClasses } from '@/design-system/utils/themeClasses';

// Lazy loading для модалок - загружаются только при открытии (оптимизация первой загрузки)
const AddDocumentModal = lazy(() => import('@/components/Modals/AddDocumentModal').then(m => ({ default: m.AddDocumentModal })));
const AddAddressModal = lazy(() => import('@/components/Modals/AddAddressModal').then(m => ({ default: m.AddAddressModal })));
const AddVehicleModal = lazy(() => import('@/components/Modals/AddVehicleModal').then(m => ({ default: m.AddVehicleModal })));
const AddPetModal = lazy(() => import('@/components/Modals/AddPetModal').then(m => ({ default: m.AddPetModal })));
const EditProfileModal = lazy(() => import('@/components/Modals/EditProfileModal').then(m => ({ default: m.EditProfileModal })));
const EditAvatarModal = lazy(() => import('@/components/Modals/EditAvatarModal').then(m => ({ default: m.EditAvatarModal })));
const DeleteProfileModal = lazy(() => import('@/components/Modals/DeleteProfileModal').then(m => ({ default: m.DeleteProfileModal })));

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
}

/**
 * DataPage - страница персональных данных пользователя
 * Стиль и структура соответствуют DashboardPage для единообразия
 */
const DataPage: React.FC = () => {
  const { t } = useTranslation();
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Модалки
  const documentModal = useModal();
  const addressModal = useModal();
  const vehicleModal = useModal();
  const petModal = useModal();
  const editProfileModal = useModal();
  const editAvatarModal = useModal();
  const deleteProfileModal = useModal();
  
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [selectedAddressType, setSelectedAddressType] = useState<AddressType | undefined>();

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

  // Синхронизируем данные пользователя из API с authStore
  useEffect(() => {
    if (data?.data?.user) {
      const apiUser = data.data.user;
      updateUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        avatar: apiUser.avatar,
      });
    }
  }, [data, updateUser]);

  // Оптимизация: показываем skeleton сразу при первой загрузке для мгновенного отображения
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

  const personalData = data?.data;
  const user = personalData?.user;

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

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: personalDataQueryKey });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  // Обработчики для модалок
  const handleAddDocument = (type?: string | DocumentType) => {
    const docType = typeof type === 'string' ? type as DocumentType : type;
    setSelectedDocumentType(docType);
    documentModal.open();
  };

  const handleAddAddress = (type?: string | AddressType) => {
    const addrType = typeof type === 'string' ? type as AddressType : type;
    setSelectedAddressType(addrType);
    addressModal.open();
  };

  const handleDeleteProfile = async (password: string) => {
    try {
      await profileApi.deleteProfile(password);
      window.location.href = '/auth/login';
    } catch (error: any) {
      throw error;
    }
  };

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
        <div className="fixed top-20 right-4 z-50 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 text-xs text-primary animate-pulse">
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

        {/* TODO: Добавить секции для автомобилей, питомцев, контактов, публичных данных и управления данными */}
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
      </Suspense>
    </PageTemplate>
  );
};

export default DataPage;
