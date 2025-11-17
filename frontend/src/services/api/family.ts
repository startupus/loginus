import { apiClient } from './client';

export const familyApi = {
  getMembers: () => apiClient.get('/family/members'),
  inviteMember: (data: { email: string; role: 'member' | 'child' }) => 
    apiClient.post('/family/invite', data),
  createChildAccount: (data: { name: string; birthDate: string }) => 
    apiClient.post('/family/child-account', data),
};

