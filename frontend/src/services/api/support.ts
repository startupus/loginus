/**
 * Support API - API клиент для работы с поддержкой
 * Использует единый backend API через NestJS
 */

import { apiClient } from './client';

export interface ChatHistoryItem {
  id: string;
  name: string;
  service: string;
  isOnline?: boolean;
  lastMessage?: string;
  date: string;
  isActive?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
}

export interface SupportService {
  id: string;
  name: string;
  icon: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    active: ChatHistoryItem[];
    closed: ChatHistoryItem[];
  };
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
}

export interface ServicesResponse {
  success: boolean;
  data: SupportService[];
}

export const supportApi = {
  /**
   * Получить историю чатов
   */
  getChatHistory: async (): Promise<ChatHistoryResponse> => {
    const response = await apiClient.get('/support/chats');
    return response.data;
  },

  /**
   * Получить сообщения чата
   */
  getChatMessages: async (chatId: string): Promise<ChatMessagesResponse> => {
    const response = await apiClient.get(`/support/chats/${chatId}/messages`);
    return response.data;
  },

  /**
   * Отправить сообщение
   */
  sendMessage: async (chatId: string, message: string): Promise<{ success: boolean; data: ChatMessage }> => {
    const response = await apiClient.post(`/support/chats/${chatId}/messages`, { message });
    return response.data;
  },

  /**
   * Получить список сервисов
   */
  getServices: async (): Promise<ServicesResponse> => {
    const response = await apiClient.get('/support/services');
    return response.data;
  },

  /**
   * Создать новый чат
   */
  createChat: async (serviceId: string): Promise<{ success: boolean; data: ChatHistoryItem }> => {
    const response = await apiClient.post('/support/chats', { serviceId });
    return response.data;
  },

  /**
   * Редактировать сообщение
   */
  editMessage: async (chatId: string, messageId: string, newMessage: string): Promise<{ success: boolean; data: ChatMessage }> => {
    const response = await apiClient.patch(`/support/chats/${chatId}/messages/${messageId}`, { message: newMessage });
    return response.data;
  },
};

