import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore, useLanguageStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { buildPathWithLang } from '@/utils/routing';

export const useRegister = () => {
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
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
      const currentLang = language || 'ru';
      navigate(buildPathWithLang('/dashboard', currentLang));
    },
  });
};

