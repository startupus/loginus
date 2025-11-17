import { apiClient } from './client';

export const paymentApi = {
  getMethods: () => apiClient.get('/payment/methods'),
  addMethod: (data: any) => apiClient.post('/payment/methods', data),
  getHistory: () => apiClient.get('/payment/history'),
};

