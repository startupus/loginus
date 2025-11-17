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
      type: 'subscription',
      description: 'Яндекс Плюс',
      amount: '399 ₽',
      date: '2025-01-15',
      status: 'completed',
      method: 'Visa •••• 4242',
    },
    {
      id: '2',
      type: 'topup',
      description: 'Пополнение',
      amount: '1 000 ₽',
      date: '2025-01-10',
      status: 'completed',
      method: 'Сбербанк',
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

