import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ loginValue, password }: { loginValue: string; password: string }) =>
      authApi.login(loginValue, password),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      navigate('/');
    },
  });
};

