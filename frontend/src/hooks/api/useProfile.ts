import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// TODO: Добавить методы getSecuritySettings и getSessions в profileApi
// export const useSecuritySettings = () => {
//   return useQuery({
//     queryKey: ['security-settings'],
//     queryFn: () => profileApi.getSecuritySettings(),
//   });
// };

// export const useSessions = () => {
//   return useQuery({
//     queryKey: ['sessions'],
//     queryFn: () => profileApi.getSessions(),
//   });
// };

