import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Прямые импорты для tree-shaking
import { PageTemplate } from '@/design-system/layouts/PageTemplate';
import { Button } from '@/design-system/primitives/Button';
import { Icon } from '@/design-system/primitives/Icon';
import { Avatar } from '@/design-system/primitives/Avatar';
import { Textarea } from '@/design-system/primitives/Textarea';
import { Spinner } from '@/design-system/primitives/Spinner';
import { ChatMessage, ChatHistory, ChatHeader, ProductCarousel, ErrorState, EmptyState } from '@/design-system/composites';
import type { ProductFolder } from '@/design-system/composites';
import { themeClasses } from '@/design-system/utils/themeClasses';
import { getInitials } from '@/utils/stringUtils';
import { supportApi } from '@/services/api/support';
import { getServiceIcon } from '@/utils/serviceIcons';

// Константы конфигурации
const QUERY_CONFIG = {
  CHAT_HISTORY_STALE_TIME: 5 * 60 * 1000, // 5 минут
  SERVICES_STALE_TIME: 30 * 60 * 1000, // 30 минут
  MESSAGES_STALE_TIME: 1 * 60 * 1000, // 1 минута
  RETRY_COUNT: 1,
} as const;

const SupportPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string>('id');
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [messageInput, setMessageInput] = useState<string>('');
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Автоматическое изменение высоты textarea при вводе текста (кнопки остаются фиксированного размера)
  useEffect(() => {
    const updateHeight = () => {
      if (textareaRef.current) {
        // Сбрасываем высоту для правильного расчета scrollHeight
        textareaRef.current.style.height = 'auto';
        // Получаем высоту содержимого (scrollHeight учитывает padding)
        const scrollHeight = textareaRef.current.scrollHeight;
        // Минимальная высота 46px, максимальная 120px
        const newHeight = Math.max(46, Math.min(scrollHeight, 120));
        // Устанавливаем высоту textarea (box-sizing: border-box учитывает padding и border)
        textareaRef.current.style.height = `${newHeight}px`;
      }
    };

    // Небольшая задержка для правильного расчета после рендера
    const timeoutId = setTimeout(updateHeight, 0);
    updateHeight();
    
    // Обновляем при изменении содержимого
    if (textareaRef.current) {
      textareaRef.current.addEventListener('input', updateHeight);
    }

    return () => {
      clearTimeout(timeoutId);
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('input', updateHeight);
      }
    };
  }, [messageInput]);

  // Загрузка данных через API
  const { data: chatHistoryData, isLoading: isLoadingChats, error: chatHistoryError } = useQuery({
    queryKey: ['support', 'chats'],
    queryFn: async () => {
      try {
        const response = await supportApi.getChatHistory();
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return { active: [], closed: [] };
      } catch (error) {
        console.error('[SupportPage] Error loading chat history:', error);
        // Fallback данные для разработки
        if (process.env.NODE_ENV === 'development') {
          return {
            active: [
              {
                id: 'id',
                name: t('support.chat.title', 'Поддержка Loginus ID'),
                service: 'Loginus ID',
                isOnline: true,
                lastMessage: t('support.chat.welcome', 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.'),
                date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isActive: true,
              },
            ],
            closed: [],
          };
        }
        return { active: [], closed: [] };
      }
    },
    staleTime: QUERY_CONFIG.CHAT_HISTORY_STALE_TIME,
    retry: QUERY_CONFIG.RETRY_COUNT,
  });

  const { data: servicesData, isLoading: isLoadingServices, error: servicesError } = useQuery({
    queryKey: ['support', 'services'],
    queryFn: async () => {
      try {
        const response = await supportApi.getServices();
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('[SupportPage] Error loading services:', error);
        if (process.env.NODE_ENV === 'development') {
          return [
            { id: 'id', name: 'Loginus ID', icon: 'user' },
            { id: 'plus', name: 'Loginus Plus', icon: 'star' },
            { id: 'mail', name: t('support.services.mail', 'Почта'), icon: 'mail' },
            { id: 'disk', name: t('support.services.disk', 'Диск'), icon: 'hard-drive' },
            { id: 'other', name: t('support.services.other', 'Другой сервис'), icon: 'grid' },
          ];
        }
        return [];
      }
    },
    staleTime: QUERY_CONFIG.SERVICES_STALE_TIME,
    retry: QUERY_CONFIG.RETRY_COUNT,
  });

  // Загрузка сообщений для активного чата
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['support', 'messages', activeChatId],
    queryFn: async () => {
      if (!activeChatId) return [];
      try {
        const response = await supportApi.getChatMessages(activeChatId);
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data || [];
        }
        return [];
      } catch (error) {
        console.error('[SupportPage] Error loading messages:', error);
        return [];
      }
    },
    enabled: !!activeChatId,
    staleTime: QUERY_CONFIG.MESSAGES_STALE_TIME,
    retry: QUERY_CONFIG.RETRY_COUNT,
  });

  // Мутация для отправки сообщения
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const response = await supportApi.sendMessage(chatId, message);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Очищаем поле ввода
      setMessageInput('');
      // Обновляем сообщения и историю чатов (используем chatId из variables)
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['support', 'chats'] });
      // Возвращаем фокус в поле ввода после отправки сообщения
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    },
    onError: (error) => {
      console.error('[SupportPage] Error sending message:', error);
    },
  });

  // Мутация для создания нового чата
  const createChatMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await supportApi.createChat(serviceId);
      return response.data;
    },
    onSuccess: (newChat) => {
      // Обновляем историю чатов и переключаемся на новый чат
      queryClient.invalidateQueries({ queryKey: ['support', 'chats'] });
      if (newChat?.id) {
        setActiveChatId(newChat.id);
        // Также обновляем папку на "Все" чтобы показать новый чат
        setActiveFolderId('all');
      }
    },
    onError: (error) => {
      console.error('[SupportPage] Error creating chat:', error);
    },
  });

  // Мутация для редактирования сообщения
  const editMessageMutation = useMutation({
    mutationFn: async ({ chatId, messageId, newMessage }: { chatId: string; messageId: string; newMessage: string }) => {
      const response = await supportApi.editMessage(chatId, messageId, newMessage);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Очищаем поле ввода и режим редактирования
      setMessageInput('');
      setEditingMessageId(null);
      // Обновляем сообщения и историю чатов
      queryClient.invalidateQueries({ queryKey: ['support', 'messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['support', 'chats'] });
      // Возвращаем фокус в поле ввода после редактирования сообщения
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    },
    onError: (error) => {
      console.error('[SupportPage] Error editing message:', error);
      // В случае ошибки (например, истекло время редактирования) сбрасываем режим редактирования
      setEditingMessageId(null);
      setMessageInput('');
    },
  });

  // Извлекаем данные из ответа API с мемоизацией
  const chatHistory = useMemo(
    () => Array.isArray(chatHistoryData?.active) ? chatHistoryData.active : [],
    [chatHistoryData?.active]
  );
  const closedChats = useMemo(
    () => Array.isArray(chatHistoryData?.closed) ? chatHistoryData.closed : [],
    [chatHistoryData?.closed]
  );
  const services = useMemo(
    () => Array.isArray(servicesData) ? servicesData : [],
    [servicesData]
  );
  const messages = useMemo(
    () => Array.isArray(messagesData) ? messagesData : [],
    [messagesData]
  );

  // Инициализируем activeChatId при первой загрузке данных
  useEffect(() => {
    if (chatHistory.length > 0 && !activeChatId) {
      setActiveChatId(chatHistory[0].id);
    }
  }, [chatHistory.length, activeChatId]); // Используем length для избежания лишних перерендеров

  // Находим активный чат с проверкой на существование (мемоизация)
  const activeChat = useMemo(() => {
    if (activeChatId) {
      return chatHistory.find(chat => chat && chat.id === activeChatId) || undefined;
    }
    return chatHistory[0] || undefined;
  }, [activeChatId, chatHistory]);

  /**
   * Обработчик отправки сообщения
   */
  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!activeChatId || !messageInput.trim()) return;
    
    // Если редактируем сообщение
    if (editingMessageId) {
      editMessageMutation.mutate({
        chatId: activeChatId,
        messageId: editingMessageId,
        newMessage: messageInput.trim(),
      });
    } else {
      // Отправляем новое сообщение
      sendMessageMutation.mutate({
        chatId: activeChatId,
        message: messageInput.trim(),
      });
    }
  }, [activeChatId, messageInput, editingMessageId, sendMessageMutation, editMessageMutation]);

  /**
   * Обработчик выбора сервиса (создание нового чата)
   */
  const handleServiceSelect = useCallback(async (serviceId: string) => {
    setSelectedService(serviceId);
    createChatMutation.mutate(serviceId);
  }, [createChatMutation]);

  /**
   * Обработчик нажатия клавиш в textarea (Enter для отправки, ArrowUp для редактирования последнего сообщения)
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'ArrowUp' && !e.shiftKey && !editingMessageId && messageInput.trim() === '') {
      // Стрелка вверх: редактируем последнее сообщение пользователя
      e.preventDefault();
      const userMessages = messages.filter(msg => msg.sender === 'user');
      if (userMessages.length > 0) {
        const lastMessage = userMessages[userMessages.length - 1];
        setEditingMessageId(lastMessage.id);
        setMessageInput(lastMessage.message);
        // Фокус на textarea и установка курсора в конец
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
  }, [handleSendMessage, editingMessageId, messageInput, messages]);

  /**
   * Обработчик редактирования сообщения (из контекстного меню)
   */
  const handleEditMessage = useCallback((messageId: string) => {
    const message = messages.find(msg => msg.id === messageId && msg.sender === 'user');
    if (message) {
      setEditingMessageId(messageId);
      setMessageInput(message.message);
      // Фокус на textarea и установка курсора в конец
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [messages]);

  /**
   * Проверка, можно ли редактировать сообщение (только сообщения пользователя в течение 5 минут)
   */
  const canEditMessage = useCallback((message: typeof messages[0]) => {
    if (message.sender !== 'user') return false;
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - messageTime;
    const EDIT_TIME_LIMIT = 5 * 60 * 1000; // 5 минут
    return timeDiff <= EDIT_TIME_LIMIT;
  }, []);

  // Формируем папки продуктов из сервисов (должно быть до условных return)
  const productFolders: ProductFolder[] = useMemo(() => {
    return services.map(service => ({
      id: service.id,
      name: service.name,
      icon: service.icon,
    }));
  }, [services]);

  // Фильтруем чаты по выбранной папке (должно быть до условных return)
  const filteredChatHistory = useMemo(() => {
    if (activeFolderId === 'all') {
      return chatHistory;
    }
    return chatHistory.filter(chat => chat.service === services.find(s => s.id === activeFolderId)?.name);
  }, [activeFolderId, chatHistory, services]);

  // Loading state
  if (isLoadingChats || isLoadingServices) {
    return (
      <PageTemplate 
        title={t('sidebar.support', 'Поддержка')}
        showSidebar={true}
        showFooter={false}
      >
        <div className={themeClasses.state.loading}>
          <Spinner size="lg" color="primary" />
        </div>
      </PageTemplate>
    );
  }

  // Error state
  if (chatHistoryError || servicesError) {
    return (
      <PageTemplate 
        title={t('sidebar.support', 'Поддержка')}
        showSidebar={true}
        showFooter={false}
      >
        <ErrorState
          title={t('common.error', 'Произошла ошибка при загрузке данных')}
          description={process.env.NODE_ENV === 'development' 
            ? (chatHistoryError?.message || servicesError?.message)
            : undefined
          }
          action={{
            label: t('common.retry', 'Повторить'),
            onClick: () => {
              if (chatHistoryError) queryClient.invalidateQueries({ queryKey: ['chat-history'] });
              if (servicesError) queryClient.invalidateQueries({ queryKey: ['support-services'] });
            }
          }}
        />
      </PageTemplate>
    );
  }

  // Empty state - если нет данных
  if (!isLoadingChats && !isLoadingServices && chatHistory.length === 0 && services.length === 0) {
    return (
      <PageTemplate 
        title={t('sidebar.support', 'Поддержка')}
        showSidebar={true}
        showFooter={false}
      >
        <EmptyState
          icon="message-circle"
          title={t('support.empty', 'Нет доступных чатов')}
          description={t('support.empty.description', 'Начните новый чат с поддержкой')}
          variant="info"
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title={t('sidebar.support', 'Поддержка')}
      showSidebar={true}
      showFooter={false}
      contentClassName="p-3 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:gap-6 min-h-[calc(100vh-140px)]">
        {/* Карусель продуктов - отдельное поле над обоими панелями */}
        <ProductCarousel
          folders={productFolders}
          activeFolderId={activeFolderId}
          onFolderSelect={setActiveFolderId}
          className={`${themeClasses.card.roundedShadow} ${themeClasses.border.default}`}
        />

        {/* Основная область с историей и чатом */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-6 flex-1 min-h-0 relative overflow-hidden">
        {/* Левая панель - История чатов */}
          <div className={`w-full lg:w-80 flex-shrink-0 absolute lg:relative inset-0 lg:inset-auto z-50 lg:z-auto transition-transform duration-300 ease-in-out ${
            showChatHistory ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
        <ChatHistory
              chats={filteredChatHistory}
          closedChats={closedChats}
          activeChatId={activeChatId || undefined}
              onChatSelect={(chatId) => {
                setActiveChatId(chatId);
                setShowChatHistory(false); // Закрываем историю на мобильных после выбора
              }}
          createButtonText={t('support.selectService', 'Выбрать сервис')}
              className="h-full lg:h-auto"
        />
          </div>

        {/* Правая панель - Активный чат */}
          <div className={`flex-1 flex flex-col min-w-0 ${themeClasses.card.roundedShadow} ${themeClasses.border.default} overflow-hidden transition-transform duration-300 ease-in-out ${
            showChatHistory ? 'translate-x-full lg:translate-x-0' : 'translate-x-0'
          }`}>
          {/* Заголовок чата */}
            <div className="relative">
              {/* Кнопка назад на мобильных */}
              <button
                onClick={() => setShowChatHistory(true)}
                className={`lg:hidden absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg ${themeClasses.background.gray2} hover:opacity-80 transition-colors flex items-center justify-center`}
                aria-label={t('support.showHistory', 'Показать историю чатов')}
              >
                {React.createElement(getServiceIcon('arrow-left'), { size: 20 })}
              </button>
            <ChatHeader
              name={activeChat?.name || t('support.chat.title', 'Поддержка Loginus ID')}
              service={activeChat?.service || 'Поддержка'}
              isOnline={activeChat?.isOnline ?? false}
                textLeftPadding="lg:ml-0 ml-10 sm:ml-12"
            />
            </div>

          {/* Область сообщений */}
            <div className={`flex-1 ${themeClasses.background.default} overflow-y-auto p-3 sm:p-6`}>
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="md" color="primary" />
                </div>
              ) : messages.length === 0 ? (
                <>
                  {/* Приветственное сообщение бота */}
                  <ChatMessage
                    sender="bot"
                    message={t('support.chat.welcome', 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.')}
                    timestamp={new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    senderName="Поддержка"
                    initials="П"
                  />

                  {/* Кнопки выбора темы */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Avatar
                        initials="П"
                        name="Поддержка"
                        size="sm"
                        rounded
                      />
                    </div>
                    <div className="flex-1">
                      <div className={`${themeClasses.background.gray2} rounded-2xl rounded-tl-none p-4`}>
                        <p className={`${themeClasses.text.primary} mb-4`}>
                          {t('support.chat.selectTopic', 'Выберите тему вашего вопроса:')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {services.filter(service => service && service.id).map((service) => {
                            const IconComponent = getServiceIcon(service.icon || service.id);
                            return (
                            <Button
                              key={service.id}
                              variant={selectedService === service.id ? 'primary' : 'outline'}
                              size="sm"
                              className="justify-start"
                              onClick={() => handleServiceSelect(service.id)}
                              disabled={createChatMutation.isPending}
                                leftIcon={<IconComponent size={16} />}
                            >
                                {service.name}
                            </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      sender={message.sender}
                      message={message.message}
                      timestamp={new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      senderName={message.sender === 'bot' ? 'Поддержка' : 'Вы'}
                      initials={message.sender === 'bot' ? 'П' : getInitials('Вы')}
                      edited={message.edited}
                      editedAt={message.editedAt}
                      canEdit={canEditMessage(message)}
                      onEdit={handleEditMessage}
                      messageId={message.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Поле ввода */}
          <div className={`${themeClasses.background.default} ${themeClasses.border.top}`} role="region" aria-label={t('support.chat.inputArea', 'Область ввода сообщения')}>
            {/* Индикатор редактирования */}
            {editingMessageId && (() => {
              const editingMessage = messages.find(msg => msg.id === editingMessageId);
              return editingMessage ? (
                <div className="bg-primary/15 dark:bg-primary/25 border-b border-primary/30 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-primary dark:text-primary-light">
                      {React.createElement(getServiceIcon('edit'), { size: 18 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-medium text-primary dark:text-primary-light mb-0.5`}>
                        {t('support.chat.editing', 'Редактирование')}
                      </p>
                      <p className={`text-sm sm:text-base ${themeClasses.text.primary} truncate`}>
                        {editingMessage.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId(null);
                      setMessageInput('');
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center justify-center"
                    aria-label={t('support.chat.cancelEdit', 'Отменить редактирование')}
                  >
                    {React.createElement(getServiceIcon('x'), { size: 18, className: 'text-current' })}
                  </button>
                </div>
              ) : null;
            })()}
            
            <form onSubmit={handleSendMessage} aria-label={t('support.chat.messageForm', 'Форма отправки сообщения')} className="p-2 sm:p-3">
              <div className="flex items-end gap-2">
                {/* Кнопка прикрепления файла */}
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  iconOnly
                  disabled={!activeChatId}
                  style={{ 
                    height: '46px', 
                    width: '46px',
                    flexShrink: 0
                  }}
                  className="p-0 flex items-center justify-center"
                  aria-label={t('support.chat.attachFile', 'Прикрепить файл')}
                >
                  {React.createElement(getServiceIcon('paperclip'), { size: 18, className: 'text-current' })}
                </Button>
                
                {/* Поле ввода */}
                  <Textarea
                    ref={textareaRef}
                    placeholder={editingMessageId ? t('support.chat.editingPlaceholder', 'Редактирование сообщения...') : t('support.chat.placeholder', 'Напишите ваш вопрос...')}
                    rows={1}
                    style={{ 
                      minHeight: '46px', 
                      maxHeight: '120px', 
                      boxSizing: 'border-box',
                      overflowY: 'auto',
                      flex: '1 1 0%',
                      minWidth: 0
                    }}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={!activeChatId || (sendMessageMutation.isPending && !editingMessageId) || editMessageMutation.isPending}
                    fullWidth
                    aria-label={t('support.chat.inputLabel', 'Поле ввода сообщения')}
                  />
                
                {/* Кнопка микрофона или отправки */}
                {messageInput.trim() ? (
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="sm"
                    iconOnly
                    disabled={!activeChatId || (sendMessageMutation.isPending && !editingMessageId) || editMessageMutation.isPending}
                    loading={editingMessageId ? editMessageMutation.isPending : sendMessageMutation.isPending}
                    style={{ 
                      height: '46px', 
                      width: '46px',
                      flexShrink: 0
                    }}
                    className="p-0 flex items-center justify-center"
                    aria-label={editingMessageId ? t('support.chat.saveEdit', 'Сохранить изменения') : t('support.chat.sendMessage', 'Отправить сообщение')}
                  >
                    {React.createElement(getServiceIcon('send'), { size: 20, className: 'text-white' })}
                  </Button>
                ) : editingMessageId ? (
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    iconOnly
                    onClick={() => {
                      setEditingMessageId(null);
                      setMessageInput('');
                    }}
                    style={{ 
                      height: '46px', 
                      width: '46px',
                      flexShrink: 0
                    }}
                    className="p-0 flex items-center justify-center"
                    aria-label={t('support.chat.cancelEdit', 'Отменить редактирование')}
                  >
                    {React.createElement(getServiceIcon('x'), { size: 18, className: 'text-current' })}
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    iconOnly
                    disabled={!activeChatId}
                    style={{ 
                      height: '46px', 
                      width: '46px',
                      flexShrink: 0
                    }}
                    className="p-0 flex items-center justify-center"
                    aria-label={t('support.chat.voiceMessage', 'Голосовое сообщение')}
                  >
                    {React.createElement(getServiceIcon('microphone'), { size: 18, className: 'text-current' })}
                  </Button>
                )}
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default SupportPage;
