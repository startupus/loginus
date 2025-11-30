/**
 * Утилита для работы с токенами аутентификации
 */
export const authTokens = {
  /**
   * Сохранить access token
   */
  setAccessToken: (token: string) => {
    localStorage.setItem('accessToken', token);
  },

  /**
   * Получить access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Сохранить refresh token
   */
  setRefreshToken: (token: string) => {
    localStorage.setItem('refreshToken', token);
  },

  /**
   * Получить refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Удалить все токены
   */
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Проверить, есть ли токены
   */
  hasTokens: (): boolean => {
    return !!(authTokens.getAccessToken() && authTokens.getRefreshToken());
  },
};

