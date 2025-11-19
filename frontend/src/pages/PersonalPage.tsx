import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '@/design-system/layouts';
import { DataSection, SeparatedList } from '@/design-system/composites';
import { Button, Icon, Avatar, Separator } from '@/design-system/primitives';
import { personalApi } from '@/services/api/personal';
import { profileApi } from '@/services/api/profile';
import { useAuthStore } from '@/store';
import { getInitials } from '@/utils/stringUtils';
import { Link } from 'react-router-dom';
import {
  AddDocumentModal,
  AddVehicleModal,
  AddAddressModal,
  AddPetModal,
  DeleteProfileModal,
  type DocumentType,
  type AddressType,
} from '@/components/Modals';
import { useModal } from '@/hooks/useModal';

const PersonalPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Модалки
  const documentModal = useModal();
  const vehicleModal = useModal();
  const addressModal = useModal();
  const petModal = useModal();
  const deleteProfileModal = useModal();

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [selectedAddressType, setSelectedAddressType] = useState<AddressType | undefined>();

  const { data: documentsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ['personal-documents'],
    queryFn: () => personalApi.getDocuments(),
  });

  const { data: addressesData, isLoading: isAddrLoading } = useQuery({
    queryKey: ['personal-addresses'],
    queryFn: () => personalApi.getAddresses(),
  });

   const { data: petsData, isLoading: isPetsLoading } = useQuery({
    queryKey: ['personal-pets'],
    queryFn: () => personalApi.getPets(),
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['personal-documents'] });
    queryClient.invalidateQueries({ queryKey: ['personal-addresses'] });
    queryClient.invalidateQueries({ queryKey: ['personal-pets'] });
    queryClient.invalidateQueries({ queryKey: ['personal-vehicles'] });
  };

  const handleAddDocument = (type?: DocumentType) => {
    setSelectedDocumentType(type);
    documentModal.open();
  };

  const handleAddAddress = (type?: AddressType) => {
    setSelectedAddressType(type);
    addressModal.open();
  };

  const handleDeleteProfile = async (password: string) => {
    try {
      await profileApi.deleteProfile(password);
      // После успешного удаления перенаправляем на страницу входа
      window.location.href = '/auth/login';
    } catch (error: any) {
      // Ошибка будет обработана в DeleteProfileModal
      throw error;
    }
  };

  const isLoading = isDocsLoading || isAddrLoading || isPetsLoading;

  if (isLoading) {
    return (
      <PageTemplate title={t('sidebar.data', 'Данные')} showSidebar={true}>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageTemplate>
    );
  }

  const documents = documentsData?.data?.documents || [];
  const addresses = addressesData?.data?.addresses || [];
  const pets = petsData?.data?.pets || [];

  return (
    <PageTemplate 
      title={t('sidebar.data', 'Данные')}
      showSidebar={true}
      contentClassName="space-y-8 max-w-4xl mx-auto"
    >
      {/* Profile Card */}
      <button className="w-full flex items-center gap-4 p-6 bg-white dark:bg-dark-2 rounded-xl border border-stroke dark:border-dark-3 hover:shadow-lg transition-all text-left group">
        <Avatar 
          src={user?.avatar || undefined} 
          size="xl" 
          initials={getInitials(user?.name)} 
          name={user?.name}
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-dark dark:text-white mb-1">{user?.name}</h3>
          <p className="text-body-color dark:text-dark-6">
            {t('personalData.profile.callMe', { name: user?.name })}
          </p>
        </div>
        <div className="p-2 rounded-full bg-gray-100 dark:bg-dark-3 text-gray-500 group-hover:text-primary transition-colors">
          <Icon name="edit-2" size="sm" />
        </div>
      </button>

      {/* Documents Section */}
      <DataSection
        id="documents"
        title={t('personalData.documents.title', 'Документы')}
        description={t('personalData.documents.description', 'В ID ваши документы всегда под рукой')}
        viewAllLink={{
           label: t('personalData.documents.viewAll', 'Все документы'),
           href: '/personal/documents',
           icon: 'file-text'
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {documents.slice(0, 4).map((doc: any) => (
              <button
                key={doc.type}
                onClick={() => handleAddDocument(doc.type)}
                className="p-4 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:shadow-md transition-shadow flex flex-col items-center gap-3 text-center group h-full"
              >
                  <div className="p-3 rounded-full bg-primary/5 dark:bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Icon name={doc.icon || 'file-text'} size="lg" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="font-medium text-sm dark:text-white mb-1">{doc.label || doc.type}</div>
                    {!doc.added && (
                         <span className="text-xs text-gray-500 group-hover:text-primary transition-colors flex items-center gap-1 justify-center">
                           <Icon name="plus" size="sm" />
                           {t('common.add', 'Добавить')}
                         </span>
                    )}
                  </div>
              </button>
            ))}
        </div>
      </DataSection>

      {/* Vehicles Section */}
      <DataSection
        id="auto"
        title={t('personalData.vehicles.title', 'Автомобили')}
      >
        <Button 
          variant="outline" 
          onClick={vehicleModal.open}
          className="w-full justify-start gap-3 h-auto py-4 px-6 border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <div className="p-2 rounded-full bg-gray-100 dark:bg-dark-3 text-gray-500">
            <Icon name="truck" size="lg" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-dark dark:text-white">
              {t('personalData.vehicles.add', 'Добавить автомобиль')}
            </div>
          </div>
          <Icon name="plus" className="text-gray-400" />
        </Button>
      </DataSection>

      {/* Pets Section */}
      <DataSection
        id="pets"
        title={t('personalData.pets.title', 'Питомцы')}
        description={t('personalData.pets.description', 'Поможем хранить документы, подобрать корм или записать к ветеринару')}
        viewAllLink={{
          label: t('personalData.pets.viewAll', 'Все питомцы'),
          href: '/personal/pets',
          icon: 'github' // using github icon as placeholder for paw
        }}
      >
          {pets.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pets.map((pet: any) => (
                      <div key={pet.id} className="flex items-center gap-4 p-4 bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 hover:shadow-md transition-shadow cursor-pointer">
                           <div className="w-12 h-12 bg-gray-100 dark:bg-dark-3 rounded-full flex items-center justify-center">
                              <Icon name="github" size="lg" className="text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                              <div className="font-medium dark:text-white">{pet.name}</div>
                              <div className="text-sm text-gray-500">{pet.type}</div>
                          </div>
                      </div>
                  ))}
               </div>
          ) : (
             <Button 
               variant="outline" 
               onClick={petModal.open}
               className="w-full justify-start gap-3 h-auto py-4 px-6 border-dashed border-2 hover:border-primary hover:bg-primary/5"
             >
                 <div className="p-2 rounded-full bg-gray-100 dark:bg-dark-3 text-gray-500">
                   <Icon name="github" size="lg" />
                 </div>
                 <div className="flex-1 text-left">
                   <div className="font-medium text-dark dark:text-white">
                     {t('personalData.pets.add', 'Добавить питомца')}
                   </div>
                 </div>
                 <Icon name="plus" className="text-gray-400" />
             </Button>
          )}
      </DataSection>

      {/* Addresses Section */}
      <DataSection
        id="addresses"
        title={t('personalData.addresses.title', 'Адреса')}
        description={t('personalData.addresses.description', 'Для заказа в один клик')}
         viewAllLink={{
           label: t('personalData.addresses.viewAll', 'Все адреса'),
           href: '/personal/addresses',
           icon: 'map-pin'
        }}
      >
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['home', 'work', 'other'].map((type) => {
              const address = addresses.find((a: any) => a.type === type);
              const icon = type === 'home' ? 'home' : type === 'work' ? 'briefcase' : 'map-pin';
              const label = t(`personalData.addresses.${type}`, type);
              
              return (
                <button
                  key={type}
                  onClick={() => handleAddAddress(type as AddressType)}
                  className="p-4 rounded-lg border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 hover:shadow-md transition-shadow flex flex-col items-center gap-3 text-center group h-full"
                >
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-dark-3 text-gray-600 dark:text-gray-300 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                    <Icon name={icon} size="lg" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="font-medium text-sm dark:text-white mb-1">{label}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {address?.address || (
                        <span className="flex items-center gap-1 justify-center group-hover:text-primary transition-colors">
                          <Icon name="plus" size="sm" />
                          {t('common.add', 'Добавить')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </DataSection>

      {/* Contacts Section */}
      <DataSection
        id="contacts"
        title={t('personalData.contacts.title', 'Контакты')}
      >
        <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
          <SeparatedList className="p-4">
            <div className="flex items-center justify-between py-2 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="mail" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('personalData.contacts.email', 'Email в Loginus')}</div>
                  <div className="font-medium dark:text-white">{user?.email}</div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>

            <Link to="/security/phones" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="smartphone" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('personalData.contacts.mainPhone', 'Основной телефон')}</div>
                  <div className="font-medium dark:text-white">{user?.phone}</div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/security/external-accounts" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="link" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                    {t('personalData.contacts.external', 'Добавить внешние аккаунты')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('personalData.contacts.externalDesc', 'Помогут быстрее входить в Loginus и заполнить данные')}
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>
          </SeparatedList>
        </div>
      </DataSection>

      {/* Public Data Section */}
      <DataSection
        id="public-data"
        title={t('personalData.public.title', 'Публичные данные')}
      >
        <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
          <SeparatedList className="p-4">
            <Link to="/personal/public-profile" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="globe" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.public.profile', 'Публичный профиль в поиске Loginus')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/reviews" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="star" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.public.reviews', 'Ваши отзывы и оценки')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <button className="flex items-center justify-between py-2 group w-full text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="map-pin" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                    {t('personalData.public.address', 'Добавить публичный адрес')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('personalData.public.addressDesc', 'Для ваших страниц в Loginus')}
                  </div>
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </button>
          </SeparatedList>
        </div>
      </DataSection>

      {/* Data Management Section */}
      <DataSection
        id="data-management"
        title={t('personalData.management.title', 'Управление данными')}
      >
        <div className="bg-white dark:bg-dark-2 rounded-lg border border-stroke dark:border-dark-3 overflow-hidden">
          <SeparatedList className="p-4">
            <Link to="/personal/inclusion" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="eye" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.management.inclusion', 'Специальные возможности')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/personal/data-access" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="key" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.management.access', 'Доступы к данным')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/personal/communication-preferences" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="bell" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.management.notifications', 'Уведомления сервисов')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Link to="/personal/data" className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-dark-3 rounded-lg">
                   <Icon name="database" size="md" className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="font-medium dark:text-white group-hover:text-primary transition-colors">
                  {t('personalData.management.services', 'Данные на сервисах')}
                </div>
              </div>
              <Icon name="chevron-right" size="sm" className="text-gray-400 group-hover:text-primary transition-colors" />
            </Link>

            <Separator />

            <button 
              onClick={deleteProfileModal.open}
              className="flex items-center justify-between py-2 group w-full text-left text-red-500 hover:text-red-600"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                   <Icon name="trash-2" size="md" className="text-red-500" />
                </div>
                <div className="font-medium transition-colors">
                  {t('personalData.management.delete', 'Удалить профиль')}
                </div>
              </div>
            </button>
          </SeparatedList>
        </div>
      </DataSection>

      {/* Модалки */}
      <AddDocumentModal
        isOpen={documentModal.isOpen}
        onClose={documentModal.close}
        onSuccess={refreshData}
        documentType={selectedDocumentType}
      />

      <AddVehicleModal
        isOpen={vehicleModal.isOpen}
        onClose={vehicleModal.close}
        onSuccess={refreshData}
      />

      <AddAddressModal
        isOpen={addressModal.isOpen}
        onClose={addressModal.close}
        onSuccess={refreshData}
        addressType={selectedAddressType}
      />

      <AddPetModal
        isOpen={petModal.isOpen}
        onClose={petModal.close}
        onSuccess={refreshData}
      />

      <DeleteProfileModal
        isOpen={deleteProfileModal.isOpen}
        onClose={deleteProfileModal.close}
        onDelete={handleDeleteProfile}
      />
    </PageTemplate>
  );
};

export default PersonalPage;
