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
  // Mock data - история чатов
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
    {
      id: 'kinopoisk',
      name: 'Поддержка Кинопоиска',
      service: 'Kinopoisk',
      date: '7.06.25',
    },
    {
      id: 'alice',
      name: 'Поддержка умных устройств с Алисой',
      service: 'Alice',
      date: '9.06.24',
    },
  ];

  // Закрытые обращения
  private closedChats: ChatHistoryItem[] = [
    { id: 'go', name: 'Go', service: 'Go', date: '' },
    { id: 'market', name: 'Маркет', service: 'Market', date: '' },
    { id: 'food', name: 'Еда', service: 'Food', date: '' },
  ];

  // Сервисы для выбора
  private services: SupportServiceItem[] = [
    { id: 'id', name: 'Loginus ID', icon: 'user' },
    { id: 'plus', name: 'Loginus Plus', icon: 'star' },
    { id: 'mail', name: 'Почта', icon: 'mail' },
    { id: 'disk', name: 'Диск', icon: 'hard-drive' },
    { id: 'other', name: 'Другой сервис', icon: 'grid' },
  ];

  // Сообщения чатов
  private messages: ChatMessage[] = [
    {
      id: '1',
      chatId: 'id',
      sender: 'bot',
      message: 'Здравствуйте! Я помогу вам разобраться с вопросами по Loginus ID.',
      timestamp: new Date().toISOString(),
    },
  ];

  /**
   * Получить историю чатов
   */
  getChatHistory() {
    return {
      success: true,
      data: {
        active: this.chatHistory,
        closed: this.closedChats,
      },
    };
  }

  /**
   * Получить сообщения чата
   */
  getChatMessages(chatId: string) {
    const chatMessages = this.messages.filter((msg) => msg.chatId === chatId);
    return {
      success: true,
      data: chatMessages,
    };
  }

  /**
   * Отправить сообщение
   */
  sendMessage(chatId: string, message: string) {
    const newMessage: ChatMessage = {
      id: String(this.messages.length + 1),
      chatId,
      sender: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(newMessage);

    // Обновить lastMessage в истории
    const chat = this.chatHistory.find((c) => c.id === chatId);
    if (chat) {
      chat.lastMessage = message;
      chat.date = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      success: true,
      data: newMessage,
    };
  }

  /**
   * Получить список сервисов
   */
  getServices() {
    return {
      success: true,
      data: this.services,
    };
  }

  /**
   * Создать новый чат
   */
  createChat(serviceId: string) {
    const service = this.services.find((s) => s.id === serviceId);
    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    const newChat: ChatHistoryItem = {
      id: `chat-${Date.now()}`,
      name: `Поддержка ${service.name}`,
      service: service.name,
      isOnline: true,
      lastMessage: '',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
    };

    this.chatHistory.unshift(newChat);
    return {
      success: true,
      data: newChat,
    };
  }

  /**
   * Редактировать сообщение
   * Можно редактировать только сообщения пользователя в течение 5 минут после отправки
   */
  editMessage(chatId: string, messageId: string, newMessage: string) {
    const message = this.messages.find(
      (msg) => msg.id === messageId && msg.chatId === chatId && msg.sender === 'user'
    );

    if (!message) {
      return {
        success: false,
        error: 'Message not found or cannot be edited',
      };
    }

    // Проверка времени редактирования (5 минут = 300000 мс)
    const messageTime = new Date(message.timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = currentTime - messageTime;
    const EDIT_TIME_LIMIT = 5 * 60 * 1000; // 5 минут

    if (timeDiff > EDIT_TIME_LIMIT) {
      return {
        success: false,
        error: 'Message cannot be edited after 5 minutes',
      };
    }

    // Обновляем сообщение
    message.message = newMessage;
    message.edited = true;
    message.editedAt = new Date().toISOString();

    // Обновляем lastMessage в истории
    const chat = this.chatHistory.find((c) => c.id === chatId);
    if (chat) {
      chat.lastMessage = newMessage;
      chat.date = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      success: true,
      data: message,
    };
  }
}

