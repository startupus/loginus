import { apiClient } from './client';

export const familyApi = {
  getMembers: () => apiClient.get('/family/members'),
  inviteMember: (data: { role: 'member' | 'child' }) => 
    apiClient.post('/family/invite', data),
  createChildAccount: (data: { name: string; birthDate: string }) =>
    apiClient.post('/family/child-account', data),
  loginAs: (memberId: string) =>
    apiClient.post('/family/login-as', { memberId }),
  getInvitationDetails: (token: string) => {
    const url = `/invitations/details?token=${encodeURIComponent(token)}`;
    console.log('[familyApi] getInvitationDetails URL:', url);
    return apiClient.get<{
      success: boolean;
      data: {
        inviterName: string;
        targetName: string;
        roleName: string;
        organizationName?: string;
        teamName?: string;
      };
    }>(url);
  },
  acceptInvitation: (token: string) =>
    apiClient.post('/invitations/accept', { token }),
  deleteFamilyGroup: () =>
    apiClient.post('/family/delete'),
  updateMemberAvatar: (memberId: string, avatarUrl: string) =>
    apiClient.post('/family/update-member-avatar', { memberId, avatarUrl }),
};

