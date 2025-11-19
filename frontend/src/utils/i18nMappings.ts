import { TFunction } from 'i18next';

export const getDocumentLabel = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, string> = {
    'passport': 'personalData.documents.passportRF',
    'foreign-passport': 'personalData.documents.foreignPassport',
    'driver-license': 'personalData.documents.driverLicense',
    'vehicle-registration': 'personalData.documents.vehicleRegistration',
    'oms': 'personalData.documents.healthInsurance',
    'snils': 'personalData.documents.snils',
  };
  const key = map[type];
  return key ? t(key) : (fallback ?? type);
};

export const getAddressLabel = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, string> = {
    'home': 'personalData.addresses.home',
    'work': 'personalData.addresses.work',
    'other': 'personalData.addresses.other',
  };
  const key = map[type];
  return key ? t(key) : (fallback ?? type);
};

export const getSubscriptionName = (type: string, t: TFunction, fallback?: string): string => {
  const map: Record<string, string> = {
    'monthly': 'dashboard.subscriptions.plan.monthly',
    'annual': 'dashboard.subscriptions.plan.annual',
    'premium': 'dashboard.subscriptions.plan.premium',
    'free': 'dashboard.subscriptions.plan.free',
  };
  const key = map[type];
  return key ? t(key) : (fallback ?? type);
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


