import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      phone,
      email,
      password,
    }: {
      phone: string;
      email: string;
      password: string;
    }) => authApi.register(phone, email, password),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      navigate('/');
    },
  });
};

