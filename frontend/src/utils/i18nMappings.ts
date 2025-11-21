import { TFunction } from 'i18next';

export const getDocumentLabel = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, string> = {
    'passport': 'personalData.documents.passportRF',
    'foreign-passport': 'personalData.documents.foreignPassport',
    'driver-license': 'personalData.documents.driverLicense',
    'vehicle-registration': 'personalData.documents.vehicleRegistration',
    'oms': 'personalData.documents.healthInsurance',
    'snils': 'personalData.documents.snils',
    'diplomas-certificates': 'personalData.documents.diplomasCertificates',
    'diplomas': 'personalData.documents.diplomas',
    'certificates': 'personalData.documents.certificates',
  };
  const key = map[type];
  if (!key) {
    return fallback ?? type;
  }
  const translated = t(key, { defaultValue: fallback ?? type });
  // Если i18next вернул сам ключ (перевод не найден), используем fallback
  if (translated === key || translated.startsWith('personalData.')) {
    return fallback ?? type;
  }
  return translated;
};

export const getAddressLabel = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, string> = {
    'home': 'personalData.addresses.home',
    'work': 'personalData.addresses.work',
    'other': 'personalData.addresses.other',
  };
  const key = map[type];
  if (!key) {
    return fallback ?? type;
  }
  const translated = t(key, { defaultValue: fallback ?? type });
  // Если i18next вернул сам ключ (перевод не найден), используем fallback
  if (translated === key || translated.startsWith('personalData.')) {
    return fallback ?? type;
  }
  return translated;
};

export const getSubscriptionName = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, { key: string; defaultValue: string }> = {
    'monthly': { key: 'dashboard.subscriptions.plan.monthly', defaultValue: 'Месячный' },
    'annual': { key: 'dashboard.subscriptions.plan.annual', defaultValue: 'Годовой' },
    'premium': { key: 'dashboard.subscriptions.plan.premium', defaultValue: 'Премиум' },
    'free': { key: 'dashboard.subscriptions.plan.free', defaultValue: 'Бесплатно' },
  };
  const mapping = map[type];
  if (!mapping) {
    return fallback ?? type;
  }
  const translated = t(mapping.key, { defaultValue: fallback ?? mapping.defaultValue });
  // Если i18next вернул сам ключ (перевод не найден), используем fallback
  if (translated === mapping.key || translated.startsWith('dashboard.subscriptions.')) {
    return fallback ?? mapping.defaultValue;
  }
  return translated;
};

export const getSubscriptionFeatures = (type: string, t: TFunction, fallback?: string[]): string[] => {
  const map: Record<string, string> = {
    'monthly': 'dashboard.subscriptions.features.monthly',
    'annual': 'dashboard.subscriptions.features.annual',
    'premium': 'dashboard.subscriptions.features.premium',
    'free': 'dashboard.subscriptions.features.free',
  };
  const key = map[type];
  // i18next не хранит массивы напрямую, используем нумерованные ключи до 10 пунктов
  if (!key) return fallback ?? [];
  const features: string[] = [];
  for (let i = 0; i < 10; i++) {
    const k = `${key}.${i}`;
    const v = t(k);
    if (v === k) break;
    features.push(v);
  }
  return features.length ? features : (fallback ?? []);
};


