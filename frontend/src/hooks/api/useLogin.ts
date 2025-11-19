import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { useAuthStore, useLanguageStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { buildPathWithLang } from '@/utils/routing';

export const useLogin = () => {
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ loginValue, password }: { loginValue: string; password: string }) =>
      authApi.login(loginValue, password),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      const currentLang = language || 'ru';
      navigate(buildPathWithLang('/dashboard', currentLang));
    },
  });
};

