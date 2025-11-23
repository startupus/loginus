import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  // Mock data
  private methods = [
    { id: '1', type: 'card', lastFour: '4242', bankName: 'Visa', status: 'active', expiryDate: '12/25' },
    { id: '2', type: 'bank_account', bankName: 'Сбербанк', accountNumber: '****1234', status: 'active' },
  ];

  private history = [
    {
      id: '1',
      title: 'Подписка Плюса',
      description: 'МАТЧ! ФУТБОЛ',
      amount: -380,
      currency: '₽',
      date: '2025-01-15',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Подписка Плюса',
      description: 'Дополнительная опция Алиса Про',
      amount: -100,
      currency: '₽',
      date: '2025-01-10',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Подписка Плюса',
      description: 'Дополнительная опция Путешественникам',
      amount: -200,
      currency: '₽',
      date: '2025-01-08',
      status: 'completed',
    },
  ];

  getMethods() {
    return {
      success: true,
      data: this.methods,
    };
  }

  addMethod(methodDto: any) {
    const newMethod = {
      id: String(this.methods.length + 1),
      ...methodDto,
      status: 'active',
    };
    this.methods.push(newMethod);
    return {
      success: true,
      data: newMethod,
    };
  }

  getHistory() {
    return {
      success: true,
      data: this.history,
    };
  }
}

