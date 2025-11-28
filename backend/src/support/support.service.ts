import { Injectable } from '@nestjs/common';

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

export interface SupportServiceItem {
  id: string;
  name: string;
  icon: string;
}

@Injectable()
export class SupportService {
  // Временно возвращаем мок-данные
  private chatHistory: ChatHistoryItem[] = [
    {
      id: 'id',
      name: 'Поддержка Loginus ID',
      service: 'Loginus ID',
      isOnline: true,
      lastMessage: 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
    },
  ];

  private closedChats: ChatHistoryItem[] = [];

  private services: SupportServiceItem[] = [
    { id: 'id', name: 'Loginus ID', icon: 'user' },
    { id: 'plus', name: 'Loginus Plus', icon: 'star' },
    { id: 'mail', name: 'Почта', icon: 'mail' },
    { id: 'disk', name: 'Диск', icon: 'hard-drive' },
    { id: 'other', name: 'Другой сервис', icon: 'grid' },
  ];

  private messages: ChatMessage[] = [
    {
      id: '1',
      chatId: 'id',
      sender: 'bot',
      message: 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.',
      timestamp: new Date().toISOString(),
    },
  ];

  getChatHistory() {
    return {
      active: this.chatHistory,
      closed: this.closedChats,
    };
  }

  getChatMessages(chatId: string) {
    const chatMessages = this.messages.filter((msg) => msg.chatId === chatId);
    return {
      messages: chatMessages,
    };
  }

  sendMessage(chatId: string, message: string) {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId,
      sender: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  getServices() {
    return {
      services: this.services,
    };
  }

  createChat(serviceId: string) {
    const service = this.services.find((s) => s.id === serviceId);
    const newChat: ChatHistoryItem = {
      id: `chat_${Date.now()}`,
      name: `Поддержка ${service?.name || 'Сервиса'}`,
      service: service?.name || 'Unknown',
      isOnline: true,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
    };
    this.chatHistory.push(newChat);
    return newChat;
  }

  editMessage(chatId: string, messageId: string, newMessage: string) {
    const message = this.messages.find(
      (msg) => msg.id === messageId && msg.chatId === chatId
    );
    if (message) {
      message.message = newMessage;
      message.edited = true;
      message.editedAt = new Date().toISOString();
    }
    return message;
  }
}

