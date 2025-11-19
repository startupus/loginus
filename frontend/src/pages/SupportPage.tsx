import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/design-system/layouts';
import { Button, Icon } from '@/design-system/primitives';

const SupportPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState<string>('id');

  const services = [
    { id: 'id', name: 'Loginus ID', icon: 'user' },
    { id: 'plus', name: 'Loginus Plus', icon: 'star' },
    { id: 'mail', name: t('support.services.mail', 'Почта'), icon: 'mail' },
    { id: 'disk', name: t('support.services.disk', 'Диск'), icon: 'hard-drive' },
    { id: 'other', name: t('support.services.other', 'Другой сервис'), icon: 'grid' },
  ];

  return (
    <PageTemplate 
      title={t('sidebar.support', 'Поддержка')}
      showSidebar={true}
      showFooter={false}
      headerActions={
        <div className="relative">
          <Button variant="outline" size="sm" className="gap-2">
            <span>{t('support.selectService', 'Выбрать сервис')}</span>
            <Icon name="chevron-down" size="sm" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Chat Header */}
        <div className="bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 rounded-t-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="message-circle" className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-dark dark:text-white">
                {t('support.chat.title', 'Поддержка Loginus ID')}
              </h3>
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{t('support.chat.online', 'В сети')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 bg-white dark:bg-dark-2 border-x border-stroke dark:border-dark-3 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Bot Welcome Message */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="message-circle" size="sm" className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-dark-3 rounded-2xl rounded-tl-none p-4">
                  <p className="text-dark dark:text-white">
                    {t('support.chat.welcome', 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.')}
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-2">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>

            {/* Service Selection Buttons */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="message-circle" size="sm" className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-dark-3 rounded-2xl rounded-tl-none p-4 mb-3">
                  <p className="text-dark dark:text-white mb-4">
                    {t('support.chat.selectTopic', 'Выберите тему вашего вопроса:')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <Button
                        key={service.id}
                        variant={selectedService === service.id ? 'primary' : 'outline'}
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => setSelectedService(service.id)}
                      >
                        <Icon name={service.icon} size="sm" />
                        <span>{service.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input Area */}
        <div className="bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 rounded-b-lg p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                placeholder={t('support.chat.placeholder', 'Напишите ваш вопрос...')}
                className="w-full px-4 py-3 rounded-lg border border-stroke dark:border-dark-3 bg-transparent text-dark dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:border-primary"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="px-3">
                <Icon name="paperclip" size="sm" />
              </Button>
              <Button variant="primary" size="sm" className="gap-2">
                <Icon name="send" size="sm" />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {t('support.chat.fileSupport', 'Вы можете прикрепить файлы и скриншоты')}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SupportPage;
