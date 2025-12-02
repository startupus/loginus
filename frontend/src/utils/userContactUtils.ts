/**
 * Утилиты для работы с контактными данными пользователя
 * Используются для правильного отображения email и телефона
 * вместо сгенерированных значений для GitHub/Telegram пользователей
 */

/**
 * Проверяет, является ли email сгенерированным (псевдо-email)
 */
export const isGeneratedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.includes('@github.local') || email.includes('@telegram.local');
};

/**
 * Получает правильный email для отображения
 * Приоритет: githubEmail > email (если не сгенерированный)
 * Если email сгенерированный (@github.local или @telegram.local), скрываем его если нет реального
 */
export const getDisplayEmail = (user: {
  email?: string | null;
  githubEmail?: string | null;
}): string | null => {
  // Если есть реальный email от GitHub, используем его
  if (user.githubEmail && !isGeneratedEmail(user.githubEmail)) {
    return user.githubEmail;
  }
  
  // Если основной email не сгенерированный, используем его
  if (user.email && !isGeneratedEmail(user.email)) {
    return user.email;
  }
  
  // Если основной email сгенерированный, но есть githubEmail (даже если тоже сгенерированный), используем его
  if (user.githubEmail) {
    return user.githubEmail;
  }
  
  // Если основной email сгенерированный и нет githubEmail, возвращаем null (не показываем сгенерированный)
  if (user.email && isGeneratedEmail(user.email)) {
    return null;
  }
  
  // Иначе возвращаем основной email
  return user.email || null;
};

/**
 * Получает правильный телефон для отображения
 * Приоритет: telegramPhone > phone
 */
export const getDisplayPhone = (user: {
  phone?: string | null;
  telegramPhone?: string | null;
}): string | null => {
  // Если есть телефон от Telegram, используем его
  if (user.telegramPhone) {
    return user.telegramPhone;
  }
  
  // Иначе используем основной телефон
  return user.phone || null;
};

